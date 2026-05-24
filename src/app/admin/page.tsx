import { createAdminClient } from '@/lib/supabase/server';
import { ShoppingBag, Package, TrendingUp, IndianRupee } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  const [
    { count: totalOrders },
    { count: totalProducts },
    { data: recentOrders },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('id, customer_name, total, status, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('orders').select('total'),
  ]);

  const totalRevenue = revenueData?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;
  const todayOrders = recentOrders?.filter((o) => {
    const d = new Date(o.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length ?? 0;

  const stats = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: IndianRupee, color: 'bg-green-500' },
    { label: 'Total Orders', value: totalOrders ?? 0, icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Orders Today', value: todayOrders, icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Products', value: totalProducts ?? 0, icon: Package, color: 'bg-orange-500' },
  ];

  const statusColors: Record<string, string> = {
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-yellow-100 text-yellow-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className={`${color} p-3 rounded-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-blue-600 text-sm hover:underline">View all</Link>
        </div>
        {!recentOrders || recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-3 font-medium">{order.customer_name}</td>
                    <td className="py-3">₹{Number(order.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
