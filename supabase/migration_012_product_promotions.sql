-- Migration: per-product promotions (discount %, buy-X-get-Y, or both) over a date range,
-- configured per product from the admin Promotions tab. Replaces two prior mechanisms:
--   1. The per-product "Scheduled Sale" fields on products (sale_enabled/sale_percent/
--      sale_starts_at/sale_ends_at from migration_010/_011) — a product can now have many
--      promotion rows over time instead of just one slot on the product row itself.
--   2. The single site-wide "Buy 2 Get 1 FREE" toggle (site_settings.buy2get1_enabled) —
--      buy/get is now configured per product, with customizable quantities, instead of one
--      sitewide buy-2-get-1 rule. A promotion can also leave product_id NULL to target
--      every product at once ("All Products") instead of a single one.
-- Run in: Supabase Dashboard -> SQL Editor -> New Query

CREATE TABLE product_promotions (
  id SERIAL PRIMARY KEY,
  -- NULL means "All Products" — a blanket promotion applied to the whole catalog
  -- instead of one specific product.
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  discount_percent NUMERIC CHECK (discount_percent > 0 AND discount_percent < 100),
  buy_qty INT CHECK (buy_qty > 0),
  get_qty INT CHECK (get_qty > 0),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (ends_at > starts_at),
  CHECK (discount_percent IS NOT NULL OR buy_qty IS NOT NULL),
  CHECK ((buy_qty IS NULL) = (get_qty IS NULL))
);

-- Deliberately NOT UNIQUE on product_id — unlike flash_sales, a product may have several
-- promotion rows over time (different date ranges), which is the whole point of this table.
CREATE INDEX idx_product_promotions_product_id ON product_promotions(product_id);

ALTER TABLE product_promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read product promotions"
  ON product_promotions FOR SELECT USING (true);

-- Admin panel writes directly from the browser as an authenticated Supabase user, same
-- pattern as products/promotions (see migration_005_table_write_policies.sql).
CREATE POLICY "Authenticated can manage product promotions"
  ON product_promotions FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Backfill: carry forward any existing per-product scheduled sale into the new table so
-- nothing configured in the old "Scheduled Sale" UI is silently lost. Only migrates rows
-- that had a complete, structurally-valid sale configured — sale_enabled carries over
-- as-is, so an already-off sale stays off here too.
INSERT INTO product_promotions (product_id, discount_percent, starts_at, ends_at, enabled)
SELECT id, sale_percent, sale_starts_at, sale_ends_at, sale_enabled
FROM products
WHERE sale_percent IS NOT NULL AND sale_starts_at IS NOT NULL AND sale_ends_at IS NOT NULL
  AND sale_ends_at > sale_starts_at;
