import { createClient } from './supabase/client';
import { AdSlide, FlashSale, Product } from '@/types';

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
// related-products quick-add, listing-grid quick-add, homepage ad) so lead-capture
// can't be bypassed by using a different button. Login uses the existing ?next=
// redirect mechanism. `goToCart`, when set, tags the post-login resume so the product
// page sends the customer straight to /cart instead of just landing back on itself —
// used by the homepage ad, where the point of the click is to check out, not browse.
export async function handleFlashClaim({
  isLoggedIn,
  productPath,
  goToCart = false,
  onLoginRequired,
  onClaimed,
  onError,
}: {
  isLoggedIn: boolean;
  productPath: string;
  goToCart?: boolean;
  onLoginRequired: (loginUrl: string) => void;
  onClaimed: () => void;
  onError: (message: string) => void;
}) {
  if (!isLoggedIn) {
    const resumeParams = goToCart ? 'claim=1&goto=cart' : 'claim=1';
    onLoginRequired(`/account/login?next=${encodeURIComponent(`${productPath}?${resumeParams}`)}`);
    return;
  }
  const result = await claimFlashInterest();
  if (result.ok) onClaimed();
  else onError(result.error ?? 'Failed to claim offer');
}

// Shared click handler for the homepage banner/card ad slides. A regular promotion
// slide just navigates to its href; the flash-sale slide instead claims + adds its
// product to the cart and jumps straight there — the point of an ad is to convert,
// not to make the customer click "claim" a second time on the product page.
export async function handleAdSlideClick(
  slide: AdSlide,
  router: { push: (url: string) => void },
  addToCart: (product: Product) => void,
  onError: (message: string) => void
) {
  if (!slide.flashProduct) {
    router.push(slide.href);
    return;
  }
  const flashProduct = slide.flashProduct;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  await handleFlashClaim({
    isLoggedIn: !!user,
    productPath: `/product/${flashProduct.id}`,
    goToCart: true,
    onLoginRequired: (url) => router.push(url),
    onClaimed: () => {
      addToCart(flashProduct);
      router.push('/cart');
    },
    onError,
  });
}
