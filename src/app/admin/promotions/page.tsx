import { createAdminClient } from '@/lib/supabase/server';
import PromotionsManager from './PromotionsManager';
import ProductOffersSection from './ProductOffersSection';

export default async function AdminPromotionsPage() {
  const supabase = createAdminClient();
  const [{ data: promotions }, { data: products }, { data: productPromotions }] = await Promise.all([
    supabase.from('promotions').select('*').order('created_at', { ascending: false }),
    supabase.from('products').select('id, name, price').order('name', { ascending: true }),
    supabase.from('product_promotions').select('*').order('created_at', { ascending: false }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Promotions</h1>
      <ProductOffersSection products={products ?? []} initialProductPromotions={productPromotions ?? []} />
      <PromotionsManager initialPromotions={promotions ?? []} />
    </div>
  );
}
