import { createAdminClient } from '@/lib/supabase/server';
import SiteSettingsManager from './SiteSettingsManager';

export default async function AdminSettingsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from('site_settings').select('free_delivery_enabled').eq('id', 1).maybeSingle();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Settings</h1>
      <SiteSettingsManager initialFreeDeliveryEnabled={data?.free_delivery_enabled ?? true} />
    </div>
  );
}
