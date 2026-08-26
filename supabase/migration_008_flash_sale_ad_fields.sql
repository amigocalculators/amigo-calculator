-- Migration: add the "Coming Soon" message + site-wide ad fields to flash_sales
-- Run in: Supabase Dashboard -> SQL Editor -> New Query
--
-- These columns were added to migration_007_flash_sale.sql after it had already been
-- run against this database, so they never actually landed. This brings an
-- already-created flash_sales table up to date without touching existing rows —
-- IF NOT EXISTS makes it safe to run even if some of these already happen to be present.

ALTER TABLE flash_sales ADD COLUMN IF NOT EXISTS coming_soon_message TEXT;
ALTER TABLE flash_sales ADD COLUMN IF NOT EXISTS ad_image_url TEXT;
ALTER TABLE flash_sales ADD COLUMN IF NOT EXISTS ad_title TEXT;
ALTER TABLE flash_sales ADD COLUMN IF NOT EXISTS ad_caption TEXT;
