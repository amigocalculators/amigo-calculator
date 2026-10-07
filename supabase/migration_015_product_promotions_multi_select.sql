-- Migration: let one promotion target several specific products at once, not just one.
-- Replaces the single `product_id` column with `product_ids INT[]`:
--   - NULL still means "All Products" (unchanged meaning, now on the array column).
--   - A single specific product is just a one-element array — single- and multi-product
--     selection now share the same representation.
-- Safe to run whether or not you've already run migration_014 (that one only loosened
-- product_id's NOT NULL constraint — this migration drops that column entirely, so
-- migration_014 is no longer needed; skip it if you haven't run it yet).
-- Run in: Supabase Dashboard -> SQL Editor -> New Query

ALTER TABLE product_promotions ADD COLUMN product_ids INT[];

UPDATE product_promotions
SET product_ids = CASE WHEN product_id IS NULL THEN NULL ELSE ARRAY[product_id] END;

ALTER TABLE product_promotions DROP COLUMN product_id;

ALTER TABLE product_promotions ADD CONSTRAINT product_ids_not_empty
  CHECK (product_ids IS NULL OR array_length(product_ids, 1) > 0);

-- Supports the `ov` (overlaps) / `cs` (contains) filters used when fetching promotions
-- for a given set of cart/product ids.
CREATE INDEX idx_product_promotions_product_ids ON product_promotions USING GIN (product_ids);
