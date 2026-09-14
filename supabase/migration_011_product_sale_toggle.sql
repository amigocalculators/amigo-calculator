-- Migration: explicit on/off toggle for the per-product scheduled sale, separate from
-- the %/date fields — so an admin can flip a sale off without losing the configured
-- percent and dates (mirrors the Flash Sale's own enabled/disabled toggle).
-- Run in: Supabase Dashboard -> SQL Editor -> New Query

ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_enabled BOOLEAN NOT NULL DEFAULT false;
