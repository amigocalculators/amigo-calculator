import { createAdminClient } from '@/lib/supabase/server';
import PromotionsManager from './PromotionsManager';

export default async function AdminPromotionsPage() {
  const supabase = createAdminClient();
  const { data: promotions } = await supabase
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Promotions</h1>
      <PromotionsManager initialPromotions={promotions ?? []} />
    </div>
  );
}
