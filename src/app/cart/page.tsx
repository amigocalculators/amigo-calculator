'use client';

import { useEffect, useState } from 'react';
import { CartItem, Promotion } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { getActiveGiftPromotion, buildFreeGiftItem, isFreeGiftItem } from '@/lib/promotions';
import { Minus, Plus, Trash2, Tag, Gift, Percent } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCartStore();
  const router = useRouter();
  const [giftPromotion, setGiftPromotion] = useState<Promotion | null>(null);

  useEffect(() => {
    getActiveGiftPromotion().then(setGiftPromotion);
  }, []);

  const promotion = calculatePromotion(cart);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotal = subtotal - promotion.promotionDiscount;
  const giftItem = giftPromotion && cart.length > 0 ? buildFreeGiftItem(giftPromotion, cart) : null;
  const displayCart = giftItem ? [...cart, giftItem] : cart;

  if (cart.length === 0) {
    return (
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
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
        <h1 className="text-3xl font-bold mb-8 text-center">Shopping Cart</h1>

        {promotion.isEligible && (
          <div className="mb-8 p-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Tag className="w-6 h-6" />
              <span className="text-xl font-bold">🎉 Buy 2 Get 1 FREE Active!</span>
            </div>
            <p className="text-lg opacity-90">
              You&apos;re saving ₹{promotion.promotionDiscount.toFixed(2)} with {promotion.groupsOf3} free item{promotion.groupsOf3 > 1 ? 's' : ''}!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {displayCart.map((item) => {
              if (isFreeGiftItem(item)) {
                return (
                  <div key={item.id} className="relative">
                    <div className="bg-white p-6 rounded-xl shadow-sm ring-2 ring-green-200 bg-gradient-to-r from-green-50 to-emerald-50 flex items-center gap-4">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-green-100 flex items-center justify-center">
                          <Gift className="w-8 h-8 text-green-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          {item.quantity > 1 ? `${item.quantity} × ` : ''}Free gift with your order
                          {giftPromotion?.free_gift_value ? ` (worth ₹${Number(giftPromotion.free_gift_value).toFixed(2)})` : ''}
                        </p>
                      </div>
                      <div className="font-bold text-green-600 text-lg">FREE</div>
                    </div>
                    <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <Gift className="w-3 h-3" /> GIFT
                    </div>
                  </div>
                );
              }

              const freeCount = promotion.freeItems.filter((fi) => fi.originalId === item.id).length;
              const paidCount = item.quantity - freeCount;

              return (
                <div key={item.id} className="relative">
                  <div className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${
                    freeCount > 0 ? 'ring-2 ring-green-200 bg-gradient-to-r from-green-50 to-emerald-50' : ''
                  }`}>
                    <div className="flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-8">{item.name}</h3>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center border rounded-lg overflow-hidden">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-2 hover:bg-gray-100 transition-colors">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 font-medium">
                              {item.quantity}
                              {freeCount > 0 && <span className="ml-2 text-green-600 font-bold text-sm">({freeCount} FREE!)</span>}
                            </span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-2 hover:bg-gray-100 transition-colors">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-600 transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8">
                      {freeCount > 0 ? (
                        <div className="text-right">
                          {paidCount > 0 && <div className="font-bold text-green-600 text-xl">₹{(item.price * paidCount).toFixed(2)}</div>}
                          <div className="text-sm text-gray-500 line-through">₹{(item.price * freeCount).toFixed(2)}</div>
                          <div className="font-bold text-green-600 text-lg">{freeCount} × FREE</div>
                        </div>
                      ) : (
                        <div className="font-bold text-green-600 text-xl text-right">₹{(item.price * item.quantity).toFixed(2)}</div>
                      )}
                    </div>
                  </div>
                  {freeCount > 0 && (
                    <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <Gift className="w-3 h-3" />
                      {freeCount} FREE
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {promotion.isEligible && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span className="flex items-center gap-1"><Percent className="w-4 h-4" />Buy 2 Get 1 FREE</span>
                    <span>-₹{promotion.promotionDiscount.toFixed(2)}</span>
                  </div>
                )}
                {giftItem && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span className="flex items-center gap-1"><Gift className="w-4 h-4" />{giftItem.quantity > 1 ? `${giftItem.quantity} × ` : ''}{giftItem.name}</span>
                    <span>FREE</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">Including GST</p>
                  {promotion.isEligible && (
                    <div className="mt-2 text-center">
                      <p className="text-sm text-green-600 font-medium">🎉 You saved ₹{promotion.promotionDiscount.toFixed(2)} total!</p>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => router.push('/checkout')} className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
