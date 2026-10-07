-- Migration: drop the per-product "Scheduled Sale" columns now that product_promotions
-- (migration_012) fully replaces them and no application code reads/writes them anymore.
-- Run ONLY after deploying the code changes that stop referencing products.sale_* columns.
-- Run in: Supabase Dashboard -> SQL Editor -> New Query

ALTER TABLE products DROP COLUMN IF EXISTS sale_percent;
ALTER TABLE products DROP COLUMN IF EXISTS sale_starts_at;
ALTER TABLE products DROP COLUMN IF EXISTS sale_ends_at;
ALTER TABLE products DROP COLUMN IF EXISTS sale_enabled;
