'use client';

import { useEffect, useState } from 'react';
import { Promotion, FlashSale, ProductPromotion, CouponCode } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { getActiveGiftPromotions, buildFreeGiftItem, isFreeGiftItem } from '@/lib/promotions';
import { getProductPromotions } from '@/lib/productPromotions';
import { getActiveCoupons, describeCouponRejection, describeDiscount } from '@/lib/couponCodes';
import { calculateOrderPricing } from '@/lib/orderPricing';
import { getFlashSaleStatus, isFlashSaleLive } from '@/lib/flashSale';
import { getSiteSettings } from '@/lib/siteSettings';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { CreditCard, MapPin, User, Shield, Truck, Package, Gift, Percent, Zap, Tag } from 'lucide-react';
import ConfettiBurst from '@/components/ConfettiBurst';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal?: { ondismiss?: () => void };
}

const indianStates = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
];

export default function CheckoutPage() {
  const { cart, clearCart, selectedOfferType, setSelectedOfferType, couponCode, setCouponCode } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [giftPromotions, setGiftPromotions] = useState<Promotion[]>([]);
  const [productPromotions, setProductPromotions] = useState<ProductPromotion[]>([]);
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null);
  const [flashAlreadyClaimed, setFlashAlreadyClaimed] = useState(false);
  const [tiers, setTiers] = useState<CouponCode[]>([]);
  const [freeDeliveryEnabled, setFreeDeliveryEnabled] = useState(true);
  const [customerDetails, setCustomerDetails] = useState({
    name: '', email: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
  });
  const [couponInput, setCouponInput] = useState('');
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  // The validated discount ₹ amount for the currently-applied coupon, from the last
  // successful /api/coupon/validate call — purely a display preview. /api/checkout
  // independently re-validates the code and recomputes the real discount at charge time,
  // so a stale preview here (e.g. cart changed after applying) never affects what's charged.
  const [appliedCouponDiscount, setAppliedCouponDiscount] = useState(0);
  const [couponAutoChecked, setCouponAutoChecked] = useState(false);
  // Incremented (never just toggled) so re-applying a coupon mid-checkout re-triggers the
  // burst via a changed React `key`, even if the previous one hasn't finished yet.
  const [celebrate, setCelebrate] = useState(0);

  // `silent`: used for the auto re-check of a persisted coupon on load — stays quiet on
  // failure (just drops the stale code) instead of surfacing an error the user never asked for.
  // Defined before the effects below (rather than down with the other handlers) because
  // the coupon auto-check effect calls it — it must already be initialized by the time
  // that effect's closure is created, including on a render that early-returns below
  // (the !authChecked loading state) before ever reaching a later definition.
  const applyCoupon = async (rawCode: string, { silent = false }: { silent?: boolean } = {}) => {
    const code = rawCode.trim();
    if (!code) return;
    setCouponApplying(true);
    if (!silent) setCouponMessage(null);
    try {
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cart: cart.map((item) => ({ id: item.id, quantity: item.quantity })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to validate coupon');

      if (data.valid) {
        setCouponCode(code.toUpperCase());
        setAppliedCouponDiscount(data.discount);
        setCouponInput('');
        setCouponMessage({ type: 'success', text: `Coupon applied! You saved ₹${data.discount.toFixed(2)}.` });
        // Only for a real click — the silent re-check of a persisted coupon on page load
        // shouldn't surprise the shopper with confetti they didn't ask for.
        if (!silent) setCelebrate((n) => n + 1);
      } else {
        setAppliedCouponDiscount(0);
        if (silent) {
          setCouponCode(null);
        } else {
          setCouponMessage({ type: 'error', text: describeCouponRejection(data) });
        }
      }
    } catch (err) {
      setAppliedCouponDiscount(0);
      // A failed silent re-check (network blip, server hiccup) must not leave the "Applied"
      // badge showing with zero actual discount, permanently — couponAutoChecked latches
      // true after this call regardless, so there's no retry. Treat it the same as an
      // explicit rejection: drop the stale code rather than lie about it being applied.
      if (silent) {
        setCouponCode(null);
      } else {
        setCouponMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to validate coupon' });
      }
    } finally {
      setCouponApplying(false);
    }
  };

  useEffect(() => {
    getActiveGiftPromotions().then(setGiftPromotions);
    getProductPromotions().then(setProductPromotions);
    getFlashSaleStatus().then(({ sale, alreadyClaimed }) => {
      setFlashSale(sale);
      setFlashAlreadyClaimed(alreadyClaimed);
    });
    getActiveCoupons().then((coupons) => setTiers(coupons.filter((c) => c.auto_apply)));
    getSiteSettings().then((settings) => setFreeDeliveryEnabled(settings.free_delivery_enabled));
  }, []);

  // A coupon applied on an earlier visit is persisted in cartStore — re-check it once
  // against the live cart so the discount preview isn't stale (and silently drop it if
  // it no longer validates, e.g. it expired since it was applied).
  useEffect(() => {
    if (couponAutoChecked || !couponCode || cart.length === 0) return;
    setCouponAutoChecked(true);
    applyCoupon(couponCode, { silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couponAutoChecked, couponCode, cart.length]);

  // Placing an order requires being logged in — cart itself stays accessible to
  // guests (it lives in localStorage, untouched by this redirect), only checkout is gated.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/account/login?next=/checkout');
        return;
      }
      const { data: profile } = await supabase.from('profiles').select('name, email, phone').eq('id', user.id).single();
      if (profile) {
        setCustomerDetails((prev) => ({
          ...prev,
          name: profile.name ?? prev.name,
          email: profile.email ?? prev.email,
          phone: profile.phone ?? prev.phone,
        }));
      }
      setAuthChecked(true);
    });
  }, [router]);

  if (!authChecked) {
    return (
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 text-center py-16 text-gray-500">Loading…</div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomerDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveCoupon = () => {
    setCouponCode(null);
    setAppliedCouponDiscount(0);
    setCouponMessage(null);
    setCouponInput('');
  };

  const isPersonalInfoComplete = () => {
    const { name, email, phone } = customerDetails;
    return name.trim() !== '' && email.trim() !== '' && phone.trim().length === 10;
  };

  const eligibleGifts = cart.length > 0 ? giftPromotions : [];
  const giftPreviews = new Map(eligibleGifts.map((p) => [p.id, buildFreeGiftItem(p, cart)]));
  const flashEligible = isFlashSaleLive(flashSale) && !flashAlreadyClaimed;

  const pricing = calculateOrderPricing({
    cart,
    productPromotions,
    eligibleGiftPromotions: eligibleGifts,
    selectedOfferType,
    flashSale,
    flashEligible,
    tiers,
  });

  const optionsCount = eligibleGifts.length;
  const selectedGiftPromotion = typeof pricing.offerChoice === 'number'
    ? eligibleGifts.find((p) => p.id === pricing.offerChoice) ?? null
    : null;
  const displayCart = pricing.giftItem ? [...cart, pricing.giftItem] : cart;

  // The coupon's discount is only ever previewed via /api/coupon/validate (see
  // applyCoupon above), not recomputed here through calculateOrderPricing — the admin
  // coupon row's fields (discount type/value/min cart total) are deliberately never
  // sent to the browser, only the already-validated ₹ amount. /api/checkout is what
  // actually re-derives and charges the authoritative total.
  const couponDiscount = couponCode ? appliedCouponDiscount : 0;
  const displayTotal = Math.max(0, pricing.total - couponDiscount);
  const totalSaved = pricing.discount + couponDiscount;

  const handleCheckout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Create a Razorpay order server-side + save pending order to DB.
      // The server recomputes the real total from cart ids/quantities + live
      // promotion/flash-sale state — it never trusts a price from here.
      const orderRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
          selectedOfferType,
          customerDetails,
          couponCode,
        }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to create order');
      }
      const { orderId, amount, currency } = await orderRes.json();

      // Step 2: Open Razorpay widget with the server-created order ID
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY!,
        amount,
        currency,
        order_id: orderId,
        name: 'Amigo Calculator',
        description: 'Purchase from Amigo Calculator',
        handler: async function (response) {
          // Step 3: Verify payment signature server-side + confirm order in DB.
          // Everything else (pricing, items) was already computed and stored at
          // checkout-creation — this just confirms the same row.
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const result = await verifyRes.json();

          if (verifyRes.ok) {
            clearCart();
            sessionStorage.setItem('paymentDetails', JSON.stringify({
              status: 'success',
              paymentId: response.razorpay_payment_id,
              orderId: result.orderId ?? 'ORD' + Date.now(),
              amount: amount / 100,
              method: 'Razorpay',
            }));
          } else {
            // Payment went through on Razorpay but our verification failed.
            // The webhook will reconcile this. Show error with payment ID for support.
            sessionStorage.setItem('paymentDetails', JSON.stringify({
              status: 'error',
              paymentId: response.razorpay_payment_id,
              orderId: 'ORD' + Date.now(),
              amount: amount / 100,
              method: 'Razorpay',
              failureReason: `Payment received but verification failed. Please contact support with Payment ID: ${response.razorpay_payment_id}`,
            }));
          }
          router.push('/payment-status');
        },
        prefill: { name: customerDetails.name, email: customerDetails.email, contact: customerDetails.phone },
        theme: { color: '#2563EB' },
        modal: {
          ondismiss: () => {
            // User closed the Razorpay modal without completing payment — cart is intact
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Please add items to your cart before proceeding to checkout.</p>
            <button onClick={() => router.push('/products')} className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 bg-gray-200">
      {celebrate > 0 && <ConfettiBurst key={celebrate} onDone={() => setCelebrate(0)} />}
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Forms */}
          <div className="space-y-8">
            {/* Personal Info */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />Personal Information
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Pintu Mondal' },
                  { label: 'Email Address', name: 'email', type: 'email', placeholder: 'pintu@example.com' },
                  { label: 'Phone Number', name: 'phone', type: 'tel', placeholder: '1234567890', pattern: '[0-9]{10}' },
                ].map(({ label, name, type, placeholder, pattern }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                    <input
                      type={type}
                      name={name}
                      required
                      pattern={pattern}
                      value={customerDetails[name as keyof typeof customerDetails]}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={placeholder}
                    />
                    {name === 'phone' && customerDetails.phone.length > 0 && customerDetails.phone.length !== 10 && (
                      <p className="text-red-500 text-sm mt-2">Phone number must be exactly 10 digits.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5" />Shipping Address
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                  <input type="text" name="addressLine1" required value={customerDetails.addressLine1} onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Street address" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                  <input type="text" name="addressLine2" value={customerDetails.addressLine2} onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Apartment, suite, etc. (optional)" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input type="text" name="city" required value={customerDetails.city} onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="City" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                    <input type="text" name="pincode" required pattern="[0-9]{6}" value={customerDetails.pincode} onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="123456" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <select name="state" required value={customerDetails.state} onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                    <option value="">Select State</option>
                    {indianStates.map((state) => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="bg-white p-8 rounded-xl shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Package className="w-5 h-5" />Order Summary
              </h2>

              {optionsCount > 1 && (
                <div className="mb-6 border border-gray-200 rounded-xl p-4">
                  <p className="text-sm font-semibold mb-3">Choose one offer to apply:</p>
                  <div className="space-y-2">
                    {eligibleGifts.map((p) => {
                      const preview = giftPreviews.get(p.id)!;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setSelectedOfferType(p.id)}
                          className={`w-full p-3 rounded-lg border-2 text-left text-sm transition-colors ${
                            pricing.offerChoice === p.id ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="font-bold text-green-700">🎁 {p.title}</span>
                          <span className="block text-gray-600">
                            Free {preview.quantity > 1 ? `${preview.quantity} × ` : ''}{p.free_gift_name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {pricing.flashDiscount > 0 && (
                <div className="mb-6 p-4 bg-linear-to-r from-red-600 to-orange-500 rounded-xl text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5" />
                    <span className="font-bold">Flash Sale Applied!</span>
                  </div>
                  <p className="text-sm opacity-90">You&apos;re saving ₹{pricing.flashDiscount.toFixed(2)} on 1 unit at the flash price.</p>
                </div>
              )}

              {pricing.giftItem && selectedGiftPromotion ? (
                <div className="mb-6 p-4 bg-linear-to-r from-orange-500 to-green-600 rounded-xl text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5" />
                    <span className="font-bold">{selectedGiftPromotion.title} Active!</span>
                  </div>
                  <p className="text-sm opacity-90">
                    You&apos;re getting {pricing.giftItem.quantity > 1 ? `${pricing.giftItem.quantity} × ` : ''}{pricing.giftItem.name} FREE with your order!
                  </p>
                </div>
              ) : null}

              <div className="mb-6 border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />Have a coupon code?
                </p>
                {couponCode ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <span className="text-sm font-medium text-green-700">Applied: {couponCode}</span>
                    <button type="button" onClick={handleRemoveCoupon} className="text-xs text-gray-500 hover:text-gray-700 underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => applyCoupon(couponInput)}
                      disabled={couponApplying || !couponInput.trim()}
                      className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {couponApplying ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                )}
                {couponMessage && (
                  <p className={`text-sm mt-2 ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {couponMessage.text}
                  </p>
                )}
              </div>

              <div className="space-y-4 mb-6">
                {displayCart.map((item) => {
                  if (isFreeGiftItem(item)) {
                    return (
                      <div key={item.id} className="relative">
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-green-100 flex items-center justify-center">
                              <Gift className="w-6 h-6 text-green-600" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-600">
                              {item.quantity > 1 ? `Quantity: ${item.quantity} · ` : ''}Free gift with your order
                            </p>
                          </div>
                          <p className="font-bold text-green-600">FREE</p>
                        </div>
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <Gift className="w-3 h-3" />GIFT
                        </div>
                      </div>
                    );
                  }

                  const line = pricing.lines.find((l) => l.id === item.id);
                  const flashUnits = line?.flashUnits ?? 0;
                  const freeUnits = line?.freeUnits ?? 0;
                  const paidUnits = line?.paidUnits ?? item.quantity;

                  return (
                    <div key={item.id} className="relative">
                      <div className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ${
                        freeUnits > 0 || flashUnits > 0 ? 'bg-linear-to-r from-green-50 to-emerald-50 border-2 border-green-200' : 'bg-gray-50'
                      }`}>
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                            {flashUnits > 0 && <span className="ml-2 text-red-600 font-semibold">({flashUnits} @ ₹{flashSale!.sale_price.toFixed(2)})</span>}
                            {freeUnits > 0 && <span className="ml-2 text-green-600 font-semibold">({freeUnits} FREE!)</span>}
                          </p>
                        </div>
                        <div className="text-right space-y-0.5">
                          {paidUnits > 0 && <p className="font-medium">₹{(item.price * paidUnits).toFixed(2)}</p>}
                          {flashUnits > 0 && <p className="font-bold text-red-600">{flashUnits} × ₹{flashSale!.sale_price.toFixed(2)}</p>}
                          {freeUnits > 0 && (
                            <>
                              <p className="text-sm text-gray-500 line-through">₹{(item.price * freeUnits).toFixed(2)}</p>
                              <p className="font-bold text-green-600">FREE</p>
                            </>
                          )}
                          {paidUnits === 0 && flashUnits === 0 && freeUnits === 0 && (
                            <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                      {flashUnits > 0 && (
                        <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <Zap className="w-3 h-3" />Flash
                        </div>
                      )}
                      {freeUnits > 0 && flashUnits === 0 && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <Gift className="w-3 h-3" />{freeUnits} FREE
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-4">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{pricing.subtotal.toFixed(2)}</span></div>
                {pricing.flashDiscount > 0 && (
                  <div className="flex justify-between text-red-600 font-semibold">
                    <span className="flex items-center gap-1"><Zap className="w-4 h-4" />Flash Sale</span>
                    <span>-₹{pricing.flashDiscount.toFixed(2)}</span>
                  </div>
                )}
                {pricing.productPromotionDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span className="flex items-center gap-1"><Percent className="w-4 h-4" />Special Offer</span>
                    <span>-₹{pricing.productPromotionDiscount.toFixed(2)}</span>
                  </div>
                )}
                {pricing.appliedTier && pricing.tierDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span className="flex items-center gap-1"><Percent className="w-4 h-4" />Extra {describeDiscount(pricing.appliedTier)}</span>
                    <span>-₹{pricing.tierDiscount.toFixed(2)}</span>
                  </div>
                )}
                {pricing.giftItem && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span className="flex items-center gap-1"><Gift className="w-4 h-4" />{pricing.giftItem.quantity > 1 ? `${pricing.giftItem.quantity} × ` : ''}{pricing.giftItem.name}</span>
                    <span>FREE</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span className="flex items-center gap-1"><Tag className="w-4 h-4" />Coupon ({couponCode})</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                {freeDeliveryEnabled && (
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1"><Truck className="w-4 h-4" />Delivery</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold"><span>Total</span><span>₹{displayTotal.toFixed(2)}</span></div>
                {totalSaved > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-green-600 font-medium">🎉 You saved ₹{totalSaved.toFixed(2)} total!</p>
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 mb-2"><Shield className="w-5 h-5" /><span className="font-medium">Secure Payment</span></div>
                  <p className="text-sm text-blue-600">Your payment information is encrypted and secure</p>
                </div>
                {freeDeliveryEnabled && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 mb-2"><Truck className="w-5 h-5" /><span className="font-medium">Free Shipping</span></div>
                    <p className="text-sm text-green-600">Estimated delivery: 3-5 business days</p>
                  </div>
                )}
                <button
                  onClick={handleCheckout}
                  disabled={!isPersonalInfoComplete() || loading}
                  className={`w-full py-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    isPersonalInfoComplete() && !loading ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  {loading ? 'Processing...' : `Pay ₹${displayTotal.toFixed(2)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
