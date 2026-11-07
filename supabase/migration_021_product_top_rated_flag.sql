-- Migration: curated "Top Rated" flag, layered on top of migration_020's star ratings.
--
-- Showing the numeric star rating pill on every single product made every product
-- look "Top Rated" -- not the intent. The "Top Rated" label is now a separate flag,
-- decided differently depending on which rating a product is currently showing:
--
--   - Dummy phase (no real ratings yet): admin manually checks/unchecks "Top Rated"
--     per product in the admin panel (dummy_top_rated). Nothing here is automatic --
--     start with ~5-6 products checked, the rest unchecked.
--   - Real phase (product has >=1 real rating): the flag becomes fully automatic.
--     The trigger below ranks every real-rated product by average (ties broken by
--     rating count) and flags only the top 5 as real_top_rated. This is recomputed
--     on every new rating, so the top-5 set shifts as ratings come in, and is never
--     manually editable once a product is in this phase.
--
-- The star+count pill itself still shows for every product with a rating (dummy or
-- real) -- only the "Top Rated" label is gated by these new flags.
--
-- Run in: Supabase Dashboard -> SQL Editor -> New Query

ALTER TABLE products ADD COLUMN IF NOT EXISTS dummy_top_rated BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS real_top_rated BOOLEAN NOT NULL DEFAULT false;

-- Replaces the aggregate-only function from migration_020 with one that also
-- re-ranks real-rated products after updating the triggering product's average.
-- The trigger created in migration_020 (AFTER INSERT ON product_ratings) already
-- points at this function by name, so it picks up the new behavior with no
-- CREATE TRIGGER needed here.
CREATE OR REPLACE FUNCTION update_product_rating_aggregate() RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET real_rating_avg = (SELECT ROUND(AVG(stars)::numeric, 1) FROM product_ratings WHERE product_id = NEW.product_id),
      real_rating_count = (SELECT COUNT(*) FROM product_ratings WHERE product_id = NEW.product_id)
  WHERE id = NEW.product_id;

  WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY real_rating_avg DESC, real_rating_count DESC) AS rnk
    FROM products
    WHERE real_rating_count > 0
  )
  UPDATE products p
  SET real_top_rated = (ranked.rnk <= 5)
  FROM ranked
  WHERE p.id = ranked.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
