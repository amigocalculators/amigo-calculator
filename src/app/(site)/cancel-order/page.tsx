import { createAdminClient } from '@/lib/supabase/server';
import CancelOrderClient from './CancelOrderClient';

export default async function CancelOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ oid?: string }>;
}) {
  const { oid } = await searchParams;

  if (!oid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Invalid Link</h1>
          <p className="text-gray-500">This cancellation link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from('orders')
    .select('id, razorpay_order_id, razorpay_payment_id, customer_name, customer_email, total, status, items, created_at, confirmed_at, delivered_at, address')
    .eq('razorpay_order_id', oid)
    .single();

  return <CancelOrderClient order={order ?? null} />;
}
