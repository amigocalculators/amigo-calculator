import { createClient } from './supabase/client';
import { CartItem, Promotion } from '@/types';

export async function getActiveGiftPromotion(): Promise<Promotion | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('promotions')
    .select('*')
    .eq('active', true)
    .not('free_gift_name', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1);
  return data?.[0] ?? null;
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
