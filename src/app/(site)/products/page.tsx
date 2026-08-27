import { createAdminClient } from '@/lib/supabase/server';
import ProductsClient from './ProductsClient';

// Cache this page instead of hitting Supabase on every single visit — the catalog
// doesn't change second-to-second, so a short cache window removes the DB round-trip
// from the common case while still picking up admin edits quickly.
export const revalidate = 60;

export default async function ProductsPage() {
  const supabase = createAdminClient();
  const [{ data }, { data: settings }] = await Promise.all([
    supabase.from('products').select('*').order('id', { ascending: true }),
    supabase.from('site_settings').select('buy2get1_enabled').eq('id', 1).single(),
  ]);

  const products = (data ?? []).map((p) => ({ ...p, inStock: p.in_stock }));
  const buy2Get1Enabled = settings?.buy2get1_enabled ?? true;

  return <ProductsClient products={products} buy2Get1Enabled={buy2Get1Enabled} />;
}
