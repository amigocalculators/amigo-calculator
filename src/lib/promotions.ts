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

// Fails open (true) on error — a transient fetch failure shouldn't silently kill a live offer.
export async function isBuy2Get1Enabled(supabase: SupabaseClient = createClient()): Promise<boolean> {
  const { data } = await supabase.from('site_settings').select('buy2get1_enabled').eq('id', 1).single();
  return data?.buy2get1_enabled ?? true;
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

// 'buy2get1' or a specific gift Promotion's id, or 'none' if nothing is eligible.
export type ResolvedOffer = 'buy2get1' | number | 'none';

// Offers never stack — only one resolved choice ever applies. When only one offer is
// eligible, it applies automatically. When several are, the shopper's explicit choice
// wins — defaulting to the most recently created gift promo (over Buy 2 Get 1) if undecided.
export function resolveOfferChoice(
  buy2Get1Eligible: boolean,
  eligibleGiftPromotions: Promotion[],
  selected: 'buy2get1' | number | null
): ResolvedOffer {
  const options: ('buy2get1' | number)[] = [
    ...eligibleGiftPromotions.map((p) => p.id),
    ...(buy2Get1Eligible ? (['buy2get1'] as const) : []),
  ];
  if (options.length === 0) return 'none';
  if (selected !== null && options.includes(selected)) return selected;
  return options[0];
}
