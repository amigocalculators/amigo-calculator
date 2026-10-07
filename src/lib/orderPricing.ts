import { CartItem, Promotion, FlashSale, ProductPromotion } from '@/types';
import { buildFreeGiftItem, resolveOfferChoice, ResolvedOffer } from './promotions';
import { isSoldOutDiscountActive, getSoldOutDiscountPrice } from './flashSale';
import { getActiveProductPromotion, getProductPromotionPrice, getProductPromotionFreeUnits } from './productPromotions';

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
  // Total ₹ value of free units granted by per-product buy/get promotions this order.
  productPromotionDiscount: number;
  flashDiscount: number;
  discount: number;
  total: number;
  offerChoice: ResolvedOffer;
}

export interface OrderPricingInput {
  cart: CartItem[];
  productPromotions: ProductPromotion[];
  eligibleGiftPromotions: Promotion[];
  selectedOfferType: number | null;
  flashSale: FlashSale | null;
  flashEligible: boolean;
}

// The single source of truth for order totals — used identically by the cart/checkout
// pages (for display) and the checkout API route (for the amount actually charged), so
// the two can never drift apart. A flash-sale unit is deliberately carved out of the
// cart *before* any per-product buy/get free-unit calc runs, so the same physical unit
// can never absorb both discounts at once.
export function calculateOrderPricing(input: OrderPricingInput): OrderPricingResult {
  const { cart: rawCart, productPromotions, eligibleGiftPromotions, selectedOfferType, flashSale, flashEligible } = input;

  // Second flash-sale phase: once claim slots are gone, an admin-configured %-off can
  // apply to every unit of that product for everyone until a configured end time — a
  // plain price override, unlike the single-unit/one-per-account claim discount below.
  const flashPricedCart = flashSale && isSoldOutDiscountActive(flashSale)
    ? rawCart.map((item) => item.id === flashSale.product_id ? { ...item, price: getSoldOutDiscountPrice(flashSale, item.price) } : item)
    : rawCart;

  const now = new Date();

  // Per-product promotion (discount% and/or buy-X-get-Y), configured per product in the
  // admin Promotions tab. Deliberately skips whatever product is the current flash-sale
  // product — that one's pricing is fully governed by the flash-sale logic above/below,
  // so the two discount sources never stack on the same item.
  const activeByProductId = new Map<number, ProductPromotion>();
  flashPricedCart.forEach((item) => {
    if (item.id === flashSale?.product_id) return;
    const active = getActiveProductPromotion(productPromotions, item.id, now);
    if (active) activeByProductId.set(item.id, active);
  });

  const cart = flashPricedCart.map((item) => {
    const promo = activeByProductId.get(item.id);
    return promo ? { ...item, price: getProductPromotionPrice(item.price, promo) } : item;
  });

  // Deliberately read from rawCart, never the (possibly sold-out-discount-remapped)
  // cart — the claimed unit's discount must always be measured against the true
  // original price, never against an already-discounted one.
  const flashLine = flashSale && flashEligible ? rawCart.find((i) => i.id === flashSale.product_id) : undefined;

  const cartForFreeUnits = flashLine
    ? cart.map((i) => (i.id === flashLine.id ? { ...i, quantity: i.quantity - 1 } : i)).filter((i) => i.quantity > 0)
    : cart;

  const freeUnitsByProductId = new Map<number, number>();
  cartForFreeUnits.forEach((item) => {
    const promo = activeByProductId.get(item.id);
    if (!promo) return;
    const free = getProductPromotionFreeUnits(item.quantity, promo);
    if (free > 0) freeUnitsByProductId.set(item.id, free);
  });

  const offerChoice = resolveOfferChoice(eligibleGiftPromotions, selectedOfferType);
  const selectedGift = typeof offerChoice === 'number' ? eligibleGiftPromotions.find((p) => p.id === offerChoice) ?? null : null;
  const giftItem = selectedGift ? buildFreeGiftItem(selectedGift, cart) : null;

  const lines: PricedLine[] = cart.map((item) => {
    const flashUnits = flashLine?.id === item.id ? 1 : 0;
    const freeUnits = freeUnitsByProductId.get(item.id) ?? 0;
    const paidUnits = item.quantity - flashUnits - freeUnits;
    return { id: item.id, name: item.name, price: item.price, image: item.image, quantity: item.quantity, flashUnits, freeUnits, paidUnits };
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const productPromotionDiscount = lines.reduce((sum, l) => sum + l.price * l.freeUnits, 0);
  const flashDiscount = flashLine ? flashLine.price - flashSale!.sale_price : 0;
  const discount = productPromotionDiscount + flashDiscount;
  const total = subtotal - discount;

  return { lines, giftItem, subtotal, productPromotionDiscount, flashDiscount, discount, total, offerChoice };
}
