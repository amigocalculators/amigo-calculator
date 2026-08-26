import { createAdminClient } from '@/lib/supabase/server';
import UsersManager from './UsersManager';

export default async function AdminUsersPage() {
  const supabase = createAdminClient();
  const [{ data: profiles }, { data: orders }] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
  ]);

  const users = (profiles ?? []).map((p) => {
    const matchingOrders = (orders ?? []).filter(
      (o) => (p.email && o.customer_email === p.email) || (p.phone && o.customer_phone === p.phone)
    );
    return {
      ...p,
      orders: matchingOrders,
      orderCount: matchingOrders.length,
      totalSpent: matchingOrders.reduce((sum, o) => sum + Number(o.total), 0),
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Users</h1>
      <UsersManager initialUsers={users} />
    </div>
  );
}
