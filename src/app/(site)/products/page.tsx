import { createAdminClient } from '@/lib/supabase/server';
import ProductsClient from './ProductsClient';
import { FlashSale } from '@/types';

// Cache this page instead of hitting Supabase on every single visit — the catalog
// doesn't change second-to-second, so a short cache window removes the DB round-trip
// from the common case while still picking up admin edits quickly.
export const revalidate = 60;

export default async function ProductsPage() {
  const supabase = createAdminClient();
  // flash_sales is public-readable, so this can be fetched right alongside the
  // catalog without touching cookies/auth — keeping this page fully static/ISR
  // instead of forcing it dynamic. Seeding the client with this up front means
  // the sale product's badge/sort position is correct on first paint instead of
  // popping in ~1s later once a client-side fetch resolves.
  const [{ data }, { data: settings }, { data: flashSaleRow }] = await Promise.all([
    supabase.from('products').select('*').order('id', { ascending: true }),
    supabase.from('site_settings').select('buy2get1_enabled').eq('id', 1).single(),
    supabase.from('flash_sales').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);

  const products = (data ?? []).map((p) => ({ ...p, inStock: p.in_stock }));
  const buy2Get1Enabled = settings?.buy2get1_enabled ?? true;
  const flashSale = (flashSaleRow as FlashSale | null) ?? null;

  return <ProductsClient products={products} buy2Get1Enabled={buy2Get1Enabled} initialFlashSale={flashSale} />;
}
