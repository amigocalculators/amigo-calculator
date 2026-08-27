-- Migration: second phase for flash sale — once all claim slots are gone, everyone
-- (not just the first N) gets a configurable % off until a configurable end date/time.
-- Run in: Supabase Dashboard -> SQL Editor -> New Query
--
-- Both columns are nullable and default to NULL — an existing flash sale with neither
-- set simply never enters this second phase (unchanged current behavior: sold out
-- just means the product reverts to full price).

ALTER TABLE flash_sales ADD COLUMN IF NOT EXISTS after_sold_out_discount_percent NUMERIC CHECK (after_sold_out_discount_percent > 0 AND after_sold_out_discount_percent < 100);
ALTER TABLE flash_sales ADD COLUMN IF NOT EXISTS after_sold_out_ends_at TIMESTAMPTZ;
