-- Migration: cart-level coupon codes, applied on top of (never instead of) whatever
-- flash-sale / per-product-promotion / free-gift discounts already apply to an order.
-- Unlike promotions/product_promotions, coupon codes are NOT publicly readable — a code
-- must be typed in to be looked up, never enumerable by listing the table from the
-- client. Validation/lookup always goes through the admin/service-role client
-- server-side (see src/lib/couponCodes.ts), which bypasses RLS.
-- Run in: Supabase Dashboard -> SQL Editor -> New Query

CREATE TABLE coupon_codes (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('flat', 'percentage')),
  discount_value NUMERIC NOT NULL CHECK (
    (discount_type = 'percentage' AND discount_value > 0 AND discount_value <= 100)
    OR (discount_type = 'flat' AND discount_value > 0)
  ),
  min_cart_total NUMERIC NOT NULL DEFAULT 0 CHECK (min_cart_total >= 0),
  -- Admin-configurable: if false, this coupon is rejected/ignored when the cart already
  -- has a flash-sale discount, a product promotion discount, or a selected free gift
  -- active (see calculateOrderPricing's 'not_combinable' rejection in orderPricing.ts).
  combinable_with_other_offers BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (ends_at > starts_at)
);

ALTER TABLE coupon_codes ENABLE ROW LEVEL SECURITY;

-- Deliberately no "public can read" policy here (unlike promotions/product_promotions)
-- — coupon codes must not be publicly listable/enumerable from the client. Code lookups
-- for validation happen server-side via the admin/service-role client, which bypasses
-- RLS (same pattern already used in src/app/api/checkout/route.ts).
CREATE POLICY "Authenticated can manage coupon codes"
  ON coupon_codes FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Records which code, if any, was applied to an order. Nullable, no backfill needed —
-- purely additive, existing orders/checkout flows are unaffected when no coupon is used.
ALTER TABLE orders ADD COLUMN coupon_code TEXT;
