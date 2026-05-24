import { createAdminClient } from '@/lib/supabase/server';
import ProductsManager from './ProductsManager';

export default async function AdminProductsPage() {
  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Products</h1>
      <ProductsManager initialProducts={products ?? []} />
    </div>
  );
}
