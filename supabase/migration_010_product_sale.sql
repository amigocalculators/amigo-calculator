-- Migration: per-product scheduled sale (any product can get its own %-off for a
-- date range, independent of the single-campaign Flash Sale feature).
-- Run in: Supabase Dashboard -> SQL Editor -> New Query

ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_percent NUMERIC CHECK (sale_percent > 0 AND sale_percent < 100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_starts_at TIMESTAMPTZ;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_ends_at TIMESTAMPTZ;
