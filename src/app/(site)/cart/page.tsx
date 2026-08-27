'use client';

import { useEffect, useState } from 'react';
import { Promotion, FlashSale } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { getActiveGiftPromotions, isBuy2Get1Enabled, isFreeGiftItem, buildFreeGiftItem } from '@/lib/promotions';
import { calculateOrderPricing } from '@/lib/orderPricing';
import { getFlashSaleStatus, isFlashSaleLive } from '@/lib/flashSale';
import { createClient } from '@/lib/supabase/client';
import { Minus, Plus, Trash2, Tag, Gift, Percent, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, selectedOfferType, setSelectedOfferType } = useCartStore();
  const router = useRouter();
  const [giftPromotions, setGiftPromotions] = useState<Promotion[]>([]);
  const [buy2Get1Enabled, setBuy2Get1Enabled] = useState(true);
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null);
  const [flashAlreadyClaimed, setFlashAlreadyClaimed] = useState(false);

  useEffect(() => {
    getActiveGiftPromotions().then(setGiftPromotions);
    isBuy2Get1Enabled().then(setBuy2Get1Enabled);
    getFlashSaleStatus().then(({ sale, alreadyClaimed }) => {
      setFlashSale(sale);
      setFlashAlreadyClaimed(alreadyClaimed);
    });
  }, []);

  const eligibleGifts = cart.length > 0 ? giftPromotions : [];
  const flashEligible = isFlashSaleLive(flashSale) && !flashAlreadyClaimed;

  const pricing = calculateOrderPricing({
    cart,
    buy2Get1Enabled,
    eligibleGiftPromotions: eligibleGifts,
    selectedOfferType,
    flashSale,
    flashEligible,
  });

  const giftPreviews = new Map(eligibleGifts.map((p) => [p.id, buildFreeGiftItem(p, cart)]));
  const optionsCount = (pricing.buy2Get1Eligible ? 1 : 0) + eligibleGifts.length;
  const displayCart = pricing.giftItem ? [...cart, pricing.giftItem] : cart;
  const selectedGiftPromotion = typeof pricing.offerChoice === 'number'
    ? eligibleGifts.find((p) => p.id === pricing.offerChoice) ?? null
    : null;

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

        {pricing.flashDiscount > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-600 to-orange-500 rounded-xl text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-6 h-6" />
              <span className="text-xl font-bold">⚡ Flash Sale Applied!</span>
            </div>
            <p className="text-lg opacity-90">You&apos;re saving ₹{pricing.flashDiscount.toFixed(2)} on 1 unit at the flash price.</p>
          </div>
        )}

        {optionsCount > 1 && (
          <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
            <p className="font-semibold mb-3 text-center">You qualify for multiple offers — choose which one to apply:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {eligibleGifts.map((p) => {
                const preview = giftPreviews.get(p.id)!;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedOfferType(p.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      pricing.offerChoice === p.id ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-bold text-green-700">🎁 {p.title}</p>
                    <p className="text-sm text-gray-600">
                      Free {preview && preview.quantity > 1 ? `${preview.quantity} × ` : ''}{p.free_gift_name}
                    </p>
                  </button>
                );
              })}
              {pricing.buy2Get1Eligible && (
                <button
                  onClick={() => setSelectedOfferType('buy2get1')}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    pricing.offerChoice === 'buy2get1' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-bold text-purple-700">🎉 Buy 2 Get 1 FREE</p>
                  <p className="text-sm text-gray-600">
                    Save ₹{pricing.buy2Get1PromotionDiscount.toFixed(2)} — {pricing.buy2Get1GroupsOf3} item{pricing.buy2Get1GroupsOf3 > 1 ? 's' : ''} free
                  </p>
                </button>
              )}
            </div>
          </div>
        )}

        {pricing.buy2Get1Applied ? (
          <div className="mb-8 p-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Tag className="w-6 h-6" />
              <span className="text-xl font-bold">🎉 Buy 2 Get 1 FREE Active!</span>
            </div>
            <p className="text-lg opacity-90">
              You&apos;re saving ₹{pricing.buy2Get1PromotionDiscount.toFixed(2)} with {pricing.buy2Get1GroupsOf3} free item{pricing.buy2Get1GroupsOf3 > 1 ? 's' : ''}!
            </p>
          </div>
        ) : pricing.giftItem && selectedGiftPromotion ? (
          <div className="mb-8 p-6 bg-gradient-to-r from-orange-500 to-green-600 rounded-xl text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="w-6 h-6" />
              <span className="text-xl font-bold">🎉 {selectedGiftPromotion.title} Active!</span>
            </div>
            <p className="text-lg opacity-90">
              You&apos;re getting {pricing.giftItem.quantity > 1 ? `${pricing.giftItem.quantity} × ` : ''}{pricing.giftItem.name} FREE with your order!
            </p>
          </div>
        ) : null}

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
                          {selectedGiftPromotion?.free_gift_value ? ` (worth ₹${Number(selectedGiftPromotion.free_gift_value).toFixed(2)})` : ''}
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

              const line = pricing.lines.find((l) => l.id === item.id);
              const flashUnits = line?.flashUnits ?? 0;
              const freeUnits = line?.freeUnits ?? 0;
              const paidUnits = line?.paidUnits ?? item.quantity;

              return (
                <div key={item.id} className="relative">
                  <div className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${
                    freeUnits > 0 || flashUnits > 0 ? 'ring-2 ring-green-200 bg-gradient-to-r from-green-50 to-emerald-50' : ''
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
                              {flashUnits > 0 && <span className="ml-2 text-red-600 font-bold text-sm">({flashUnits} @ ₹{flashSale!.sale_price.toFixed(2)})</span>}
                              {freeUnits > 0 && <span className="ml-2 text-green-600 font-bold text-sm">({freeUnits} FREE!)</span>}
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
                      <div className="text-right space-y-1">
                        {paidUnits > 0 && <div className="font-bold text-green-600 text-xl">₹{(item.price * paidUnits).toFixed(2)}</div>}
                        {flashUnits > 0 && <div className="font-bold text-red-600 text-lg">{flashUnits} × ₹{flashSale!.sale_price.toFixed(2)}</div>}
                        {freeUnits > 0 && (
                          <>
                            <div className="text-sm text-gray-500 line-through">₹{(item.price * freeUnits).toFixed(2)}</div>
                            <div className="font-bold text-green-600 text-lg">{freeUnits} × FREE</div>
                          </>
                        )}
                        {paidUnits === 0 && flashUnits === 0 && freeUnits === 0 && (
                          <div className="font-bold text-green-600 text-xl">₹{(item.price * item.quantity).toFixed(2)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  {flashUnits > 0 && (
                    <div className="absolute -top-3 -right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <Zap className="w-3 h-3" />
                      Flash ₹{flashSale!.sale_price.toFixed(2)}
                    </div>
                  )}
                  {freeUnits > 0 && flashUnits === 0 && (
                    <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <Gift className="w-3 h-3" />
                      {freeUnits} FREE
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
                  <span>₹{pricing.subtotal.toFixed(2)}</span>
                </div>
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
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{pricing.total.toFixed(2)}</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">Including GST</p>
                  {pricing.discount > 0 && (
                    <div className="mt-2 text-center">
                      <p className="text-sm text-green-600 font-medium">🎉 You saved ₹{pricing.discount.toFixed(2)} total!</p>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={async () => {
                  const supabase = createClient();
                  const { data: { user } } = await supabase.auth.getUser();
                  router.push(user ? '/checkout' : '/account/login?next=/checkout');
                }}
                className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
