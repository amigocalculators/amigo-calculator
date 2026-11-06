-- Migration: adds a free-delivery on/off toggle, shown in the cart drawer, cart page, and
-- checkout page order summaries.
--
-- IMPORTANT: `site_settings` already exists in this database — it predates this repo's
-- current migration history. It originally held `buy2get1_enabled` (a single site-wide
-- "Buy 2 Get 1 FREE" toggle, replaced by the per-product `product_promotions` table in
-- migration_012 — see that file's header comment) and later gained
-- `coupon_auto_apply_enabled` from an unrelated, never-merged feature attempt. Neither
-- column is read by any current app code; this migration only ADDS a column to the
-- existing table; it does not CREATE it (that already failed once with "relation already
-- exists" and left the column missing).
-- Run in: Supabase Dashboard -> SQL Editor -> New Query

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS free_delivery_enabled BOOLEAN NOT NULL DEFAULT true;

-- Backfill in case the existing row predates this column and somehow didn't pick up the
-- column default (defensive — ADD COLUMN ... DEFAULT already backfills existing rows).
UPDATE site_settings SET free_delivery_enabled = true WHERE free_delivery_enabled IS NULL;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read — every visitor's cart/checkout summary needs to know whether to show
-- "Delivery: FREE", mirroring promotions/product_promotions/flash_sales' public policy.
-- (RLS may already have been enabled with equivalent policies from this table's earlier
-- life — DROP IF EXISTS + CREATE makes this safe to run regardless.)
DROP POLICY IF EXISTS "Public can read site settings" ON site_settings;
CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can manage site settings" ON site_settings;
CREATE POLICY "Authenticated can manage site settings"
  ON site_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
