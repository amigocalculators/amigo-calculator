-- Migration: product visibility toggle.
--
-- Admins previously had no way to pull a product off the storefront without
-- deleting it ("In Stock" only disables the buy button, the product still
-- lists). This adds an is_active flag, defaulting to true so every existing
-- product stays visible with no backfill needed.
--
-- Run in: Supabase Dashboard -> SQL Editor -> New Query

ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
