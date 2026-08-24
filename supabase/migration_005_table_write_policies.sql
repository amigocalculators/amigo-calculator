-- Migration: fix missing table write policies for admin-managed content
-- Run in: Supabase Dashboard -> SQL Editor -> New Query
--
-- schema.sql only ever granted public SELECT on products/exhibitions/gallery_images,
-- assuming admin writes went through a service-role server route. In reality the
-- admin panel writes directly from the browser as an authenticated user (same
-- pattern as Promotions), so every add/edit/delete on these three tables has been
-- silently failing — the UI shows no error, it just doesn't save.

DROP POLICY IF EXISTS "Authenticated can manage products" ON products;
CREATE POLICY "Authenticated can manage products"
  ON products FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can manage exhibitions" ON exhibitions;
CREATE POLICY "Authenticated can manage exhibitions"
  ON exhibitions FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can manage gallery_images" ON gallery_images;
CREATE POLICY "Authenticated can manage gallery_images"
  ON gallery_images FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
