import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthorizedUser } from '@/lib/supabase/server';
import { getActiveGiftPromotions } from '@/lib/promotions';
import { getProductPromotions } from '@/lib/productPromotions';
import { calculateOrderPricing } from '@/lib/orderPricing';
import { isFlashSaleLive } from '@/lib/flashSale';
import { getCouponByCode, getActiveCoupons } from '@/lib/couponCodes';
import { CartItem, FlashSale } from '@/types';

// Preview-only: re-derives pricing server-side exactly like /api/checkout does, so the
// discount shown here is trustworthy, but nothing from this call is persisted — checkout
// independently re-validates the code again at charge time. No login required (cart is
// accessible to guests already, per cartStore.ts).
export async function POST(req: NextRequest) {
  try {
    const { code, cart }: { code: string; cart: { id: number; quantity: number }[] } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, reason: 'not_found' }, { status: 200 });
    }
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const coupon = await getCouponByCode(supabase, code);
    if (!coupon) {
      return NextResponse.json({ valid: false, reason: 'not_found' });
    }

    const ids = cart.map((line) => line.id);
    const { data: products, error: productsError } = await supabase.from('products').select('*').in('id', ids);
    if (productsError || !products || products.length !== new Set(ids).size) {
      return NextResponse.json({ error: 'One or more products not found' }, { status: 400 });
    }

    const fullCart: CartItem[] = cart.map((line) => {
      const product = products.find((p) => p.id === line.id)!;
      return { ...product, quantity: line.quantity };
    });

    const [productPromotions, eligibleGiftPromotions, { data: flashSaleRow }, activeCoupons] = await Promise.all([
      getProductPromotions(supabase, ids),
      getActiveGiftPromotions(supabase),
      supabase.from('flash_sales').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
      getActiveCoupons(supabase),
    ]);
    const flashSale = (flashSaleRow as FlashSale | null) ?? null;
    const tiers = activeCoupons.filter((c) => c.auto_apply);

    // This is a preview, not a checkout — it must never claim a flash-sale slot (that's
    // /api/checkout's job, atomically, at charge time) and login isn't required here. So
    // eligibility is read-only, mirroring how the checkout *page* derives it for display:
    // the sale must be live, and (for a logged-in caller) not already claimed by them.
    let flashEligible = isFlashSaleLive(flashSale);
    if (flashEligible && flashSale) {
      const user = await getAuthorizedUser();
      if (user) {
        const { data: existingClaim } = await supabase
          .from('flash_sale_claims')
          .select('status')
          .eq('flash_sale_id', flashSale.id)
          .eq('user_id', user.id)
          .maybeSingle();
        if (existingClaim?.status === 'confirmed') flashEligible = false;
      }
    }

    const pricing = calculateOrderPricing({
      cart: fullCart,
      productPromotions,
      eligibleGiftPromotions,
      selectedOfferType: null,
      flashSale,
      flashEligible,
      coupon,
      tiers,
    });

    if (pricing.couponRejectReason) {
      // minCartTotal rides along only for 'below_minimum' so the UI can say "below
      // minimum of ₹X" (section 7's requirement) — it's a usability value, not a secret,
      // and doesn't help enumerate codes since it's only returned for a code that
      // already resolved to a real, active coupon.
      const minCartTotal = pricing.couponRejectReason === 'below_minimum' ? coupon.min_cart_total : undefined;
      return NextResponse.json({ valid: false, reason: pricing.couponRejectReason, minCartTotal });
    }

    return NextResponse.json({ valid: true, discount: pricing.couponDiscount, total: pricing.total });
  } catch (err) {
    console.error('Coupon validation failed:', err);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}
