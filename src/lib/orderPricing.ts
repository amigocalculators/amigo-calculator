import { CartItem, Promotion, FlashSale } from '@/types';
import { buildFreeGiftItem, resolveOfferChoice, ResolvedOffer } from './promotions';

interface Buy2Get1Result {
  isEligible: boolean;
  freeItems: { id: number; price: number; originalId: number }[];
  promotionDiscount: number;
  groupsOf3: number;
}

// Every group of 3 units (cheapest first, across the whole cart) gets its cheapest unit free.
export function computeBuy2Get1(cart: { id: number; price: number; quantity: number }[]): Buy2Get1Result {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (totalItems < 3) return { isEligible: false, freeItems: [], promotionDiscount: 0, groupsOf3: 0 };

  const individualItems: { id: number; price: number; originalId: number }[] = [];
  cart.forEach((item) => {
    for (let i = 0; i < item.quantity; i++) {
      individualItems.push({ id: item.id, price: item.price, originalId: item.id });
    }
  });

  const sorted = [...individualItems].sort((a, b) => a.price - b.price);
  const groupsOf3 = Math.floor(totalItems / 3);
  const freeItems = sorted.slice(0, groupsOf3);
  const promotionDiscount = freeItems.reduce((sum, item) => sum + item.price, 0);

  return { isEligible: true, freeItems, promotionDiscount, groupsOf3 };
}

export interface PricedLine {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  flashUnits: number;
  freeUnits: number;
  paidUnits: number;
}

export interface OrderPricingResult {
  lines: PricedLine[];
  giftItem: CartItem | null;
  subtotal: number;
  // Raw Buy2Get1 numbers — computed whenever eligible, regardless of whether it's the
  // resolved choice. Needed so the "choose an offer" picker can preview savings for an
  // option that isn't currently selected.
  buy2Get1Eligible: boolean;
  buy2Get1PromotionDiscount: number;
  buy2Get1GroupsOf3: number;
  buy2Get1Applied: boolean;
  flashDiscount: number;
  discount: number;
  total: number;
  offerChoice: ResolvedOffer;
}

export interface OrderPricingInput {
  cart: CartItem[];
  buy2Get1Enabled: boolean;
  eligibleGiftPromotions: Promotion[];
  selectedOfferType: 'buy2get1' | number | null;
  flashSale: FlashSale | null;
  flashEligible: boolean;
}

// The single source of truth for order totals — used identically by the cart/checkout
// pages (for display) and the checkout API route (for the amount actually charged), so
// the two can never drift apart. A flash-sale unit is deliberately carved out of the
// cart *before* Buy 2 Get 1 runs, so the same physical unit can never absorb both
// discounts at once.
export function calculateOrderPricing(input: OrderPricingInput): OrderPricingResult {
  const { cart, buy2Get1Enabled, eligibleGiftPromotions, selectedOfferType, flashSale, flashEligible } = input;

  const flashLine = flashSale && flashEligible ? cart.find((i) => i.id === flashSale.product_id) : undefined;

  const cartForBuy2Get1 = flashLine
    ? cart.map((i) => (i.id === flashLine.id ? { ...i, quantity: i.quantity - 1 } : i)).filter((i) => i.quantity > 0)
    : cart;

  const rawBuy2Get1 = buy2Get1Enabled ? computeBuy2Get1(cartForBuy2Get1) : { isEligible: false, freeItems: [], promotionDiscount: 0, groupsOf3: 0 };

  const offerChoice = resolveOfferChoice(rawBuy2Get1.isEligible, eligibleGiftPromotions, selectedOfferType);
  const buy2Get1Applied = offerChoice === 'buy2get1';
  const selectedGift = typeof offerChoice === 'number' ? eligibleGiftPromotions.find((p) => p.id === offerChoice) ?? null : null;
  const giftItem = selectedGift ? buildFreeGiftItem(selectedGift, cart) : null;
  const freeItemsToApply = buy2Get1Applied ? rawBuy2Get1.freeItems : [];

  const lines: PricedLine[] = cart.map((item) => {
    const flashUnits = flashLine?.id === item.id ? 1 : 0;
    const freeUnits = freeItemsToApply.filter((fi) => fi.originalId === item.id).length;
    const paidUnits = item.quantity - flashUnits - freeUnits;
    return { id: item.id, name: item.name, price: item.price, image: item.image, quantity: item.quantity, flashUnits, freeUnits, paidUnits };
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const buy2Get1Discount = buy2Get1Applied ? rawBuy2Get1.promotionDiscount : 0;
  const flashDiscount = flashLine ? flashLine.price - flashSale!.sale_price : 0;
  const discount = buy2Get1Discount + flashDiscount;
  const total = subtotal - discount;

  return {
    lines,
    giftItem,
    subtotal,
    buy2Get1Eligible: rawBuy2Get1.isEligible,
    buy2Get1PromotionDiscount: rawBuy2Get1.promotionDiscount,
    buy2Get1GroupsOf3: rawBuy2Get1.groupsOf3,
    buy2Get1Applied,
    flashDiscount,
    discount,
    total,
    offerChoice,
  };
}
