'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Product, FlashSale, ProductPromotion } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { createClient } from '@/lib/supabase/client';
import { isFlashSaleLive, handleFlashClaim, isSoldOutDiscountActive, getSoldOutDiscountPrice } from '@/lib/flashSale';
import { getActiveProductPromotion, getProductPromotionPrice, getProductPromotionLabel } from '@/lib/productPromotions';
import ProductCard, { ProductBadge, ProductBadgeProps } from '@/components/ProductCard';
import {
  ShoppingCart,
  Share2,
  Shield,
  Package,
  ChevronRight,
  Check,
  Zap,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
} from 'lucide-react';

interface Props {
  product: Product;
  relatedProducts: Product[];
  flashSale: FlashSale | null;
  flashAlreadyClaimed: boolean;
  productPromotions: ProductPromotion[];
}

export default function ProductDetailClient({ product, relatedProducts, flashSale, flashAlreadyClaimed, productPromotions }: Props) {
  const router = useRouter();
  const { addToCart, cart } = useCartStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const isFlashProduct = flashSale?.product_id === product.id;
  const [flashLive, setFlashLive] = useState(() => isFlashProduct && isFlashSaleLive(flashSale));
  const [alreadyClaimed, setAlreadyClaimed] = useState(flashAlreadyClaimed);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [claiming, setClaiming] = useState(false);

  const showClaim = isFlashProduct && flashLive && !alreadyClaimed;
  // Re-evaluated on every render (not memoized) so it naturally flips to false the moment
  // flashLive's own scheduled timer fires, with no separate timer needed here.
  const flashComingSoon = isFlashProduct && !!flashSale && !flashLive && new Date(flashSale.starts_at) > new Date();

  // Second flash-sale phase: once claim slots are gone, an admin-configured %-off can
  // apply to everyone (no login/claim gating) until a configured end time. Tracked as
  // its own scheduled-flip state, mirroring flashLive, so it turns off automatically at
  // the exact end moment instead of needing a fresh page load.
  const [soldOutDiscountLive, setSoldOutDiscountLive] = useState(() => isFlashProduct && isSoldOutDiscountActive(flashSale));
  useEffect(() => {
    if (!soldOutDiscountLive || !flashSale?.after_sold_out_ends_at) return;
    const msUntilEnd = new Date(flashSale.after_sold_out_ends_at).getTime() - Date.now();
    if (msUntilEnd <= 0) { setSoldOutDiscountLive(false); return; }
    const timer = setTimeout(() => setSoldOutDiscountLive(false), msUntilEnd);
    return () => clearTimeout(timer);
  }, [soldOutDiscountLive, flashSale]);
  const soldOutDiscountPrice = soldOutDiscountLive && flashSale ? getSoldOutDiscountPrice(flashSale, product.price) : null;

  // Per-product promotion — independent of the Flash Sale, excluded here for whichever
  // product currently *is* the flash-sale product to avoid the two overlapping.
  const [promoTick, setPromoTick] = useState(0);
  const activePromotion = !isFlashProduct ? getActiveProductPromotion(productPromotions, product.id) : null;
  useEffect(() => {
    if (isFlashProduct || productPromotions.length === 0) return;
    const now = Date.now();
    const transitions = productPromotions
      .flatMap((pp) => [new Date(pp.starts_at).getTime(), new Date(pp.ends_at).getTime()])
      .filter((t) => t > now);
    if (transitions.length === 0) return;
    const timer = setTimeout(() => setPromoTick((n) => n + 1), Math.min(...transitions) - now);
    return () => clearTimeout(timer);
  }, [isFlashProduct, productPromotions, promoTick]);
  const promotionPrice = activePromotion?.discount_percent ? getProductPromotionPrice(product.price, activePromotion) : null;

  // The Coming-Soon -> Live transition is time-based, not event-based — schedule it to
  // flip at the exact moment rather than polling, so it's immune to this page's ISR cache.
  useEffect(() => {
    if (!isFlashProduct || !flashSale || flashLive) return;
    const msUntilStart = new Date(flashSale.starts_at).getTime() - Date.now();
    if (msUntilStart <= 0) return;
    const timer = setTimeout(() => setFlashLive(isFlashSaleLive(flashSale)), msUntilStart);
    return () => clearTimeout(timer);
  }, [isFlashProduct, flashSale, flashLive]);

  useEffect(() => {
    if (!isFlashProduct) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setLoggedIn(!!user));
  }, [isFlashProduct]);

  // Resumes a claim after the login redirect (?claim=1) sends the customer back here.
  // Read via window.location rather than useSearchParams() to avoid a Suspense boundary
  // requirement for what's just a one-time client-only check.
  useEffect(() => {
    if (!showClaim) return;
    if (typeof window === 'undefined' || !window.location.search.includes('claim=1')) return;
    const goToCart = window.location.search.includes('goto=cart');
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setClaiming(true);
      await handleFlashClaim({
        isLoggedIn: true,
        productPath: `/product/${product.id}`,
        onLoginRequired: () => {},
        onClaimed: () => {
          addToCart(product);
          setAlreadyClaimed(false);
          toast.success(`${product.name} added to cart at the flash price!`);
        },
        onError: (message) => toast.error(message),
      });
      setClaiming(false);
      // The homepage ad tags its login redirect with goto=cart since the point of
      // clicking it is to check out, not linger on the product page.
      router.replace(goToCart ? '/cart' : `/product/${product.id}`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showClaim]);

  const handleClaimClick = async () => {
    setClaiming(true);
    await handleFlashClaim({
      isLoggedIn: !!loggedIn,
      productPath: `/product/${product.id}`,
      onLoginRequired: (url) => router.push(url),
      onClaimed: () => {
        addToCart(product);
        toast.success(`${product.name} added to cart at the flash price!`);
      },
      onError: (message) => toast.error(message),
    });
    setClaiming(false);
  };

  const getProductImages = (prod: Product) => {
    if (prod.images && prod.images.length >= 4) return prod.images;
    return [
      prod.image,
      'https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    ];
  };

  const productImages = getProductImages(product);
  const isInCart = cart.some((item) => item.id === product.id);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addToCart(product);
    toast.success(`${quantity > 1 ? `${quantity} × ` : ''}${product.name} added to cart`);
  };

  const handleShare = (platform: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `Check out this ${product.name} on Amigo Calculators!`;
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        break;
    }

    if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
    if (platform !== 'copy') setShowShareOptions(false);
  };

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setActiveTab('description');
    window.scrollTo(0, 0);
  }, [product.id]);

  return (
    <div className="pt-20 pb-12 bg-paper">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-ink-muted py-4">
          <button onClick={() => router.push('/')} className="hover:text-ink">Home</button>
          <ChevronRight className="w-4 h-4 mx-2" />
          <button onClick={() => router.push('/products')} className="hover:text-ink">Products</button>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-ink font-medium truncate">{product.name}</span>
        </div>

        <div className="bg-white rounded-xl border border-border-soft shadow-sm overflow-hidden mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div className="lg:col-span-1">
              <div className="relative aspect-square bg-white rounded-xl overflow-hidden mb-4">
                <Image
                  src={productImages[selectedImage]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain transition-transform duration-300 hover:scale-105"
                  priority
                />
                {flashComingSoon ? (
                  <ProductBadge label="Starts Soon" tone="gray" countdownTarget={flashSale!.starts_at} className="absolute top-4 left-4" />
                ) : soldOutDiscountLive ? (
                  <ProductBadge label={`${flashSale!.after_sold_out_discount_percent}% OFF`} tone="wine" countdownTarget={flashSale!.after_sold_out_ends_at!} className="absolute top-4 left-4" />
                ) : activePromotion ? (
                  <ProductBadge label={getProductPromotionLabel(activePromotion)} tone="wine" countdownTarget={activePromotion.ends_at} className="absolute top-4 left-4" />
                ) : !product.inStock ? (
                  <ProductBadge label="Out of Stock" tone="gray" className="absolute top-4 left-4" />
                ) : null}
              </div>

              {/* Thumbnails - Desktop */}
              <div className="hidden lg:block space-x-10 sticky top-12 self-start">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative rounded-lg overflow-hidden w-[115px] aspect-square inline-block bg-white ${
                      selectedImage === index ? 'ring-2 ring-accent-500' : 'hover:ring-2 hover:ring-accent-400'
                    } transition-all duration-200`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      sizes="115px"
                      className="object-contain"
                    />
                    {selectedImage === index && <div className="absolute inset-0 bg-accent-500 bg-opacity-10" />}
                  </button>
                ))}
              </div>

              {/* Thumbnails - Mobile */}
              <div className="grid grid-cols-4 gap-2 lg:hidden">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative rounded-lg overflow-hidden aspect-square bg-white ${
                      selectedImage === index ? 'ring-2 ring-accent-500' : 'hover:ring-2 hover:ring-accent-400'
                    } transition-all duration-200`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      sizes="25vw"
                      className="object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:col-span-1 space-y-6 lg:pl-24">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 text-ink">{product.name}</h1>

                {product.highlights && (
                  <div className="mb-6 py-4">
                    <h3 className="text-sm font-medium text-ink mb-3">Highlights</h3>
                    <ul className="space-y-2">
                      {product.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-accent-600 mr-2 shrink-0" />
                          <span className="text-ink-muted">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {flashComingSoon && (
                  <div className="mb-4 p-3 bg-blush/40 border border-badge/20 rounded-lg text-sm text-badge flex items-center gap-2">
                    <Zap className="w-4 h-4 shrink-0" />
                    {flashSale!.coming_soon_message?.trim() || `Flash Sale starting soon — ₹${flashSale!.sale_price.toFixed(2)}!`}
                  </div>
                )}

                {showClaim ? (
                  <>
                    <ProductBadge label={`Flash Sale — ${flashSale!.max_claims - flashSale!.claimed_count} of ${flashSale!.max_claims} left`} tone="wine" className="mb-2" />
                    <div className="text-2xl font-bold text-ink-muted"><del>₹{product.price.toFixed(2)}</del></div>
                    <div className="text-3xl font-bold mb-6 text-ink">₹{flashSale!.sale_price.toFixed(2)}</div>
                  </>
                ) : soldOutDiscountPrice !== null ? (
                  <>
                    <ProductBadge label={`${flashSale!.after_sold_out_discount_percent}% off`} tone="wine" countdownTarget={flashSale!.after_sold_out_ends_at!} className="mb-2" />
                    <div className="text-2xl font-bold text-ink-muted"><del>₹{product.price.toFixed(2)}</del></div>
                    <div className="text-3xl font-bold mb-6 text-ink">₹{soldOutDiscountPrice.toFixed(2)}</div>
                  </>
                ) : promotionPrice !== null ? (
                  <>
                    <ProductBadge label={getProductPromotionLabel(activePromotion!)} tone="wine" countdownTarget={activePromotion!.ends_at} className="mb-2" />
                    <div className="text-2xl font-bold text-ink-muted"><del>₹{product.price.toFixed(2)}</del></div>
                    <div className="text-3xl font-bold mb-6 text-ink">₹{promotionPrice.toFixed(2)}</div>
                  </>
                ) : activePromotion ? (
                  <>
                    <ProductBadge label={getProductPromotionLabel(activePromotion)} tone="wine" countdownTarget={activePromotion.ends_at} className="mb-2" />
                    <div className="text-3xl font-bold mb-6 text-ink">₹{product.price.toFixed(2)}</div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-ink-muted"><del>₹{product.prevprice}</del></div>
                    <div className="text-3xl font-bold mb-6 text-ink">₹{product.price.toFixed(2)}</div>
                  </>
                )}

                {/* Quantity */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-ink mb-2">Quantity</label>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="px-3 py-2 border border-border-soft rounded-l-md bg-blush/20 text-ink hover:bg-blush/40 disabled:opacity-50"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-16 px-3 py-2 border-t border-b border-border-soft text-center text-ink focus:outline-none"
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="px-3 py-2 border border-border-soft rounded-r-md bg-blush/20 text-ink hover:bg-blush/40"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <button
                    onClick={isInCart ? () => router.push('/cart') : showClaim ? handleClaimClick : handleAddToCart}
                    disabled={!product.inStock || claiming || flashComingSoon}
                    className={`py-3 px-6 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60 font-semibold transition-colors ${
                      isInCart ? 'bg-ink text-white hover:bg-ink/90' : showClaim ? 'bg-badge text-white hover:bg-badge-dark' : 'bg-accent-500 text-ink hover:bg-accent-600'
                    }`}
                  >
                    {showClaim ? <Zap className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                    {isInCart ? 'View Cart' : claiming ? 'Claiming…' : showClaim ? `Claim for ₹${flashSale!.sale_price.toFixed(2)}` : flashComingSoon ? 'Available Soon' : 'Add to Cart'}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowShareOptions(!showShareOptions)}
                      className="py-3 px-6 rounded-lg border border-border-soft bg-white hover:bg-blush/40 flex items-center justify-center gap-2 text-ink transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      Share
                    </button>
                    {showShareOptions && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-border-soft z-10 p-2">
                        {[
                          { platform: 'facebook', icon: <Facebook className="w-5 h-5 text-ink-muted" />, label: 'Facebook' },
                          { platform: 'twitter', icon: <Twitter className="w-5 h-5 text-ink-muted" />, label: 'Twitter' },
                          { platform: 'linkedin', icon: <Linkedin className="w-5 h-5 text-ink-muted" />, label: 'LinkedIn' },
                          { platform: 'copy', icon: <Copy className="w-5 h-5 text-ink-muted" />, label: copied ? 'Copied!' : 'Copy Link' },
                        ].map(({ platform, icon, label }) => (
                          <button
                            key={platform}
                            onClick={() => handleShare(platform)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-left text-ink hover:bg-blush/40 rounded-md"
                          >
                            {icon}
                            <span>{label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blush/40 rounded-lg">
                    <Shield className="w-5 h-5 text-accent-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-ink">Secure Payment</h4>
                      <p className="text-sm text-ink-muted">Your payment information is processed securely</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blush/40 rounded-lg">
                    <Package className="w-5 h-5 text-accent-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-ink">Easy Returns</h4>
                      <p className="text-sm text-ink-muted">7 day return policy for eligible items</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-xl border border-border-soft shadow-sm overflow-hidden mb-12">
          <div className="border-b border-border-soft">
            <div className="flex overflow-x-auto">
              {['description', 'specifications'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap capitalize ${
                    activeTab === tab ? 'border-b-2 border-accent-500 text-accent-600' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none text-ink">
                <p className="mb-4">{product.description}</p>
                <h3 className="text-lg font-semibold mb-3">Features</h3>
                <ul className="space-y-2">
                  {(product.features || ['Premium Quality', 'Durable Construction', 'Ergonomic Design', 'User-Friendly Interface', 'Energy Efficient']).map(
                    (feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-accent-600 mr-2 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-ink">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blush/20 rounded-lg p-4">
                    <table className="w-full">
                      <tbody>
                        {Object.entries(
                          product.specifications || { Brand: 'Amigo', Model: `AMG-${product.id}`, Warranty: '1 Year', 'Country of Origin': 'India' }
                        ).map(([key, value], index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-blush/30' : ''}>
                            <td className="py-2 px-4 font-medium text-ink">{key}</td>
                            <td className="py-2 px-4 text-ink-muted">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3 text-ink">What&apos;s in the Box</h4>
                    <ul className="space-y-2">
                      {[product.name, 'User Manual', 'Warranty Card'].map((item) => (
                        <li key={item} className="flex items-center">
                          <Check className="w-5 h-5 text-accent-600 mr-2" />
                          <span className="text-ink-muted">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mb-12 px-6">
          <h2 className="text-2xl font-bold mb-6 text-ink">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((related) => {
              const isRelatedClaimableFlash = related.id === flashSale?.product_id && flashLive && !alreadyClaimed;
              const price = isRelatedClaimableFlash
                ? { current: flashSale!.sale_price, original: related.price }
                : { current: related.price, original: related.prevprice !== related.price ? related.prevprice : undefined };
              const badge: ProductBadgeProps | undefined = isRelatedClaimableFlash ? { label: 'Flash Sale', tone: 'wine' } : undefined;

              return (
                <ProductCard
                  key={related.id}
                  product={related}
                  price={price}
                  badge={badge}
                  addToCartDisabled={related.inStock === false}
                  addToCartLabel={isRelatedClaimableFlash ? `Claim for ₹${flashSale!.sale_price}` : undefined}
                  onAddToCart={async () => {
                    // Route through the same claim flow if this related item happens
                    // to be the flash-sale product — otherwise a different "Add"
                    // button could bypass lead-capture and the login gate entirely.
                    if (isRelatedClaimableFlash) {
                      await handleFlashClaim({
                        isLoggedIn: !!loggedIn,
                        productPath: `/product/${related.id}`,
                        onLoginRequired: (url) => router.push(url),
                        onClaimed: () => { addToCart(related); toast.success(`${related.name} added to cart at the flash price!`); router.push(`/product/${related.id}`); },
                        onError: (message) => toast.error(message),
                      });
                      return;
                    }
                    addToCart(related);
                    toast.success(`${related.name} added to cart`);
                    router.push(`/product/${related.id}`);
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
