'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Package, Loader2 } from 'lucide-react';

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
  address: { line1: string; line2?: string; city: string; state: string; pincode: string };
} | null;

const CANCELLABLE_STATUSES = ['confirmed', 'processing'];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  confirmed:  { label: 'Order Confirmed',  color: 'bg-blue-100 text-blue-700' },
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Order Not Found</h1>
          <p className="text-gray-500">We couldn't find your order. The link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const canCancel = CANCELLABLE_STATUSES.includes(order.status);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Order Cancelled</h1>
          <p className="text-gray-600 mb-2">
            Your order has been successfully cancelled.
          </p>
          <p className="text-gray-500 text-sm">
            A refund of <span className="font-semibold text-gray-700">₹{Number(order.total).toFixed(2)}</span> has been initiated and will reflect in your account within <span className="font-semibold">5–7 business days</span>.
          </p>
          <p className="text-gray-400 text-xs mt-4">A confirmation email has been sent to {order.customer_email}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-white" />
              <h1 className="text-xl font-bold text-white">Cancel Order</h1>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Order Summary */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-800">Order Details</h2>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Customer</span>
                  <span className="font-medium text-gray-800">{order.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment ID</span>
                  <span className="font-mono text-xs text-gray-700">{order.razorpay_payment_id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order Date</span>
                  <span>{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-semibold text-gray-800">Total Paid</span>
                  <span className="font-bold text-gray-900">₹{Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h2 className="font-semibold text-gray-800 mb-3">Items</h2>
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-700">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cancel Action */}
            {canCancel ? (
              <div className="border-t pt-4">
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
                        className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                      >
                        Keep Order
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-400 text-center mt-3">
                  Cancellation is only available before your order is shipped.
                </p>
              </div>
            ) : (
              <div className="border-t pt-4">
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
