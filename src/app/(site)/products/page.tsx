import { createAdminClient } from '@/lib/supabase/server';
import ProductsClient from './ProductsClient';

// Cache this page instead of hitting Supabase on every single visit — the catalog
// doesn't change second-to-second, so a short cache window removes the DB round-trip
// from the common case while still picking up admin edits quickly.
export const revalidate = 60;

export default async function ProductsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true });

  const products = (data ?? []).map((p) => ({ ...p, inStock: p.in_stock }));

  return <ProductsClient products={products} />;
}
