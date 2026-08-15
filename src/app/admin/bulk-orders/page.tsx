import { createAdminClient } from '@/lib/supabase/server';
import BulkOrdersManager from './BulkOrdersManager';

export default async function AdminBulkOrdersPage() {
  const supabase = createAdminClient();
  const { data: enquiries } = await supabase
    .from('bulk_order_enquiries')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Bulk Order Enquiries</h1>
      <BulkOrdersManager initialEnquiries={enquiries ?? []} />
    </div>
  );
}
