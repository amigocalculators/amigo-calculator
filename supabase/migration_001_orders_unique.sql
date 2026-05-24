-- Migration: add UNIQUE constraint on orders.razorpay_order_id
-- Required for upsert (onConflict: 'razorpay_order_id') to work correctly.
-- Run in: Supabase Dashboard -> SQL Editor -> New Query

ALTER TABLE orders ADD CONSTRAINT orders_razorpay_order_id_unique UNIQUE (razorpay_order_id);
