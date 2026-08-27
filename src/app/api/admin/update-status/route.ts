import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthorizedAdmin } from '@/lib/supabase/server';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Only forward transitions are allowed — no going back.
// pending -> confirmed is deliberately absent: confirmation only ever happens via a
// verified payment (verify-payment route / razorpay-webhook), never a manual admin click.
// The only manual move out of pending is closing out an abandoned, unpaid checkout.
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending:    ['cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered'],
  delivered:  [],
  cancelled:  [],
};

const STATUS_MESSAGES: Record<string, string> = {
  processing: 'Good news! Your order is being prepared and will be dispatched soon.',
  shipped:    'Your order is on its way! It should reach you in 2–4 business days.',
  delivered:  'Your order has been delivered. Thank you for shopping with us!',
  cancelled:  'Your order has been cancelled. A refund has been initiated and will reflect in 5–7 business days.',
};

const sendEmail = (payload: object) =>
  fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export async function POST(req: NextRequest) {
  try {
    if (!(await getAuthorizedAdmin())) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { orderId, newStatus } = await req.json();

    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Missing orderId or newStatus' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const allowed = VALID_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from "${order.status}" to "${newStatus}"` },
        { status: 400 }
      );
    }

    // Update status in Supabase. delivered_at feeds the customer-facing return window
    // (cancellable again for a couple of days after delivery) — created_at alone
    // doesn't tell us when the order actually got delivered.
    await supabase
      .from('orders')
      .update({ status: newStatus, ...(newStatus === 'delivered' ? { delivered_at: new Date().toISOString() } : {}) })
      .eq('id', orderId);

    // Initiate Razorpay refund if cancelling
    if (newStatus === 'cancelled' && order.razorpay_payment_id) {
      try {
        await razorpay.payments.refund(order.razorpay_payment_id, {
          amount: Math.round(order.total * 100),
        });
      } catch (refundErr) {
        console.error('Razorpay refund failed:', refundErr);
      }
    }

    // Send status update email to customer (same template for all statuses including cancellation).
    // Skip entirely for an abandoned/unpaid order — the customer never received a confirmation
    // email for it in the first place, so a "your order was cancelled" notice would be confusing.
    const statusMessage = STATUS_MESSAGES[newStatus];
    if (statusMessage && order.razorpay_payment_id) {
      await sendEmail({
        service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        template_id: process.env.NEXT_PUBLIC_EMAILJS_STATUS_TEMPLATE_ID,
        user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY,
        template_params: {
          to_name: order.customer_name,
          to_email: order.customer_email,
          order_id: order.razorpay_payment_id,
          amount: order.total,
          status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
          status_message: statusMessage,
        },
      }).catch((err) => console.error('Status email failed:', err));
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err) {
    console.error('Update status error:', err);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
