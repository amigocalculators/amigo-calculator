import { createAdminClient } from '@/lib/supabase/server';
import Banner2 from '@/components/Banner/Banner2';
import Banner10 from '@/components/Banner/Banner10';
import PromotionStrip from '@/components/Banner/PromotionStrip';
import PopupWrapper from '@/components/PopupWrapper';

export default async function Home() {
  const supabase = createAdminClient();
  const [{ data }, { data: promoData }] = await Promise.all([
    supabase.from('products').select('*').order('id', { ascending: true }),
    supabase.from('promotions').select('*').eq('active', true).order('created_at', { ascending: false }).limit(1),
  ]);
  const products = (data ?? []).map((p) => ({ ...p, inStock: p.in_stock }));
  const activePromotion = promoData?.[0] ?? null;

  return (
    <div className="pt-16 bg-[#f0efef]">
      <div className="max-w-[95rem] mx-auto">
        <Banner10 />
        {activePromotion && <PromotionStrip promotion={activePromotion} />}
        <Banner2 products={products} />
        <PopupWrapper promotion={activePromotion} />
      </div>
    </div>
  );
}
