-- Migration: flash sale (limited-slot, time-boxed price override on one product)
-- Run in: Supabase Dashboard -> SQL Editor -> New Query

CREATE TABLE flash_sales (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL UNIQUE REFERENCES products(id),
  sale_price DECIMAL(10,2) NOT NULL CHECK (sale_price >= 0),
  max_claims INT NOT NULL DEFAULT 10 CHECK (max_claims > 0),
  claimed_count INT NOT NULL DEFAULT 0 CHECK (claimed_count >= 0),
  starts_at TIMESTAMPTZ NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  coming_soon_message TEXT,
  -- Site-wide ad (top banner + floating card, alongside regular promotions). Only
  -- shown in those placements once an image is set — title/caption fall back to an
  -- auto-generated default if left blank. Leaving the image empty just means the sale
  -- keeps working (pinned in the listing, live on its own product page) without a
  -- separate site-wide ad push.
  ad_image_url TEXT,
  ad_title TEXT,
  ad_caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracks who has claimed (or merely shown interest in) the flash price, one row per
-- account per sale — the UNIQUE constraint is the hard "1 per account, ever" enforcement.
-- 'interested' rows are the lead-capture signal (added to cart, may never pay);
-- 'confirmed' rows are real, paid claims and are what counts toward claimed_count.
CREATE TABLE flash_sale_claims (
  id SERIAL PRIMARY KEY,
  flash_sale_id INT NOT NULL REFERENCES flash_sales(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'interested' CHECK (status IN ('interested', 'confirmed')),
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  UNIQUE (flash_sale_id, user_id)
);

-- Lets checkout compute authoritative pricing/eligibility server-side and lets the
-- admin leads table trace a claim back to the order it produced.
ALTER TABLE orders ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE orders ADD COLUMN flash_sale_id INT REFERENCES flash_sales(id);

ALTER TABLE flash_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read flash sales"
  ON flash_sales FOR SELECT USING (true);
-- No write policy — writes only ever go through the admin-authenticated,
-- service-role /api/admin/flash-sale route.

ALTER TABLE flash_sale_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own claim"
  ON flash_sale_claims FOR SELECT USING (auth.uid() = user_id);
-- No insert/update policy — writes only ever go through service-role server routes
-- (claim-interest and payment confirmation). This table holds lead/PII-adjacent data.

-- Atomic slot counter. A single UPDATE is inherently race-safe under Postgres's
-- row-level locking during the statement, so concurrent callers can never push
-- claimed_count past max_claims — no explicit transaction/advisory lock needed.
-- Called at checkout-start (see /api/checkout), the moment the price is decided —
-- not at payment-confirmation. An earlier version called this only at confirmation
-- time, which let a burst of simultaneous checkouts all see "room available" before
-- any single payment had confirmed and moved the counter, oversold beyond max_claims.
CREATE OR REPLACE FUNCTION claim_flash_sale_slot(p_flash_sale_id INT)
RETURNS INT LANGUAGE plpgsql AS $$
DECLARE
  new_count INT;
BEGIN
  UPDATE flash_sales
  SET claimed_count = claimed_count + 1
  WHERE id = p_flash_sale_id AND enabled = true AND starts_at <= now() AND claimed_count < max_claims
  RETURNING claimed_count INTO new_count;
  RETURN new_count; -- NULL if sold out / disabled / not started yet
END;
$$;

-- Critical: without this, any logged-in customer could call this RPC directly from
-- devtools (supabase.rpc('claim_flash_sale_slot', ...)) and drain all the slots without
-- ever paying. This function must only ever be invoked server-side with the service role.
REVOKE EXECUTE ON FUNCTION claim_flash_sale_slot(INT) FROM PUBLIC, anon, authenticated;
