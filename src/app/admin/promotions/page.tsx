import { createAdminClient } from '@/lib/supabase/server';
import PromotionsManager from './PromotionsManager';

export default async function AdminPromotionsPage() {
  const supabase = createAdminClient();
  const [{ data: promotions }, { data: settings }] = await Promise.all([
    supabase.from('promotions').select('*').order('created_at', { ascending: false }),
    supabase.from('site_settings').select('buy2get1_enabled').eq('id', 1).single(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Promotions</h1>
      <PromotionsManager
        initialPromotions={promotions ?? []}
        initialBuy2Get1Enabled={settings?.buy2get1_enabled ?? true}
      />
    </div>
  );
}
