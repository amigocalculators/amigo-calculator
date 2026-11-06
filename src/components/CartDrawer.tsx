'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  X, Minus, Plus, Trash2, Gift, Percent, Zap, Tag, ChevronDown, ChevronUp, Lock,
  ShoppingBag, CreditCard, Smartphone, Building2, Wallet, Check,
} from 'lucide-react';
import { Promotion, FlashSale, ProductPromotion, CouponCode } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { getActiveGiftPromotions, isFreeGiftItem } from '@/lib/promotions';
import { getProductPromotions } from '@/lib/productPromotions';
import { getActiveCoupons, describeDiscount, describeCouponRejection } from '@/lib/couponCodes';
import { calculateOrderPricing } from '@/lib/orderPricing';
import { getFlashSaleStatus, isFlashSaleLive } from '@/lib/flashSale';
import { createClient } from '@/lib/supabase/client';

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, isDrawerOpen, closeDrawer, selectedOfferType, couponCode, setCouponCode } = useCartStore();
  const router = useRouter();

  const [giftPromotions, setGiftPromotions] = useState<Promotion[]>([]);
  const [productPromotions, setProductPromotions] = useState<ProductPromotion[]>([]);
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null);
  const [flashAlreadyClaimed, setFlashAlreadyClaimed] = useState(false);
  const [tiers, setTiers] = useState<CouponCode[]>([]);
  const [manualCoupons, setManualCoupons] = useState<CouponCode[]>([]);
  const [showAllCoupons, setShowAllCoupons] = useState(false);
  const [dealsExpanded, setDealsExpanded] = useState(false);
  const [applyingCode, setApplyingCode] = useState<string | null>(null);
  const [couponFeedback, setCouponFeedback] = useState<{ code: string; message: string } | null>(null);

  useEffect(() => {
    getActiveGiftPromotions().then(setGiftPromotions);
    getProductPromotions().then(setProductPromotions);
    getFlashSaleStatus().then(({ sale, alreadyClaimed }) => {
      setFlashSale(sale);
      setFlashAlreadyClaimed(alreadyClaimed);
    });
    getActiveCoupons().then((coupons) => {
      setTiers(coupons.filter((c) => c.auto_apply));
      setManualCoupons(coupons.filter((c) => !c.auto_apply));
    });
  }, []);

  // Scroll-lock + Escape-to-close while the drawer is open — ContactForm (the only other
  // slide-in panel in this codebase) doesn't need either since it never blocks the page
  // behind it the way a cart drawer should.
  useEffect(() => {
    if (!isDrawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer(); };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isDrawerOpen, closeDrawer]);

  const eligibleGifts = cart.length > 0 ? giftPromotions : [];
  const flashEligible = isFlashSaleLive(flashSale) && !flashAlreadyClaimed;
  const appliedCoupon = couponCode ? manualCoupons.find((c) => c.code === couponCode) ?? null : null;

  const pricing = calculateOrderPricing({
    cart,
    productPromotions,
    eligibleGiftPromotions: eligibleGifts,
    selectedOfferType,
    flashSale,
    flashEligible,
    coupon: appliedCoupon,
    tiers,
  });

  const displayCart = pricing.giftItem ? [...cart, pricing.giftItem] : cart;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const highestTier = tiers.length > 0 ? tiers[tiers.length - 1] : null;
  const tierFillPercent = highestTier ? Math.min(100, (pricing.subtotal / highestTier.min_cart_total) * 100) : 0;
  const percentOff = pricing.subtotal > 0 ? Math.round((pricing.discount / pricing.subtotal) * 100) : 0;

  const applyCoupon = async (code: string) => {
    setApplyingCode(code);
    setCouponFeedback(null);
    try {
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cart: cart.map((item) => ({ id: item.id, quantity: item.quantity })) }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setCouponCode(code.toUpperCase());
      } else {
        setCouponFeedback({ code, message: describeCouponRejection(data) });
      }
    } catch {
      setCouponFeedback({ code, message: 'Failed to apply coupon. Try again.' });
    } finally {
      setApplyingCode(null);
    }
  };

  const handleProceedToPay = async () => {
    closeDrawer();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    router.push(user ? '/checkout' : '/account/login?next=/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isDrawerOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        onClick={closeDrawer}
        className={`fixed inset-0 bg-black/50 z-40 ${isDrawerOpen ? '' : 'pointer-events-none'}`}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isDrawerOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 24, stiffness: 220 }}
        className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> My Cart ({itemCount} {itemCount === 1 ? 'Product' : 'Products'})
          </h2>
          <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything yet.</p>
            <button
              onClick={() => { closeDrawer(); router.push('/products'); }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              {/* Tier progress bar */}
              {tiers.length > 0 && (
                <div className="m-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                  <p className="text-sm font-semibold text-gray-800 mb-3">
                    {pricing.nextTier
                      ? <>Add products worth <span className="text-blue-700">₹{(pricing.nextTier.min_cart_total - pricing.subtotal).toFixed(2)}</span> more to get Extra {describeDiscount(pricing.nextTier)}</>
                      : <>You&apos;ve unlocked the best offer — Extra {describeDiscount(pricing.appliedTier!)}!</>}
                  </p>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden mb-3">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500" style={{ width: `${tierFillPercent}%` }} />
                  </div>
                  <div className="flex justify-between">
                    {tiers.map((tier) => {
                      const reached = pricing.subtotal >= tier.min_cart_total;
                      return (
                        <div key={tier.id} className="flex flex-col items-center gap-1 text-center w-1/3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${reached ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                            <Gift className="w-3.5 h-3.5" />
                          </div>
                          <span className={`text-[11px] font-medium ${reached ? 'text-blue-700' : 'text-gray-400'}`}>
                            Extra {describeDiscount(tier)} on ₹{tier.min_cart_total}+
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {!pricing.nextTier && (
                    <div className="mt-3 text-center text-xs font-bold text-blue-700 bg-blue-100 rounded-full py-1.5">
                      🎉 Limited time offer applied!
                    </div>
                  )}
                </div>
              )}

              {/* Line items */}
              <div className="px-4 space-y-3">
                {displayCart.map((item) => {
                  if (isFreeGiftItem(item)) {
                    return (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-green-100 flex items-center justify-center"><Gift className="w-6 h-6 text-green-600" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">Free gift with your order</p>
                        </div>
                        <span className="text-sm font-bold text-green-600">FREE</span>
                      </div>
                    );
                  }

                  const line = pricing.lines.find((l) => l.id === item.id);
                  const flashUnits = line?.flashUnits ?? 0;
                  const freeUnits = line?.freeUnits ?? 0;
                  const paidUnits = line?.paidUnits ?? item.quantity;
                  const saved = item.prevprice > item.price ? (item.prevprice - item.price) * paidUnits : 0;

                  return (
                    <div key={item.id} className="flex gap-3 p-3 rounded-lg border border-gray-100">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-sm font-bold">₹{item.price.toFixed(2)}</span>
                          {item.prevprice > item.price && <span className="text-xs text-gray-400 line-through">₹{item.prevprice.toFixed(2)}</span>}
                        </div>
                        {saved > 0 && <p className="text-xs text-green-600 font-medium">₹{saved.toFixed(2)} saved!</p>}
                        {flashUnits > 0 && <p className="text-xs text-red-600 font-semibold flex items-center gap-1"><Zap className="w-3 h-3" />{flashUnits} @ flash price</p>}
                        {freeUnits > 0 && <p className="text-xs text-green-600 font-semibold flex items-center gap-1"><Gift className="w-3 h-3" />{freeUnits} FREE</p>}

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border rounded-lg overflow-hidden">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-100">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-100">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Available Coupons */}
              {manualCoupons.length > 0 && (
                <div className="mt-5 px-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold flex items-center gap-1.5"><Tag className="w-4 h-4" />Available Coupons</p>
                    <button onClick={() => setShowAllCoupons((v) => !v)} className="text-xs text-blue-600 hover:underline font-medium">
                      {showAllCoupons ? 'Show less' : 'View all Coupons'}
                    </button>
                  </div>
                  <div className={showAllCoupons ? 'flex flex-col gap-2' : 'flex gap-2 overflow-x-auto pb-2'}>
                    {manualCoupons.map((coupon) => {
                      const isCurrentSelection = couponCode === coupon.code;
                      // couponCode can be stale — stored from an earlier, bigger cart that
                      // has since shrunk (e.g. items removed one at a time rather than via
                      // an explicit clear-cart). calculateOrderPricing already excludes a
                      // no-longer-valid coupon from the total via couponRejectReason; the
                      // card's "Applied" badge must agree with that, not just with whether
                      // the code string is still sitting in the store.
                      const hasActiveCoupon = !!couponCode && !pricing.couponRejectReason;
                      const applied = isCurrentSelection && hasActiveCoupon;
                      const met = pricing.subtotal >= coupon.min_cart_total;
                      const blockedByCombinability = !coupon.combinable_with_other_offers
                        && (pricing.flashDiscount > 0 || pricing.productPromotionDiscount > 0 || pricing.giftItem !== null || pricing.tierDiscount > 0);
                      const blockedByOtherCoupon = hasActiveCoupon && !isCurrentSelection;
                      const eligible = met && !blockedByCombinability && !blockedByOtherCoupon && !applied;
                      const feedback = couponFeedback?.code === coupon.code ? couponFeedback.message : null;

                      let hint = '';
                      if (!applied) {
                        if (!met) hint = `Add ₹${(coupon.min_cart_total - pricing.subtotal).toFixed(2)} more to avail`;
                        else if (blockedByCombinability) hint = "Can't combine with your current offer";
                        else if (blockedByOtherCoupon) hint = 'Remove current coupon to apply this one';
                      }

                      return (
                        <div key={coupon.id} className={`shrink-0 ${showAllCoupons ? 'w-full' : 'w-64'} border rounded-xl p-3 ${applied ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate flex items-center gap-1">
                                <Tag className="w-3.5 h-3.5 text-orange-500 shrink-0" />{coupon.code}
                              </p>
                              <p className="text-xs text-gray-600">{describeDiscount(coupon)}{coupon.min_cart_total > 0 ? ` on ₹${coupon.min_cart_total}+` : ''}</p>
                            </div>
                            {applied ? (
                              <button onClick={() => setCouponCode(null)} className="shrink-0 text-xs font-semibold text-green-700 flex items-center gap-1 hover:text-red-600">
                                <Check className="w-4 h-4" />Applied
                              </button>
                            ) : eligible ? (
                              <button
                                onClick={() => applyCoupon(coupon.code)}
                                disabled={applyingCode === coupon.code}
                                className="shrink-0 text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                              >
                                {applyingCode === coupon.code ? '...' : 'Apply'}
                              </button>
                            ) : (
                              <span className="shrink-0 text-xs font-semibold text-gray-400 flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg">
                                <Lock className="w-3.5 h-3.5" />Apply
                              </span>
                            )}
                          </div>
                          {hint && <p className="text-[11px] text-gray-500 mt-1.5">{hint}</p>}
                          {feedback && <p className="text-[11px] text-red-500 mt-1.5">{feedback}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Steal the Deal / savings */}
              <div className="mt-5 mx-4 mb-4 rounded-xl border border-gray-100 overflow-hidden">
                <button onClick={() => setDealsExpanded((v) => !v)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-semibold">🎉 Steal The Deal</span>
                  {dealsExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </button>
                {pricing.discount > 0 && (
                  <div className="px-4 py-2 bg-green-50 text-center text-sm font-medium text-green-700">
                    Woohoo! ₹{pricing.discount.toFixed(2)} saved so far!
                  </div>
                )}
                {dealsExpanded && (
                  <div className="px-4 py-3 space-y-2 text-sm">
                    {pricing.flashDiscount > 0 && (
                      <div className="flex justify-between text-red-600"><span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" />Flash Sale</span><span>-₹{pricing.flashDiscount.toFixed(2)}</span></div>
                    )}
                    {pricing.productPromotionDiscount > 0 && (
                      <div className="flex justify-between text-green-600"><span className="flex items-center gap-1"><Percent className="w-3.5 h-3.5" />Special Offer</span><span>-₹{pricing.productPromotionDiscount.toFixed(2)}</span></div>
                    )}
                    {pricing.appliedTier && pricing.tierDiscount > 0 && (
                      <div className="flex justify-between text-blue-600"><span className="flex items-center gap-1"><Percent className="w-3.5 h-3.5" />Extra {describeDiscount(pricing.appliedTier)}</span><span>-₹{pricing.tierDiscount.toFixed(2)}</span></div>
                    )}
                    {pricing.couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600"><span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />Coupon ({couponCode})</span><span>-₹{pricing.couponDiscount.toFixed(2)}</span></div>
                    )}
                    {pricing.discount === 0 && <p className="text-gray-500">Add more to unlock savings on this order.</p>}
                  </div>
                )}
              </div>

              <div className="px-4 pb-2">
                <Link href="/cart" onClick={closeDrawer} className="text-xs text-blue-600 hover:underline font-medium">
                  View full cart →
                </Link>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t bg-white">
              <div className="px-5 pt-4 pb-2 space-y-1">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span className="line-through">₹{pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Estimated Total</span>
                  <span className="flex items-center gap-2">
                    {percentOff > 0 && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{percentOff}% OFF</span>}
                    <span className="text-lg font-bold">₹{pricing.total.toFixed(2)}</span>
                  </span>
                </div>
              </div>
              <div className="px-5 pb-3">
                <button
                  onClick={handleProceedToPay}
                  className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Proceed to Pay →
                </button>
                <div className="flex items-center justify-center gap-3 mt-2 text-gray-400">
                  <CreditCard className="w-5 h-5" /><Smartphone className="w-5 h-5" /><Building2 className="w-5 h-5" /><Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className="bg-gray-50 text-center text-xs text-gray-500 py-2">
                FREE SHIPPING on orders above ₹299
              </div>
            </div>
          </>
        )}
      </motion.div>
    </>
  );
}
