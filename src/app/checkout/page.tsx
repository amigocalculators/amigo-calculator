'use client';

import { useState } from 'react';
import { CartItem } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { CreditCard, MapPin, User, Shield, Truck, Package, Gift, Tag, Percent } from 'lucide-react';
import emailjs from '@emailjs/browser';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: (response: { razorpay_payment_id: string }) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
}

const indianStates = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
];

const calculatePromotion = (cart: CartItem[]) => {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (totalItems < 3) return { isEligible: false, freeItems: [] as {id: number; price: number; originalId: number}[], promotionDiscount: 0, groupsOf3: 0 };

  const individualItems: {id: number; price: number; originalId: number; uniqueId: string}[] = [];
  cart.forEach((item) => {
    for (let i = 0; i < item.quantity; i++) {
      individualItems.push({ ...item, originalId: item.id, uniqueId: `${item.id}-${i}` });
    }
  });

  const sorted = [...individualItems].sort((a, b) => a.price - b.price);
  const groupsOf3 = Math.floor(totalItems / 3);
  const freeItems = sorted.slice(0, groupsOf3);
  const promotionDiscount = freeItems.reduce((sum, item) => sum + item.price, 0);

  return { isEligible: true, freeItems, promotionDiscount, groupsOf3, totalItems };
};

export default function CheckoutPage() {
  const { cart, clearCart } = useCartStore();
  const router = useRouter();
  const [customerDetails, setCustomerDetails] = useState({
    name: '', email: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomerDetails((prev) => ({ ...prev, [name]: value }));
  };

  const isPersonalInfoComplete = () => {
    const { name, email, phone } = customerDetails;
    return name.trim() !== '' && email.trim() !== '' && phone.trim().length === 10;
  };

  const promotion = calculatePromotion(cart);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotal = subtotal - promotion.promotionDiscount;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY!,
      amount: Math.round(finalTotal * 100),
      currency: 'INR',
      name: 'Amigo Calculator',
      description: 'Purchase from Amigo Calculator',
      handler: function (response) {
        const paymentDetails = {
          status: 'success',
          paymentId: response.razorpay_payment_id,
          orderId: 'ORD' + Date.now(),
          amount: finalTotal,
          method: 'Razorpay',
        };

        const fullAddress = `${customerDetails.addressLine1}, ${customerDetails.addressLine2}, ${customerDetails.city}, ${customerDetails.state} - ${customerDetails.pincode}`;

        emailjs
          .send(
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
            {
              to_name: customerDetails.name,
              to_email: customerDetails.email,
              order_id: response.razorpay_payment_id,
              amount: finalTotal,
              items: cart.map((item) => `${item.name} (${item.quantity})`).join(', '),
              address: fullAddress,
              phone: customerDetails.phone,
            },
            process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
          )
          .then(() => {
            clearCart();
            sessionStorage.setItem('paymentDetails', JSON.stringify(paymentDetails));
            router.push('/payment-status');
          })
          .catch(() => {
            sessionStorage.setItem('paymentDetails', JSON.stringify(paymentDetails));
            router.push('/payment-status');
          });
      },
      prefill: { name: customerDetails.name, email: customerDetails.email, contact: customerDetails.phone },
      theme: { color: '#2563EB' },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
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

              {promotion.isEligible && (
                <div className="mb-6 p-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-5 h-5" />
                    <span className="font-bold">Buy 2 Get 1 FREE!</span>
                  </div>
                  <p className="text-sm opacity-90">
                    You&apos;re saving ₹{promotion.promotionDiscount.toFixed(2)} with {promotion.groupsOf3} free item{promotion.groupsOf3 > 1 ? 's' : ''}!
                  </p>
                </div>
              )}

              <div className="space-y-4 mb-6">
                {cart.map((item) => {
                  const freeCount = promotion.freeItems.filter((fi) => fi.originalId === item.id).length;
                  const paidCount = item.quantity - freeCount;
                  return (
                    <div key={item.id} className="relative">
                      <div className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ${
                        freeCount > 0 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' : 'bg-gray-50'
                      }`}>
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                            {freeCount > 0 && <span className="ml-2 text-green-600 font-semibold">({freeCount} FREE!)</span>}
                          </p>
                        </div>
                        <div className="text-right">
                          {freeCount > 0 ? (
                            <div>
                              {paidCount > 0 && <p className="font-medium">₹{(item.price * paidCount).toFixed(2)}</p>}
                              <p className="text-sm text-gray-500 line-through">₹{(item.price * freeCount).toFixed(2)}</p>
                              <p className="font-bold text-green-600">FREE</p>
                            </div>
                          ) : (
                            <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                      {freeCount > 0 && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <Gift className="w-3 h-3" />{freeCount} FREE
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-4">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                {promotion.isEligible && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span className="flex items-center gap-1"><Percent className="w-4 h-4" />Buy 2 Get 1 FREE</span>
                    <span>-₹{promotion.promotionDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span className="text-green-600">Free</span></div>
                <div className="flex justify-between text-lg font-bold"><span>Total</span><span>₹{finalTotal.toFixed(2)}</span></div>
                {promotion.isEligible && (
                  <div className="text-center">
                    <p className="text-sm text-green-600 font-medium">🎉 You saved ₹{promotion.promotionDiscount.toFixed(2)} total!</p>
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
                  disabled={!isPersonalInfoComplete()}
                  className={`w-full py-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    isPersonalInfoComplete() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  Pay ₹{finalTotal.toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
