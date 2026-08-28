-- Migration: block the same phone number from claiming a flash sale twice under
-- different accounts (the "1 per account" rule was trivially bypassed by signing up
-- with a new email each time, since accounts are keyed by email/phone via OTP, not
-- identity — this closes that with a real, race-safe database constraint, not just
-- an application-level check that a future bug could route around).
-- Run in: Supabase Dashboard -> SQL Editor -> New Query

CREATE UNIQUE INDEX IF NOT EXISTS orders_flash_sale_phone_unique
  ON orders (flash_sale_id, customer_phone)
  WHERE flash_sale_id IS NOT NULL AND status != 'cancelled';
