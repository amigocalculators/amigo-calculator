-- Migration: fix missing storage upload policies across the app
-- Run in: Supabase Dashboard -> SQL Editor -> New Query

-- PRODUCTS bucket already exists with a public-read policy (schema.sql) but was
-- missing a write policy — admin image uploads have been failing with a generic
-- "Upload failed" error because of this since the site was first built.
DROP POLICY IF EXISTS "Authenticated can upload product images" ON storage.objects;
CREATE POLICY "Authenticated can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

-- EXHIBITIONS bucket was created manually in the Supabase dashboard at some point
-- and was never captured in any tracked schema file — bringing it fully under
-- version control here so its policies are known and correct.
INSERT INTO storage.buckets (id, name, public)
VALUES ('exhibitions', 'exhibitions', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can read exhibition images" ON storage.objects;
CREATE POLICY "Public can read exhibition images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'exhibitions');

DROP POLICY IF EXISTS "Authenticated can upload exhibition images" ON storage.objects;
CREATE POLICY "Authenticated can upload exhibition images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'exhibitions' AND auth.role() = 'authenticated');
