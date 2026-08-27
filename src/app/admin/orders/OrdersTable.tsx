'use client';

import React, { useState } from 'react';
import { ChevronDown, RefreshCw, Search, Mail } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending:    'bg-orange-100 text-orange-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  abandoned:  'bg-gray-100 text-gray-500',
};

// Only statuses reachable from the current one — final states have no options.
// pending -> confirmed is deliberately absent: confirmation only ever happens via a verified
// payment, never a manual click. The only manual move out of pending closes an unpaid checkout.
const NEXT_STATUSES: Record<string, string[]> = {
  pending:    ['cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered'],
  delivered:  [],
  cancelled:  [],
};

// A pending order that gets closed out has no payment behind it — label and color it
// as "Abandoned" rather than "Cancelled" so it doesn't read like a refunded order.
const displayStatus = (order: Order) =>
  order.status === 'cancelled' && !order.razorpay_payment_id ? 'abandoned' : order.status;

const optionLabel = (currentStatus: string, target: string) => {
  if (currentStatus === 'pending' && target === 'cancelled') return 'Mark as abandoned';
  return target.charAt(0).toUpperCase() + target.slice(1);
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
  flash_sale_id: number | null;
};

type Tab = 'confirmed' | 'pending';

export default function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [tab, setTab] = useState<Tab>('confirmed');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<Record<string, string>>({});
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<Record<string, string>>({});

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    setStatusError((prev) => ({ ...prev, [orderId]: '' }));
    try {
      const res = await fetch('/api/admin/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusError((prev) => ({ ...prev, [orderId]: data.error ?? 'Update failed.' }));
        return;
      }
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch {
      setStatusError((prev) => ({ ...prev, [orderId]: 'Network error. Try again.' }));
    } finally {
      setUpdatingId(null);
    }
  };

  const resendEmail = async (orderId: string) => {
    setResendingId(orderId);
    setResendMessage((prev) => ({ ...prev, [orderId]: '' }));
    try {
      const res = await fetch('/api/admin/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      setResendMessage((prev) => ({
        ...prev,
        [orderId]: res.ok ? 'Sent!' : (data.error ?? 'Failed.'),
      }));
    } catch {
      setResendMessage((prev) => ({ ...prev, [orderId]: 'Failed.' }));
    } finally {
      setResendingId(null);
    }
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
        window.location.reload();
      }
    } catch {
      setSyncMessage('Sync failed. Check console.');
    } finally {
      setSyncing(false);
    }
  };

  // Bucketed by whether a payment actually happened, not by the (mutable) status string —
  // that's the only way to tell a real order from an abandoned checkout with certainty.
  const confirmedOrders = orders.filter((o) => !!o.razorpay_payment_id);
  const pendingOrders = orders.filter((o) => !o.razorpay_payment_id);
  const tabOrders = tab === 'confirmed' ? confirmedOrders : pendingOrders;

  const filtered = tabOrders.filter(
    (o) =>
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      o.razorpay_payment_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="px-4 pt-3 flex items-center gap-1 border-b">
        {(
          [
            { key: 'confirmed' as const, label: 'Confirmed', count: confirmedOrders.length, active: 'border-blue-600 text-blue-600', badge: 'bg-blue-100 text-blue-700' },
            { key: 'pending' as const, label: 'Pending', count: pendingOrders.length, active: 'border-orange-500 text-orange-600', badge: 'bg-orange-100 text-orange-700' },
          ]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSearch(''); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key ? t.active : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tab === t.key ? t.badge : 'bg-gray-100 text-gray-500'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {tab === 'pending' && (
        <p className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-b">
          Checkout was started but payment was never completed — nothing has been charged for these.
        </p>
      )}

      <div className="p-4 border-b flex items-center gap-4 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={tab === 'confirmed' ? 'Search by name, email or payment ID...' : 'Search by name or email...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        {tab === 'confirmed' && (
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
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          {search
            ? 'No orders match your search.'
            : tab === 'pending'
              ? 'No pending checkouts — every started checkout has been paid.'
              : 'No confirmed orders yet.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 border-b">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Offer Claimed</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((order) => {
                const nextOptions = NEXT_STATUSES[order.status] ?? [];
                const isFinal = nextOptions.length === 0;
                const isUpdating = updatingId === order.id;
                // Free gift line items are stored with a negative id (see src/lib/promotions.ts) —
                // their presence is how we know a gift offer (not Buy 2 Get 1) was claimed on this order.
                const giftLineItem = order.items.find((i) => i.id < 0);

                return (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-gray-500 text-xs">{order.customer_email}</p>
                        <p className="text-gray-500 text-xs">{order.customer_phone}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {order.items.filter((i) => i.id >= 0).map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                      </td>
                      <td className="px-4 py-3">
                        {giftLineItem ? (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            🎁 Send {giftLineItem.quantity}× {giftLineItem.name}
                          </span>
                        ) : order.flash_sale_id ? (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            ⚡ Flash Sale
                          </span>
                        ) : Number(order.discount) > 0 ? (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                            🎉 Buy 2 Get 1
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        ₹{Number(order.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        {Number(order.discount) > 0 && (
                          <p className="text-green-600 text-xs">-₹{Number(order.discount).toFixed(2)} off</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {isFinal ? (
                            // Final state — just show a badge, no dropdown
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[displayStatus(order)] ?? 'bg-gray-100 text-gray-600'}`}>
                              {displayStatus(order)}
                            </span>
                          ) : (
                            <div className="relative inline-block">
                              <select
                                value={order.status}
                                disabled={isUpdating}
                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                className={`appearance-none pr-6 pl-2 py-1 rounded-full text-xs font-medium cursor-pointer border-0 outline-none disabled:opacity-60 ${statusColors[order.status] ?? 'bg-gray-100 text-gray-600'}`}
                              >
                                {/* Current status always shown first */}
                                <option value={order.status} className="bg-white text-gray-900 capitalize">
                                  {order.status}
                                </option>
                                {nextOptions.map((s) => (
                                  <option key={s} value={s} className="bg-white text-gray-900">
                                    {optionLabel(order.status, s)}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                            </div>
                          )}
                          {isUpdating && (
                            <p className="text-xs text-blue-600">Updating…</p>
                          )}
                          {statusError[order.id] && (
                            <p className="text-xs text-red-600">{statusError[order.id]}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(order.created_at).toLocaleDateString('en-IN')}<br />
                        {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 items-start">
                          <button
                            onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                            className="text-blue-600 hover:underline text-xs"
                          >
                            {expanded === order.id ? 'Hide' : 'Details'}
                          </button>
                          {/* No confirmation email was ever sent for an order with no payment — nothing to resend */}
                          {order.razorpay_payment_id && (
                            <>
                              <button
                                onClick={() => resendEmail(order.id)}
                                disabled={resendingId === order.id}
                                className="flex items-center gap-1 text-gray-500 hover:text-blue-600 text-xs disabled:opacity-50"
                              >
                                <Mail className="w-3 h-3" />
                                {resendingId === order.id ? 'Sending…' : 'Resend Email'}
                              </button>
                              {resendMessage[order.id] && (
                                <span className={`text-xs ${resendMessage[order.id] === 'Sent!' ? 'text-green-600' : 'text-red-500'}`}>
                                  {resendMessage[order.id]}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expanded === order.id && (
                      <tr key={`${order.id}-detail`} className="bg-blue-50">
                        <td colSpan={7} className="px-4 py-4">
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
                              <p className={`font-mono text-xs ${order.razorpay_payment_id ? 'text-gray-600' : 'text-gray-400 italic font-sans'}`}>
                                {order.razorpay_payment_id || 'Not paid'}
                              </p>
                              <p className="font-medium mt-3 mb-1">Items</p>
                              {order.items.map((item, i) => (
                                <div key={i} className={`flex items-center gap-2 mb-1 ${item.id < 0 ? 'bg-green-50 rounded px-1' : ''}`}>
                                  {item.image && <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded" />}
                                  <span>
                                    {item.name} ×{item.quantity} — {item.id < 0 ? (
                                      <span className="text-green-700 font-semibold">FREE GIFT</span>
                                    ) : (
                                      `₹${(item.price * item.quantity).toFixed(2)}`
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
