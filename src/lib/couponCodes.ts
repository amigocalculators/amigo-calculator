import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from './supabase/client';
import { CouponCode } from '@/types';

// The one place both /api/coupon/validate and /api/checkout look up a code, so they can
// never disagree about whether it's currently valid. Always call with an admin/service-role
// client (see src/lib/supabase/server.ts) — coupon_codes has no public-read RLS policy.
// Returns null for a code that doesn't exist, isn't active, or is outside its date window
// — callers don't need to distinguish those cases beyond 'not_found'.
export async function getCouponByCode(supabase: SupabaseClient, code: string): Promise<CouponCode | null> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  const { data } = await supabase
    .from('coupon_codes')
    .select('*')
    .eq('code', normalized)
    .eq('active', true)
    .maybeSingle();

  if (!data) return null;

  const now = Date.now();
  if (now < new Date(data.starts_at).getTime() || now >= new Date(data.ends_at).getTime()) return null;

  return data as CouponCode;
}

export type CouponStatus = 'off' | 'scheduled' | 'live' | 'ended';

// Admin-table display status — mirrors getProductPromotionStatus in productPromotions.ts.
// Not used by getCouponByCode above, which re-derives liveness itself against a fresh `now`.
export function getCouponStatus(coupon: Pick<CouponCode, 'active' | 'starts_at' | 'ends_at'>, now: Date = new Date()): CouponStatus {
  if (!coupon.active) return 'off';
  const nowMs = now.getTime();
  if (nowMs < new Date(coupon.starts_at).getTime()) return 'scheduled';
  if (nowMs >= new Date(coupon.ends_at).getTime()) return 'ended';
  return 'live';
}

// Unlike getCouponByCode, coupon_codes DOES have a public-read policy (see
// migration_018) scoped to exactly this use: listing every currently-active row for the
// cart drawer's progress bar (auto_apply = true rows) and "Available Coupons" carousel
// (auto_apply = false rows) — never looked up by code here. Accepts an injected client so
// server routes can pass createAdminClient() for an authoritative read. Mirrors
// getProductPromotions' split: filters out only permanently-ended rows server-side,
// leaves "has it started yet" to be resolved client-side via getCouponStatus against a
// fresh `now`, immune to any page-level cache window.
export async function getActiveCoupons(supabase: SupabaseClient = createClient()): Promise<CouponCode[]> {
  const { data } = await supabase
    .from('coupon_codes')
    .select('*')
    .eq('active', true)
    .gt('ends_at', new Date().toISOString())
    .order('min_cart_total', { ascending: true });
  return (data ?? []).filter((c) => getCouponStatus(c) === 'live');
}

export function describeDiscount(c: Pick<CouponCode, 'discount_type' | 'discount_value'>): string {
  return c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`;
}

// Shared by the checkout page's coupon input and the cart drawer's coupon carousel, so a
// rejected code reads identically in both places.
export function describeCouponRejection(data: { reason?: string; minCartTotal?: number }): string {
  if (data.reason === 'below_minimum') {
    return `This coupon needs a cart total of at least ₹${(data.minCartTotal ?? 0).toFixed(2)}.`;
  }
  if (data.reason === 'not_combinable') {
    return "This coupon can't be combined with your current offer.";
  }
  return 'This coupon is invalid or has expired.';
}
