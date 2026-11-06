-- Migration: tiered cart-subtotal discounts ("Extra N% OFF" progress bar in the cart
-- drawer) reuse the existing coupon_codes table instead of a new one. A row with
-- auto_apply = true is a tier — no code is ever typed by a shopper; it applies
-- automatically, site-wide, once the cart subtotal crosses its min_cart_total (see
-- calculateOrderPricing in src/lib/orderPricing.ts). auto_apply = false (the default) is
-- every coupon that exists today — unaffected except for gaining this new column.
--
-- Unlike every other row in this table so far, the cart drawer's "Available Coupons"
-- carousel needs to publicly list every active, manually-typed coupon (not just look one
-- up by code) — so this also adds a public SELECT policy, mirroring
-- product_promotions/promotions/flash_sales. This doesn't weaken the existing
-- can't-brute-force-a-code protection (that flow still only ever used the admin client);
-- it just additionally lets the browser list rows for display.
-- Run in: Supabase Dashboard -> SQL Editor -> New Query

ALTER TABLE coupon_codes ADD COLUMN auto_apply BOOLEAN NOT NULL DEFAULT false;

CREATE POLICY "Public can read coupon codes"
  ON coupon_codes FOR SELECT USING (true);

-- Records which tier (if any) auto-applied to an order, alongside the existing
-- coupon_code column — kept separate because both can be true on the same order at once
-- (a tier and a manually-typed combinable coupon can stack; see calculateOrderPricing's
-- not_combinable check).
ALTER TABLE orders ADD COLUMN tier_code TEXT;
