'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChevronDown, RefreshCw, Search } from 'lucide-react';

const STATUSES = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusColors: Record<string, string> = {
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

type Order = {
  id: string;
  razorpay_payment_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: { line1: string; line2?: string; city: string; state: string; pincode: string };
  items: { id: number; name: string; price: number; quantity: number; image: string }[];
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  created_at: string;
};

export default function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const supabase = createClient();

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const syncFromRazorpay = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const res = await fetch('/api/admin/sync-razorpay', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setSyncMessage(`Error: ${data.error ?? 'Sync failed.'}`);
        return;
      }
      setSyncMessage(data.message ?? 'Done.');
      if (data.synced > 0) {
        // Reload to show new orders
        window.location.reload();
      }
    } catch {
      setSyncMessage('Sync failed. Check console.');
    } finally {
      setSyncing(false);
    }
  };

  const filtered = orders.filter(
    (o) =>
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      o.razorpay_payment_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-4 border-b flex items-center gap-4 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or payment ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          {syncMessage && <span className="text-sm text-gray-600">{syncMessage}</span>}
          <button
            onClick={syncFromRazorpay}
            disabled={syncing}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing…' : 'Sync from Razorpay'}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 border-b">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((order) => (
                <React.Fragment key={order.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-gray-500 text-xs">{order.customer_email}</p>
                      <p className="text-gray-500 text-xs">{order.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      ₹{Number(order.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      {Number(order.discount) > 0 && (
                        <p className="text-green-600 text-xs">-₹{Number(order.discount).toFixed(2)} off</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`appearance-none pr-6 pl-2 py-1 rounded-full text-xs font-medium cursor-pointer border-0 outline-none ${statusColors[order.status] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-white text-gray-900 capitalize">{s}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}<br />
                      {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        {expanded === order.id ? 'Hide' : 'Details'}
                      </button>
                    </td>
                  </tr>
                  {expanded === order.id && (
                    <tr key={`${order.id}-detail`} className="bg-blue-50">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium mb-1">Shipping Address</p>
                            <p className="text-gray-600">
                              {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}<br />
                              {order.address.city}, {order.address.state} — {order.address.pincode}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium mb-1">Payment ID</p>
                            <p className="text-gray-600 font-mono text-xs">{order.razorpay_payment_id}</p>
                            <p className="font-medium mt-3 mb-1">Items</p>
                            {order.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-2 mb-1">
                                <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded" />
                                <span>{item.name} ×{item.quantity} — ₹{(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
