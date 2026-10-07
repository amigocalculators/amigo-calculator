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

  // Buy-X-get-Y either pools quantity across every product the promotion covers, or
  // counts only repeat purchases of one product — the admin's choice per promotion
  // (ProductPromotion.same_product_only). E.g. a "Buy 2 Get 1" promotion naming products
  // A, B and C either treats 1×A + 1×B + 1×C as 3 qualifying units (pooled), or requires
  // 3 units of the SAME product (same_product_only). Units are grouped by which specific
  // promotion governs them (via activeByProductId, which already resolved the one active
  // promotion per product) — and additionally by product when same_product_only is set —
  // then the cheapest units in each group are marked free, mirroring the old store-wide
  // Buy 2 Get 1's "cheapest unit in every group is free" rule.
  const promoGroups = new Map<string, { promo: ProductPromotion; units: { productId: number; price: number }[] }>();
  cartForFreeUnits.forEach((item) => {
    const promo = activeByProductId.get(item.id);
    if (!promo || !promo.buy_qty || !promo.get_qty) return;
    const groupKey = promo.same_product_only ? `${promo.id}-${item.id}` : String(promo.id);
    const group = promoGroups.get(groupKey) ?? { promo, units: [] };
    for (let i = 0; i < item.quantity; i++) group.units.push({ productId: item.id, price: item.price });
    promoGroups.set(groupKey, group);
  });

  const freeUnitsByProductId = new Map<number, number>();
  promoGroups.forEach(({ promo, units }) => {
    const freeCount = getProductPromotionFreeUnits(units.length, promo);
    if (freeCount === 0) return;
    const cheapestFirst = [...units].sort((a, b) => a.price - b.price);
    cheapestFirst.slice(0, freeCount).forEach((u) => {
      freeUnitsByProductId.set(u.productId, (freeUnitsByProductId.get(u.productId) ?? 0) + 1);
    });
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
