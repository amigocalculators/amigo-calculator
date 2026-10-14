'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from 'react-hot-toast';
import { Product, FlashSale, ProductPromotion } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { createClient } from '@/lib/supabase/client';
import { getFlashSaleStatus, isFlashSaleLive, handleFlashClaim, isSoldOutDiscountActive, getSoldOutDiscountPrice } from '@/lib/flashSale';
import { getActiveProductPromotion, getProductPromotionPrice, getProductPromotionLabel } from '@/lib/productPromotions';
import { PRODUCT_CATEGORIES } from '@/data/categories';
import ProductCard, { ProductBadgeProps } from '@/components/ProductCard';
import {
  Search,
  X,
  SlidersHorizontal,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const ContactForm = dynamic(() => import('@/components/ContactForm'));

const priceRanges = [
  { value: '0-200', label: '₹0 - ₹200' },
  { value: '200-300', label: '₹200 - ₹300' },
  { value: '300-400', label: '₹300 - ₹400' },
  { value: '400-500', label: '₹400 - ₹500' },
  { value: '500-100000', label: 'Above ₹500' },
];

export default function ProductsClient({ products, productPromotions, initialFlashSale = null }: {
  products: Product[]; productPromotions: ProductPromotion[]; initialFlashSale?: FlashSale | null;
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [expandedSections, setExpandedSections] = useState({ categories: true, price: true });
  const [flashSale, setFlashSale] = useState<FlashSale | null>(initialFlashSale);
  const [flashAlreadyClaimed, setFlashAlreadyClaimed] = useState(false);
  const [flashLive, setFlashLive] = useState(() => isFlashSaleLive(initialFlashSale));
  const [loggedIn, setLoggedIn] = useState(false);

  const { addToCart } = useCartStore();

  useEffect(() => {
    getFlashSaleStatus().then(({ sale, alreadyClaimed }) => {
      setFlashSale(sale);
      setFlashAlreadyClaimed(alreadyClaimed);
      setFlashLive(isFlashSaleLive(sale));
    });
    createClient().auth.getUser().then(({ data: { user } }) => setLoggedIn(!!user));
  }, []);

  // Pre-fill from the navbar search box / category tile links (?q=, ?category=) —
  // read on mount rather than via useSearchParams() so this page doesn't need a
  // Suspense boundary just for a one-time initial value.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const category = params.get('category');
    if (q) setSearchTerm(q);
    if (category && PRODUCT_CATEGORIES.includes(category)) setSelectedCategories([category]);
  }, []);

  // The Coming-Soon -> Live transition is time-based, not event-based — schedule it to
  // flip at the exact moment rather than polling, mirroring ProductDetailClient.
  useEffect(() => {
    if (!flashSale || flashLive) return;
    const msUntilStart = new Date(flashSale.starts_at).getTime() - Date.now();
    if (msUntilStart <= 0) return;
    const timer = setTimeout(() => setFlashLive(isFlashSaleLive(flashSale)), msUntilStart);
    return () => clearTimeout(timer);
  }, [flashSale, flashLive]);

  // isSoldOutDiscount() re-checks the end time fresh on every call, so this just needs
  // to force one re-render at the exact moment the after-sold-out discount ends.
  const [, forceRerender] = useState(0);
  useEffect(() => {
    if (!flashSale?.after_sold_out_ends_at) return;
    const msUntilEnd = new Date(flashSale.after_sold_out_ends_at).getTime() - Date.now();
    if (msUntilEnd <= 0) return;
    const timer = setTimeout(() => forceRerender((n) => n + 1), msUntilEnd);
    return () => clearTimeout(timer);
  }, [flashSale]);

  const isClaimableFlash = (product: Product) =>
    product.id === flashSale?.product_id && flashLive && !flashAlreadyClaimed;

  const isComingSoonFlash = (product: Product) =>
    product.id === flashSale?.product_id && !!flashSale?.enabled && !flashLive && new Date(flashSale.starts_at) > new Date();

  // Second flash-sale phase: once claim slots are gone, an admin-configured %-off
  // applies to everyone until a configured end time — see ProductDetailClient for
  // the matching per-product-page treatment.
  const isSoldOutDiscount = (product: Product) =>
    product.id === flashSale?.product_id && isSoldOutDiscountActive(flashSale);

  // Per-product promotion — independent of the Flash Sale product, which keeps its own
  // pricing/badges above and is excluded here to avoid the two overlapping.
  const activePromotionFor = (product: Product): ProductPromotion | null =>
    product.id !== flashSale?.product_id ? getActiveProductPromotion(productPromotions, product.id) : null;

  // Re-render at the next promotion start/end across the whole catalog, then reschedule
  // for the one after that — so a badge appears/disappears live without a page reload.
  const [saleTick, setSaleTick] = useState(0);
  useEffect(() => {
    const now = Date.now();
    const upcoming = productPromotions
      .flatMap((pp) => [pp.starts_at, pp.ends_at])
      .map((t) => new Date(t).getTime())
      .filter((t) => t > now);
    if (upcoming.length === 0) return;
    const timer = setTimeout(() => setSaleTick((n) => n + 1), Math.min(...upcoming) - now);
    return () => clearTimeout(timer);
  }, [productPromotions, saleTick]);

  const handleAddToCart = async (product: Product) => {
    if (isClaimableFlash(product)) {
      await handleFlashClaim({
        isLoggedIn: loggedIn,
        productPath: `/product/${product.id}`,
        onLoginRequired: (url) => router.push(url),
        onClaimed: () => {
          addToCart(product);
          toast.success(`${product.name} added to cart at the flash price!`);
        },
        onError: (message) => toast.error(message),
      });
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  // Resolves the single badge + price pair shown on a product's card — flash sale
  // (coming soon / live / sold-out-discount) takes priority over a regular
  // per-product promotion, which takes priority over the plain MRP strikethrough.
  const resolveCardDisplay = (product: Product): { badge?: ProductBadgeProps; price: { current: number; original?: number } } => {
    if (isComingSoonFlash(product)) {
      return { badge: { label: 'Starts Soon', tone: 'gray', countdownTarget: flashSale!.starts_at }, price: { current: product.price } };
    }
    if (isClaimableFlash(product)) {
      return { badge: { label: 'Flash Sale', tone: 'wine' }, price: { current: flashSale!.sale_price, original: product.price } };
    }
    if (isSoldOutDiscount(product)) {
      return {
        badge: { label: `${flashSale!.after_sold_out_discount_percent}% OFF`, tone: 'wine', countdownTarget: flashSale!.after_sold_out_ends_at! },
        price: { current: getSoldOutDiscountPrice(flashSale!, product.price), original: product.price },
      };
    }
    const promo = activePromotionFor(product);
    if (promo) {
      return {
        badge: { label: getProductPromotionLabel(promo), tone: 'wine', countdownTarget: promo.ends_at },
        price: promo.discount_percent
          ? { current: getProductPromotionPrice(product.price, promo), original: product.price }
          : { current: product.price, original: product.prevprice !== product.price ? product.prevprice : undefined },
      };
    }
    return { price: { current: product.price, original: product.prevprice !== product.price ? product.prevprice : undefined } };
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section as keyof typeof prev] }));
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handlePriceRangeChange = (range: { value: string; label: string }) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(range.value) ? prev.filter((r) => r !== range.value) : [...prev, range.value]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRanges([]);
    setSearchTerm('');
    setSortBy('featured');
  };

  const hasActiveFilters =
    selectedCategories.length > 0 || selectedPriceRanges.length > 0 || searchTerm;

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(product.category ?? '');
      const matchesPriceRange =
        selectedPriceRanges.length === 0 ||
        selectedPriceRanges.some((range) => {
          const [min, max] = range.split('-').map(Number);
          return product.price >= min && product.price <= max;
        });
      return matchesSearch && matchesCategory && matchesPriceRange;
    })
    .sort((a, b) => {
      // The flash-sale product always floats to the front, regardless of sort order —
      // it stays pinned for the whole campaign (including its "Coming Soon" phase),
      // not just while it's actually purchasable at the flash price.
      const aIsFlash = flashSale?.enabled && a.id === flashSale.product_id ? 1 : 0;
      const bIsFlash = flashSale?.enabled && b.id === flashSale.product_id ? 1 : 0;
      if (aIsFlash !== bIsFlash) return bIsFlash - aIsFlash;
      switch (sortBy) {
        case 'price-low-high': return a.price - b.price;
        case 'price-high-low': return b.price - a.price;
        case 'name-a-z': return a.name.localeCompare(b.name);
        case 'name-z-a': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });

  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ink-muted pointer-events-none" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border-2 border-border-soft rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-400 transition-all duration-200 bg-blush/30 hover:bg-white"
        />
      </div>

      {/* Categories */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-ink">Categories</h3>
          <button onClick={() => toggleSection('categories')} className="p-1 hover:bg-blush/60 rounded-lg transition-colors">
            {expandedSections.categories ? <ChevronUp className="w-5 h-5 text-ink-muted" /> : <ChevronDown className="w-5 h-5 text-ink-muted" />}
          </button>
        </div>
        {expandedSections.categories && (
          <div className="space-y-3">
            {PRODUCT_CATEGORIES.map((category) => (
              <label key={category} className="flex items-center gap-3 cursor-pointer group py-1">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="w-5 h-5 rounded-lg border-2 border-border-soft text-accent-500 focus:ring-2 focus:ring-accent-500"
                  />
                  {selectedCategories.includes(category) && (
                    <Check className="w-3 h-3 text-ink absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
                <span className="text-ink group-hover:text-accent-600 transition-colors">{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Ranges */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-ink">Price Range</h3>
          <button onClick={() => toggleSection('price')} className="p-1 hover:bg-blush/60 rounded-lg transition-colors">
            {expandedSections.price ? <ChevronUp className="w-5 h-5 text-ink-muted" /> : <ChevronDown className="w-5 h-5 text-ink-muted" />}
          </button>
        </div>
        {expandedSections.price && (
          <div className="space-y-3">
            {priceRanges.map((range) => (
              <label key={range.value} className="flex items-center gap-3 cursor-pointer group py-1">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedPriceRanges.includes(range.value)}
                    onChange={() => handlePriceRangeChange(range)}
                    className="w-5 h-5 rounded-lg border-2 border-border-soft text-accent-500 focus:ring-2 focus:ring-accent-500"
                  />
                  {selectedPriceRanges.includes(range.value) && (
                    <Check className="w-3 h-3 text-ink absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
                <span className="text-ink group-hover:text-accent-600 transition-colors">{range.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper pt-16 pb-8">
      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="py-4">
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
            <div>
              <button
                onClick={() => setShowFilters(true)}
                className="md:hidden flex items-center gap-2 px-5 py-3 bg-blush/60 rounded-xl hover:bg-blush transition-colors duration-200 text-accent-600"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden md:block w-72 shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 backdrop-blur-lg bg-opacity-90">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-semibold text-ink">Filters</h2>
                {hasActiveFilters && (
                  <button onClick={clearAllFilters} className="text-sm text-accent-600 hover:text-accent-700 font-medium">
                    Clear All
                  </button>
                )}
              </div>
              <FilterPanel />
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  const { badge, price } = resolveCardDisplay(product);
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      badge={badge}
                      price={price}
                      addToCartDisabled={!product.inStock || isComingSoonFlash(product)}
                      addToCartLabel={isClaimableFlash(product) ? `Claim for ₹${flashSale!.sale_price}` : undefined}
                      onAddToCart={() => handleAddToCart(product)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                <Search className="w-20 h-20 text-ink-muted mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-ink mb-3">No products found</h3>
                <p className="text-ink-muted mb-8 max-w-md mx-auto">
                  Try adjusting your filters or search term
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-8 py-3 bg-accent-500 text-ink rounded-xl hover:bg-accent-600 transition-colors duration-200 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 right-36 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300">
            <div className="flex items-center justify-between p-6 border-b border-border-soft">
              <h2 className="text-xl font-semibold text-ink">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-blush/60 rounded-xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
              <FilterPanel />
            </div>
            <div className="border-t border-border-soft p-6">
              <button
                onClick={() => setShowFilters(false)}
                className="w-full bg-accent-500 text-ink py-4 rounded-xl hover:bg-accent-600 transition-colors font-medium text-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <ContactForm
        isOpen={showContactForm}
        onClose={() => setShowContactForm(!showContactForm)}
      />
    </div>
  );
}
