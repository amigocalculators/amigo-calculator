-- Migration: let the admin choose, per promotion, how a Buy-X-Get-Y rule counts units
-- when it covers more than one product (a multi-select or "All Products" promotion):
--   - same_product_only = true  -> only repeat purchases of the SAME product count
--     (buy 2 of product A to get 1 A free; buying 1 A + 1 B does not qualify).
--   - same_product_only = false -> quantities pool across every product the promotion
--     covers (1 A + 1 B + 1 C together count toward the buy/get total).
-- Defaults to true (the narrower, classic BOGO behavior) so it only changes outcomes
-- when an admin explicitly opts a promotion into pooling.
-- Run in: Supabase Dashboard -> SQL Editor -> New Query

ALTER TABLE product_promotions ADD COLUMN same_product_only BOOLEAN NOT NULL DEFAULT true;
