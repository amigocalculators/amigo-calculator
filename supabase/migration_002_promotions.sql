-- Migration: add promotions table (admin-managed ad campaigns / offers)
-- Run in: Supabase Dashboard -> SQL Editor -> New Query

CREATE TABLE promotions (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  active BOOLEAN DEFAULT true,
  free_gift_name TEXT,
  free_gift_image TEXT,
  free_gift_value DECIMAL(10,2),
  free_gift_per_unit BOOLEAN DEFAULT false,
  instagram_posted BOOLEAN DEFAULT false,
  instagram_post_id TEXT,
  instagram_permalink TEXT,
  instagram_posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read promotions"
  ON promotions FOR SELECT USING (true);

-- Admin panel writes directly from the browser as an authenticated Supabase user
-- (same pattern relied on by the existing Exhibitions/Products admin screens).
CREATE POLICY "Authenticated can manage promotions"
  ON promotions FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- STORAGE BUCKET for promotion ad images
INSERT INTO storage.buckets (id, name, public)
VALUES ('promotions', 'promotions', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read promotion images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'promotions');

CREATE POLICY "Authenticated can upload promotion images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'promotions' AND auth.role() = 'authenticated');
