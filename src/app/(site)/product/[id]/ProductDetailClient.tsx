'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Product, FlashSale } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { createClient } from '@/lib/supabase/client';
import { isFlashSaleLive, handleFlashClaim, isSoldOutDiscountActive, getSoldOutDiscountPrice } from '@/lib/flashSale';
import FlashCountdown from '@/components/FlashCountdown';
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
}

export default function ProductDetailClient({ product, relatedProducts, flashSale, flashAlreadyClaimed }: Props) {
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
    <div className="pt-20 pb-12 bg-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 py-4">
          <button onClick={() => router.push('/')} className="hover:text-gray-700">Home</button>
          <ChevronRight className="w-4 h-4 mx-2" />
          <button onClick={() => router.push('/products')} className="hover:text-gray-700">Products</button>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-700 font-medium truncate">{product.name}</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-12">
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
                  <div className="absolute top-4 left-4 bg-white text-red-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
                    <Zap className="w-3.5 h-3.5" />
                    <FlashCountdown target={flashSale!.starts_at} />
                  </div>
                ) : soldOutDiscountLive ? (
                  <div className="absolute top-4 left-4 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
                    <Zap className="w-3.5 h-3.5" />
                    {flashSale!.after_sold_out_discount_percent}% OFF · <FlashCountdown target={flashSale!.after_sold_out_ends_at!} />
                  </div>
                ) : product.inStock ? (
                  <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">In Stock</div>
                ) : (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Out of Stock</div>
                )}
              </div>

              {/* Thumbnails - Desktop */}
              <div className="hidden lg:block space-x-10 sticky top-12 self-start">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative rounded-lg overflow-hidden w-[115px] aspect-square inline-block bg-white ${
                      selectedImage === index ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-300'
                    } transition-all duration-200`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      sizes="115px"
                      className="object-contain"
                    />
                    {selectedImage === index && <div className="absolute inset-0 bg-blue-500 bg-opacity-10" />}
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
                      selectedImage === index ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-300'
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
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>

                {product.highlights && (
                  <div className="mb-6 py-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Highlights</h3>
                    <ul className="space-y-2">
                      {product.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-600">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {flashComingSoon && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 flex items-center gap-2">
                    <Zap className="w-4 h-4 shrink-0" />
                    {flashSale!.coming_soon_message?.trim() || `Flash Sale starting soon — ₹${flashSale!.sale_price.toFixed(2)}!`}
                  </div>
                )}

                {showClaim ? (
                  <>
                    <div className="inline-flex items-center gap-1.5 mb-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                      <Zap className="w-3.5 h-3.5" />
                      Flash Sale — {flashSale!.max_claims - flashSale!.claimed_count} of {flashSale!.max_claims} left
                    </div>
                    <div className="text-2xl font-bold"><del>₹{product.price.toFixed(2)}</del></div>
                    <div className="text-3xl font-bold mb-6 text-red-600">₹{flashSale!.sale_price.toFixed(2)}</div>
                  </>
                ) : soldOutDiscountPrice !== null ? (
                  <>
                    <div className="inline-flex items-center gap-1.5 mb-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                      <Zap className="w-3.5 h-3.5" />
                      {flashSale!.after_sold_out_discount_percent}% off — ends in <FlashCountdown target={flashSale!.after_sold_out_ends_at!} />
                    </div>
                    <div className="text-2xl font-bold"><del>₹{product.price.toFixed(2)}</del></div>
                    <div className="text-3xl font-bold mb-6 text-purple-600">₹{soldOutDiscountPrice.toFixed(2)}</div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold"><del>₹{product.prevprice}</del></div>
                    <div className="text-3xl font-bold mb-6 text-blue-600">₹{product.price.toFixed(2)}</div>
                  </>
                )}

                {/* Quantity */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-16 px-3 py-2 border-t border-b border-gray-300 text-center focus:outline-none"
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="px-3 py-2 border border-gray-300 rounded-r-md bg-gray-50 text-gray-600 hover:bg-gray-100"
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
                    className={`py-3 px-6 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60 ${
                      isInCart ? 'bg-orange-400 hover:bg-orange-500' : showClaim ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                    } text-white transition-colors`}
                  >
                    {showClaim ? <Zap className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                    {isInCart ? 'View Cart' : claiming ? 'Claiming…' : showClaim ? `Claim for ₹${flashSale!.sale_price.toFixed(2)}` : flashComingSoon ? 'Available Soon' : 'Add to Cart'}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowShareOptions(!showShareOptions)}
                      className="py-3 px-6 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center gap-2 text-gray-700 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      Share
                    </button>
                    {showShareOptions && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 p-2">
                        {[
                          { platform: 'facebook', icon: <Facebook className="w-5 h-5 text-blue-600" />, label: 'Facebook' },
                          { platform: 'twitter', icon: <Twitter className="w-5 h-5 text-blue-400" />, label: 'Twitter' },
                          { platform: 'linkedin', icon: <Linkedin className="w-5 h-5 text-blue-700" />, label: 'LinkedIn' },
                          { platform: 'copy', icon: <Copy className="w-5 h-5 text-gray-600" />, label: copied ? 'Copied!' : 'Copy Link' },
                        ].map(({ platform, icon, label }) => (
                          <button
                            key={platform}
                            onClick={() => handleShare(platform)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 rounded-md"
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
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Secure Payment</h4>
                      <p className="text-sm text-green-700">Your payment information is processed securely</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <Package className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-900">Easy Returns</h4>
                      <p className="text-sm text-purple-700">7 day return policy for eligible items</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-12">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {['description', 'specifications'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap capitalize ${
                    activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="mb-4">{product.description}</p>
                <h3 className="text-lg font-semibold mb-3">Features</h3>
                <ul className="space-y-2">
                  {(product.features || ['Premium Quality', 'Durable Construction', 'Ergonomic Design', 'User-Friendly Interface', 'Energy Efficient']).map(
                    (feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <table className="w-full">
                      <tbody>
                        {Object.entries(
                          product.specifications || { Brand: 'Amigo', Model: `AMG-${product.id}`, Warranty: '1 Year', 'Country of Origin': 'India' }
                        ).map(([key, value], index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                            <td className="py-2 px-4 font-medium text-gray-700">{key}</td>
                            <td className="py-2 px-4 text-gray-600">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">What&apos;s in the Box</h4>
                    <ul className="space-y-2">
                      {[product.name, 'User Manual', 'Warranty Card'].map((item) => (
                        <li key={item} className="flex items-center">
                          <Check className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-gray-600">{item}</span>
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
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((related) => (
              <div key={related.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <Link href={`/product/${related.id}`} className="block relative group">
                  <div className="relative w-full aspect-square bg-white">
                    <Image
                      src={related.image}
                      alt={related.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-contain transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                </Link>
                <div className="p-4 bg-slate-300">
                  <Link href={`/product/${related.id}`}>
                    <h3 className="text-lg font-semibold mb-2 hover:text-blue-600 transition-colors">{related.name}</h3>
                  </Link>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-blue-600">₹{related.price.toFixed(2)}</span>
                    <button
                      onClick={async () => {
                        // Route through the same claim flow if this related item happens
                        // to be the flash-sale product — otherwise a different "Add"
                        // button could bypass lead-capture and the login gate entirely.
                        if (related.id === flashSale?.product_id && flashLive && !alreadyClaimed) {
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
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
