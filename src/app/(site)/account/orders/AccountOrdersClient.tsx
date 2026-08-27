'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Trash2 kept for when Delete Account UI below is re-enabled
import { Package, XCircle, Loader2, LogOut, Trash2 } from 'lucide-react';
import { isWithinCancelWindow } from '@/lib/orderCancellation';

type Order = {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  total: number;
  status: string;
  items: { id: number; name: string; price: number; quantity: number; image: string }[];
  created_at: string;
  confirmed_at: string | null;
  delivered_at: string | null;
};

type Profile = { id: string; name: string | null; email: string | null; phone: string | null };

const CANCELLABLE_STATUSES = ['confirmed', 'processing', 'delivered'];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Order Confirmed', color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-700' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};

function OrderCard({ order, onCancelled }: { order: Order; onCancelled: (id: string) => void }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canCancel = CANCELLABLE_STATUSES.includes(order.status) && isWithinCancelWindow(order);
  const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600' };

  const handleCancel = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/cancel-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ razorpay_order_id: order.razorpay_order_id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      onCancelled(order.id);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
            <p className="text-xs text-gray-400 font-mono">{order.razorpay_payment_id}</p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}>{statusInfo.label}</span>
        </div>

        <div className="space-y-2 mb-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5">
              {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {item.price === 0 ? 'FREE' : `₹${(item.price * item.quantity).toFixed(2)}`}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <span className="font-semibold text-gray-800">Total</span>
          <span className="font-bold text-gray-900">₹{Number(order.total).toFixed(2)}</span>
        </div>

        {canCancel && (
          <div className="border-t pt-3 mt-3">
            {error && <p className="text-red-600 text-sm mb-2 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            {!showConfirm ? (
              <button onClick={() => setShowConfirm(true)}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4" /> Cancel Order
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-700 mb-3">This will cancel your order and initiate a full refund.</p>
                <div className="flex gap-2">
                  <button onClick={handleCancel} disabled={loading}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Yes, Cancel
                  </button>
                  <button onClick={() => setShowConfirm(false)} disabled={loading}
                    className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg">
                    Keep Order
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountOrdersClient({ profile, orders: initialOrders }: { profile: Profile; orders: Order[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [orders, setOrders] = useState(initialOrders);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for when Delete Account UI below is re-enabled
  const [deleting, setDeleting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for when Delete Account UI below is re-enabled
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for when Delete Account UI below is re-enabled
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? 'Failed to delete account');
        return;
      }
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelled = (id: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'cancelled' } : o)));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="w-6 h-6" /> My Orders</h1>
            {profile.name && <p className="text-gray-500 text-sm mt-1">{profile.name}</p>}
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-500">
            No orders yet.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onCancelled={handleCancelled} />
            ))}
          </div>
        )}

        {/* Delete Account — temporarily disabled, keep handleDeleteAccount/api route intact for when this is turned back on
        <div className="mt-10 pt-6 border-t border-gray-200">
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" /> Delete Account
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-800 mb-1">Delete your account?</p>
              <p className="text-xs text-red-600 mb-3">
                This removes your login and profile. Your past orders stay on record, but you&apos;ll need to sign up again to see them.
              </p>
              <div className="flex gap-3">
                <button onClick={handleDeleteAccount} disabled={deleting}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-60">
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Yes, Delete My Account
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting}
                  className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        */}
      </div>
    </div>
  );
}
