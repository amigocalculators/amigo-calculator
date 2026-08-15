-- Migration: add bulk_order_enquiries table (Wholesale / Corporate enquiry form)
-- Run in: Supabase Dashboard -> SQL Editor -> New Query

CREATE TABLE bulk_order_enquiries (
  id SERIAL PRIMARY KEY,
  enquiry_type TEXT NOT NULL CHECK (enquiry_type IN ('wholesale', 'corporate')),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  quantity TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bulk_order_enquiries ENABLE ROW LEVEL SECURITY;

-- No public SELECT/INSERT policy — this is private lead data (names, phone numbers, emails).
-- Inserts happen only server-side via createAdminClient() in the API route (bypasses RLS).
-- Admin reads/updates status from the browser as an authenticated user.
CREATE POLICY "Authenticated can manage bulk order enquiries"
  ON bulk_order_enquiries FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
