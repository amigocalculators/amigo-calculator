import { createClient } from './supabase/client';
import { FlashSale } from '@/types';

export function isFlashSaleLive(sale: FlashSale | null): sale is FlashSale {
  if (!sale) return false;
  return sale.enabled && new Date(sale.starts_at) <= new Date() && sale.claimed_count < sale.max_claims;
}

// Public flash-sale row (if any) plus whether the current session's user has already
// used their one-per-account claim on it. `flash_sales` is public-readable; the
// "have I claimed" check relies on the flash_sale_claims RLS policy that only ever
// exposes a user their own row.
export async function getFlashSaleStatus(): Promise<{ sale: FlashSale | null; alreadyClaimed: boolean }> {
  const supabase = createClient();
  const { data: sale } = await supabase
    .from('flash_sales')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sale) return { sale: null, alreadyClaimed: false };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { sale, alreadyClaimed: false };

  const { data: claim } = await supabase
    .from('flash_sale_claims')
    .select('status')
    .eq('flash_sale_id', sale.id)
    .eq('user_id', user.id)
    .maybeSingle();

  return { sale, alreadyClaimed: claim?.status === 'confirmed' };
}

// Records the lead the instant a logged-in customer clicks "claim" — independent of
// whether they ever pay. Safe to call repeatedly (the server route no-ops on conflict).
export async function claimFlashInterest(): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch('/api/flash-sale/claim-interest', { method: 'POST' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.error ?? 'Failed to claim offer' };
  }
  return { ok: true };
}

// Shared click-handler logic for every "Claim for ₹1" entry point (product detail page,
// related-products quick-add, listing-grid quick-add) so lead-capture can't be bypassed
// by using a different button. Login uses the existing ?next= redirect mechanism.
export async function handleFlashClaim({
  isLoggedIn,
  productPath,
  onLoginRequired,
  onClaimed,
  onError,
}: {
  isLoggedIn: boolean;
  productPath: string;
  onLoginRequired: (loginUrl: string) => void;
  onClaimed: () => void;
  onError: (message: string) => void;
}) {
  if (!isLoggedIn) {
    onLoginRequired(`/account/login?next=${encodeURIComponent(`${productPath}?claim=1`)}`);
    return;
  }
  const result = await claimFlashInterest();
  if (result.ok) onClaimed();
  else onError(result.error ?? 'Failed to claim offer');
}
