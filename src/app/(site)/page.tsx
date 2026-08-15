import { createAdminClient } from '@/lib/supabase/server';
import Banner2 from '@/components/Banner/Banner2';
import Banner10 from '@/components/Banner/Banner10';
import PromotionStrip from '@/components/Banner/PromotionStrip';
import PopupWrapper from '@/components/PopupWrapper';

// Cache this page instead of hitting Supabase on every single visit — admin changes
// (new promotion, product edit) show up within this window rather than instantly.
export const revalidate = 30;

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
        {activePromotion ? (
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2">
              <Banner10 />
            </div>
            <div className="md:w-1/2">
              <PromotionStrip promotion={activePromotion} />
            </div>
          </div>
        ) : (
          <Banner10 />
        )}
        <Banner2 products={products} />
        <PopupWrapper promotion={activePromotion} />
      </div>
    </div>
  );
}
