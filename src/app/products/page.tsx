import { createAdminClient } from '@/lib/supabase/server';
import ProductsClient from './ProductsClient';

export default async function ProductsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true });

  const products = (data ?? []).map((p) => ({ ...p, inStock: p.in_stock }));

  return <ProductsClient products={products} />;
}
