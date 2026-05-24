import { createAdminClient } from '@/lib/supabase/server';
import OrdersTable from './OrdersTable';

export default async function AdminOrdersPage() {
  const supabase = createAdminClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Orders</h1>
      <OrdersTable initialOrders={orders ?? []} />
    </div>
  );
}
