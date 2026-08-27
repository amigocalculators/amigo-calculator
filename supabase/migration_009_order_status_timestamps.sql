-- Migration: track when an order was actually confirmed / delivered
-- Run in: Supabase Dashboard -> SQL Editor -> New Query
--
-- orders.created_at only records when the pending row was first created (checkout
-- start), not when payment actually confirmed or when the order was delivered. The
-- customer-facing cancel window (2 days from confirmation, reopening for 2 days after
-- delivery) needs those specific timestamps.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
