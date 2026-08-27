'use client';

import { useEffect, useState } from 'react';
import { Promotion, FlashSale } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { getActiveGiftPromotions, isBuy2Get1Enabled, buildFreeGiftItem, isFreeGiftItem } from '@/lib/promotions';
import { calculateOrderPricing } from '@/lib/orderPricing';
import { getFlashSaleStatus, isFlashSaleLive } from '@/lib/flashSale';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { CreditCard, MapPin, User, Shield, Truck, Package, Gift, Tag, Percent, Zap } from 'lucide-react';

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
  const { cart, clearCart, selectedOfferType, setSelectedOfferType } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [giftPromotions, setGiftPromotions] = useState<Promotion[]>([]);
  const [buy2Get1Enabled, setBuy2Get1Enabled] = useState(true);
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null);
  const [flashAlreadyClaimed, setFlashAlreadyClaimed] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: '', email: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
  });

  useEffect(() => {
    getActiveGiftPromotions().then(setGiftPromotions);
    isBuy2Get1Enabled().then(setBuy2Get1Enabled);
    getFlashSaleStatus().then(({ sale, alreadyClaimed }) => {
      setFlashSale(sale);
      setFlashAlreadyClaimed(alreadyClaimed);
    });
  }, []);

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

  const isPersonalInfoComplete = () => {
    const { name, email, phone } = customerDetails;
    return name.trim() !== '' && email.trim() !== '' && phone.trim().length === 10;
  };

  const eligibleGifts = cart.length > 0 ? giftPromotions : [];
  const giftPreviews = new Map(eligibleGifts.map((p) => [p.id, buildFreeGiftItem(p, cart)]));
  const flashEligible = isFlashSaleLive(flashSale) && !flashAlreadyClaimed;

  const pricing = calculateOrderPricing({
    cart,
    buy2Get1Enabled,
    eligibleGiftPromotions: eligibleGifts,
    selectedOfferType,
    flashSale,
    flashEligible,
  });

  const optionsCount = (pricing.buy2Get1Eligible ? 1 : 0) + eligibleGifts.length;
  const selectedGiftPromotion = typeof pricing.offerChoice === 'number'
    ? eligibleGifts.find((p) => p.id === pricing.offerChoice) ?? null
    : null;
  const displayCart = pricing.giftItem ? [...cart, pricing.giftItem] : cart;

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
                    {pricing.buy2Get1Eligible && (
                      <button
                        onClick={() => setSelectedOfferType('buy2get1')}
                        className={`w-full p-3 rounded-lg border-2 text-left text-sm transition-colors ${
                          pricing.offerChoice === 'buy2get1' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-bold text-purple-700">🎉 Buy 2 Get 1 FREE</span>
                        <span className="block text-gray-600">Save ₹{pricing.buy2Get1PromotionDiscount.toFixed(2)}</span>
                      </button>
                    )}
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

              {pricing.buy2Get1Applied ? (
                <div className="mb-6 p-4 bg-linear-to-r from-pink-500 to-purple-600 rounded-xl text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-5 h-5" />
                    <span className="font-bold">Buy 2 Get 1 FREE!</span>
                  </div>
                  <p className="text-sm opacity-90">
                    You&apos;re saving ₹{pricing.buy2Get1PromotionDiscount.toFixed(2)} with {pricing.buy2Get1GroupsOf3} free item{pricing.buy2Get1GroupsOf3 > 1 ? 's' : ''}!
                  </p>
                </div>
              ) : pricing.giftItem && selectedGiftPromotion ? (
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
                {pricing.buy2Get1Applied && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span className="flex items-center gap-1"><Percent className="w-4 h-4" />Buy 2 Get 1 FREE</span>
                    <span>-₹{pricing.buy2Get1PromotionDiscount.toFixed(2)}</span>
                  </div>
                )}
                {pricing.giftItem && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span className="flex items-center gap-1"><Gift className="w-4 h-4" />{pricing.giftItem.quantity > 1 ? `${pricing.giftItem.quantity} × ` : ''}{pricing.giftItem.name}</span>
                    <span>FREE</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold"><span>Total</span><span>₹{pricing.total.toFixed(2)}</span></div>
                {pricing.discount > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-green-600 font-medium">🎉 You saved ₹{pricing.discount.toFixed(2)} total!</p>
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 mb-2"><Shield className="w-5 h-5" /><span className="font-medium">Secure Payment</span></div>
                  <p className="text-sm text-blue-600">Your payment information is encrypted and secure</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 mb-2"><Truck className="w-5 h-5" /><span className="font-medium">Free Shipping</span></div>
                  <p className="text-sm text-green-600">Estimated delivery: 3-5 business days</p>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={!isPersonalInfoComplete() || loading}
                  className={`w-full py-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    isPersonalInfoComplete() && !loading ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  {loading ? 'Processing...' : `Pay ₹${pricing.total.toFixed(2)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
