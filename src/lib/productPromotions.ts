import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from './supabase/client';
import { ProductPromotion } from '@/types';

// product_ids === null means "All Products" — a blanket promotion that applies to every
// product. Otherwise it's a list of one or more specific products it's scoped to.
//
// Tie-break rule: when several promotion rows both apply to a product at once (an
// all-products promo running alongside a promotion that names this product, or two
// product-specific windows overlapping), a promotion that explicitly names this product
// wins over a blanket "All Products" one; within the same specificity, the most recently
// created row (highest id) wins. Admins are expected to avoid overlapping windows for one
// product; this is just a deterministic tie-break of last resort.
export function getActiveProductPromotion(
  promotions: ProductPromotion[],
  productId: number,
  now: Date = new Date()
): ProductPromotion | null {
  const nowMs = now.getTime();
  const active = promotions.filter((p) =>
    (p.product_ids === null || p.product_ids.includes(productId)) &&
    p.enabled &&
    new Date(p.starts_at).getTime() <= nowMs &&
    nowMs < new Date(p.ends_at).getTime()
  );
  if (active.length === 0) return null;
  const specific = active.filter((p) => p.product_ids !== null);
  const candidates = specific.length > 0 ? specific : active;
  return candidates.reduce((latest, p) => (p.id > latest.id ? p : latest));
}

export function getProductPromotionPrice(price: number, promotion: Pick<ProductPromotion, 'discount_percent'>): number {
  if (!promotion.discount_percent) return price;
  // Rounded to the nearest whole rupee, not the nearest paisa — matches the old
  // getProductSalePrice() this replaces.
  return Math.round(price * (1 - promotion.discount_percent / 100));
}

// buy_qty paid + get_qty free per group, e.g. buy=1,get=1 -> every 2 units 1 is free
// (classic BOGO); buy=2,get=1 -> every 3 units 1 is free (the shape of the old sitewide
// Buy 2 Get 1). `quantity` is the pooled unit count across every product this promotion
// covers (see orderPricing.ts), not necessarily one product's own quantity.
export function getProductPromotionFreeUnits(quantity: number, promotion: Pick<ProductPromotion, 'buy_qty' | 'get_qty'>): number {
  if (!promotion.buy_qty || !promotion.get_qty) return 0;
  const groupSize = promotion.buy_qty + promotion.get_qty;
  return Math.floor(quantity / groupSize) * promotion.get_qty;
}

export type ProductPromotionStatus = 'off' | 'scheduled' | 'live' | 'ended';

export function getProductPromotionStatus(promotion: Pick<ProductPromotion, 'enabled' | 'starts_at' | 'ends_at'>, now: Date = new Date()): ProductPromotionStatus {
  if (!promotion.enabled) return 'off';
  const nowMs = now.getTime();
  if (nowMs < new Date(promotion.starts_at).getTime()) return 'scheduled';
  if (nowMs >= new Date(promotion.ends_at).getTime()) return 'ended';
  return 'live';
}

// Short human label for badges/admin table, e.g. "20% OFF + Buy 1 Get 1 FREE".
export function getProductPromotionLabel(promotion: Pick<ProductPromotion, 'discount_percent' | 'buy_qty' | 'get_qty'>): string {
  const parts: string[] = [];
  if (promotion.discount_percent) parts.push(`${promotion.discount_percent}% OFF`);
  if (promotion.buy_qty && promotion.get_qty) parts.push(`Buy ${promotion.buy_qty} Get ${promotion.get_qty} FREE`);
  return parts.join(' + ');
}

// Accepts an injected client so server routes can pass createAdminClient() for an
// authoritative read, while client components keep using the default browser client.
// Filters to enabled rows that haven't permanently ended — liveness vs. "scheduled" is
// still resolved client-side against Date.now() via getActiveProductPromotion/Status
// above, immune to any page-level cache window (same philosophy as flash_sales).
export async function getProductPromotions(
  supabase: SupabaseClient = createClient(),
  productIds?: number[]
): Promise<ProductPromotion[]> {
  let query = supabase
    .from('product_promotions')
    .select('*')
    .eq('enabled', true)
    .gt('ends_at', new Date().toISOString());
  // `ov` (overlap) matches a row whose product_ids shares any id with productIds;
  // `product_ids.is.null` includes "All Products" rows, which an overlap check alone
  // would miss.
  if (productIds && productIds.length > 0) query = query.or(`product_ids.ov.{${productIds.join(',')}},product_ids.is.null`);
  const { data } = await query;
  return data ?? [];
}
