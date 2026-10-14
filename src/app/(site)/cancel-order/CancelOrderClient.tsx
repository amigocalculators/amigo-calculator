'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Package, Loader2 } from 'lucide-react';
import { isWithinCancelWindow } from '@/lib/orderCancellation';

type Order = {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  items: { id: number; name: string; price: number; quantity: number; image: string }[];
  created_at: string;
  confirmed_at: string | null;
  delivered_at: string | null;
  address: { line1: string; line2?: string; city: string; state: string; pincode: string };
} | null;

const CANCELLABLE_STATUSES = ['confirmed', 'processing', 'delivered'];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  confirmed:  { label: 'Order Confirmed',  color: 'bg-blush text-ink' },
  processing: { label: 'Processing',       color: 'bg-yellow-100 text-yellow-700' },
  shipped:    { label: 'Shipped',           color: 'bg-purple-100 text-purple-700' },
  delivered:  { label: 'Delivered',         color: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Cancelled',         color: 'bg-red-100 text-red-700' },
};

export default function CancelOrderClient({ order }: { order: Order }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  if (!order) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-4">
        <div className="bg-white rounded-xl border border-border-soft shadow p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-ink mb-3">Order Not Found</h1>
          <p className="text-ink-muted">We couldn&apos;t find your order. The link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const canCancel = CANCELLABLE_STATUSES.includes(order.status) && isWithinCancelWindow(order);
  const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-blush/40 text-ink-muted' };

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
      setDone(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-4">
        <div className="bg-white rounded-xl border border-border-soft shadow p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-ink mb-3">Order Cancelled</h1>
          <p className="text-ink-muted mb-2">
            Your order has been successfully cancelled.
          </p>
          <p className="text-ink-muted text-sm">
            A refund of <span className="font-semibold text-ink">₹{Number(order.total).toFixed(2)}</span> has been initiated and will reflect in your account within <span className="font-semibold">5–7 business days</span>.
          </p>
          <p className="text-ink-muted/70 text-xs mt-4">A confirmation email has been sent to {order.customer_email}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper py-16 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl border border-border-soft shadow overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-accent-400 to-accent-600 px-6 py-5">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-ink" />
              <h1 className="text-xl font-bold text-ink">Cancel Order</h1>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Order Summary */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-ink">Order Details</h2>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <div className="bg-blush/30 rounded-lg p-4 space-y-2 text-sm text-ink-muted">
                <div className="flex justify-between">
                  <span>Customer</span>
                  <span className="font-medium text-ink">{order.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment ID</span>
                  <span className="font-mono text-xs text-ink">{order.razorpay_payment_id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order Date</span>
                  <span>{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between border-t border-border-soft pt-2 mt-2">
                  <span className="font-semibold text-ink">Total Paid</span>
                  <span className="font-bold text-ink">₹{Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h2 className="font-semibold text-ink mb-3">Items</h2>
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-blush/30 rounded-lg p-3">
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">{item.name}</p>
                      <p className="text-xs text-ink-muted">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-ink">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cancel Action */}
            {canCancel ? (
              <div className="border-t border-border-soft pt-4">
                {error && (
                  <p className="text-red-600 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}
                {!showConfirm ? (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Cancel This Order
                  </button>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-red-800 mb-1">Are you sure?</p>
                    <p className="text-xs text-red-600 mb-4">
                      This will cancel your order and initiate a full refund of ₹{Number(order.total).toFixed(2)} within 5–7 business days.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {loading ? 'Processing...' : 'Yes, Cancel Order'}
                      </button>
                      <button
                        onClick={() => setShowConfirm(false)}
                        disabled={loading}
                        className="flex-1 py-2.5 bg-blush hover:bg-blush-deep text-ink font-semibold rounded-lg transition-colors"
                      >
                        Keep Order
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-ink-muted text-center mt-3">
                  Cancellation is only available before your order is shipped.
                </p>
              </div>
            ) : (
              <div className="border-t border-border-soft pt-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">Cannot Cancel</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      {order.status === 'cancelled'
                        ? 'This order has already been cancelled.'
                        : order.status === 'delivered'
                        ? 'This order has been delivered and cannot be cancelled.'
                        : 'This order has already been shipped and cannot be cancelled. Please contact us at enquiry@amigocalculator.info for assistance.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
