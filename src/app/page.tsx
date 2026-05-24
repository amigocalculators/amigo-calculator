import { createAdminClient } from '@/lib/supabase/server';
import Banner2 from '@/components/Banner/Banner2';
import Banner10 from '@/components/Banner/Banner10';
import PopupWrapper from '@/components/PopupWrapper';

export default async function Home() {
  const supabase = createAdminClient();
  const { data } = await supabase.from('products').select('*').order('id', { ascending: true });
  const products = (data ?? []).map((p) => ({ ...p, inStock: p.in_stock }));

  return (
    <div className="pt-16 bg-[#f0efef]">
      <div className="max-w-[95rem] mx-auto">
        <Banner10 />
        <Banner2 products={products} />
        <PopupWrapper />
      </div>
    </div>
  );
}
