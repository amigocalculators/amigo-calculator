-- Migration: allow product_promotions.product_id to be NULL, meaning "All Products" —
-- a blanket promotion applied to the whole catalog instead of one specific product.
-- Run this if you already ran migration_012_product_promotions.sql with product_id
-- NOT NULL. If you haven't run migration_012 yet, just run the updated version of that
-- file instead — it already creates the column as nullable, and this file is a no-op
-- on top of it (DROP CONSTRAINT IF EXISTS / ALTER COLUMN DROP NOT NULL are both safe to
-- run again).
-- Run in: Supabase Dashboard -> SQL Editor -> New Query

ALTER TABLE product_promotions ALTER COLUMN product_id DROP NOT NULL;
