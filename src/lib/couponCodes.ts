import type { SupabaseClient } from '@supabase/supabase-js';
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
