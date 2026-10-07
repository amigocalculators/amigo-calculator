import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from './supabase/client';
import { CartItem, Promotion } from '@/types';

// Accepts an injected client so server routes can pass createAdminClient() for an
// authoritative read, while client components keep using the default browser client.
export async function getActiveGiftPromotions(supabase: SupabaseClient = createClient()): Promise<Promotion[]> {
  const { data } = await supabase
    .from('promotions')
    .select('*')
    .eq('active', true)
    .not('free_gift_name', 'is', null)
    .order('created_at', { ascending: false });
  return data ?? [];
}

// Synthetic free-gift line items use a negative id (real products use SERIAL ids from 1) so
// they're never confused with a real cart item and can't collide with one.
export function buildFreeGiftItem(promotion: Promotion, cart: CartItem[]): CartItem {
  const calculatorQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const quantity = promotion.free_gift_per_unit ? Math.max(calculatorQty, 1) : 1;
  return {
    id: -promotion.id,
    name: promotion.free_gift_name!,
    price: 0,
    prevprice: 0,
    image: promotion.free_gift_image ?? '',
    description: 'Free gift',
    quantity,
  };
}

export function isFreeGiftItem(item: CartItem): boolean {
  return item.id < 0;
}

// A specific gift Promotion's id, or 'none' if nothing is eligible.
export type ResolvedOffer = number | 'none';

// When several gift promotions are eligible simultaneously, the shopper's explicit
// choice wins; otherwise the most recently created one applies automatically.
export function resolveOfferChoice(
  eligibleGiftPromotions: Promotion[],
  selected: number | null
): ResolvedOffer {
  if (eligibleGiftPromotions.length === 0) return 'none';
  if (selected !== null && eligibleGiftPromotions.some((p) => p.id === selected)) return selected;
  return eligibleGiftPromotions[0].id;
}
