-- ============================================================
-- AMIGO WEB - Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- PRODUCTS
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  prevprice DECIMAL(10,2),
  image TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  description TEXT,
  category TEXT,
  rating TEXT,
  reviews INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  features TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  warranty TEXT,
  highlights TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  razorpay_payment_id TEXT NOT NULL,
  razorpay_order_id TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EXHIBITIONS
CREATE TABLE exhibitions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  dates TEXT NOT NULL,
  venue TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  year INTEGER NOT NULL,
  visitors INTEGER DEFAULT 0,
  products_count INTEGER DEFAULT 0,
  deals INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GALLERY IMAGES
CREATE TABLE gallery_images (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  alt TEXT,
  location TEXT,
  year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STORAGE BUCKET for product images
-- Public bucket so uploaded product images are served without auth
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

-- ============================================================
-- RLS (Row Level Security)
-- Public can READ products, exhibitions, gallery_images
-- Only service role (server API) can write to all tables
-- ============================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Public read access for products
CREATE POLICY "Public can read products"
  ON products FOR SELECT USING (true);

-- Public read access for exhibitions
CREATE POLICY "Public can read exhibitions"
  ON exhibitions FOR SELECT USING (true);

-- Public read access for gallery_images
CREATE POLICY "Public can read gallery_images"
  ON gallery_images FOR SELECT USING (true);

-- Service role bypasses RLS automatically (no policy needed for admin writes)

-- ============================================================
-- AUTO-UPDATE updated_at on products
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
