-- Migration: product star ratings.
--
-- Each product shows exactly one rating badge, in one of two states, chosen
-- automatically and permanently per product (no site-wide on/off switch):
--
--   1. No real customer rating yet -> show the admin-editable "dummy" rating
--      (dummy_rating / dummy_rating_count). Seeded below with a random, plausible
--      placeholder value for every existing product so admins don't have to fill
--      them in by hand; new products get a random placeholder pre-filled in the
--      admin "Add Product" form (see ProductsManager.tsx) which they can edit
--      before saving.
--   2. At least one real rating exists -> show the real average
--      (real_rating_avg / real_rating_count), computed from product_ratings and
--      kept in sync by the trigger below every time a new rating is inserted.
--      Once a product crosses into this state it never switches back.
--
-- Real ratings can only be left by a logged-in customer, for a product they
-- actually bought, once per order, and only once that order is past 'pending'/
-- 'cancelled' (i.e. checkout completed) -- all enforced in /api/ratings/submit,
-- not in SQL, since ownership verification needs the session + profile lookup.
--
-- Run in: Supabase Dashboard -> SQL Editor -> New Query

ALTER TABLE products ADD COLUMN IF NOT EXISTS dummy_rating NUMERIC(2,1) DEFAULT ROUND((4.3 + random() * 0.6)::numeric, 1);
ALTER TABLE products ADD COLUMN IF NOT EXISTS dummy_rating_count INTEGER DEFAULT floor(35 + random() * 400)::int;
ALTER TABLE products ADD COLUMN IF NOT EXISTS real_rating_avg NUMERIC(2,1);
ALTER TABLE products ADD COLUMN IF NOT EXISTS real_rating_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS product_ratings (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  stars SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- One rating per product per order -- stops a single purchase from being
  -- rated (and counted toward the average) more than once.
  UNIQUE (order_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_product_ratings_product_id ON product_ratings(product_id);

-- Recomputes the cached average/count on `products` whenever a real rating comes in,
-- so every page that already does `select('*') from products` picks it up for free
-- with no joins or app-side aggregation.
CREATE OR REPLACE FUNCTION update_product_rating_aggregate() RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET real_rating_avg = (SELECT ROUND(AVG(stars)::numeric, 1) FROM product_ratings WHERE product_id = NEW.product_id),
      real_rating_count = (SELECT COUNT(*) FROM product_ratings WHERE product_id = NEW.product_id)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_product_rating_aggregate ON product_ratings;
CREATE TRIGGER trg_update_product_rating_aggregate
  AFTER INSERT ON product_ratings
  FOR EACH ROW EXECUTE FUNCTION update_product_rating_aggregate();

ALTER TABLE product_ratings ENABLE ROW LEVEL SECURITY;

-- Public read mirrors every other public-facing table's policy (promotions,
-- flash_sales, site_settings) for consistency, though the storefront reads the
-- cached columns on `products` today rather than querying this table directly.
DROP POLICY IF EXISTS "Public can read product ratings" ON product_ratings;
CREATE POLICY "Public can read product ratings"
  ON product_ratings FOR SELECT USING (true);

-- Deliberately no INSERT/UPDATE/DELETE policy: every write goes through
-- /api/ratings/submit using the service-role client (bypasses RLS) after that
-- route verifies the order belongs to the logged-in customer and actually
-- contains this product -- keeping "did they really buy it" logic in one place.
