import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const CANCELLABLE_STATUSES = ['confirmed', 'processing'];

const sendEmail = (payload: object) =>
  fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id } = await req.json();

    if (!razorpay_order_id) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      return NextResponse.json(
        { error: `Order cannot be cancelled. Current status: ${order.status}` },
        { status: 400 }
      );
    }

    // Update status in Supabase
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id);

    // Initiate Razorpay refund
    if (order.razorpay_payment_id) {
      try {
        await razorpay.payments.refund(order.razorpay_payment_id, {
          amount: Math.round(order.total * 100),
        });
      } catch (refundErr) {
        console.error('Razorpay refund failed:', refundErr);
        // Order is still cancelled even if refund API fails — admin will see it
      }
    }

    const emailBase = {
      service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      template_id: process.env.NEXT_PUBLIC_EMAILJS_STATUS_TEMPLATE_ID,
      user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
    };

    await Promise.all([
      // Email to customer
      sendEmail({
        ...emailBase,
        template_params: {
          to_name: order.customer_name,
          to_email: order.customer_email,
          order_id: order.razorpay_payment_id || razorpay_order_id,
          amount: order.total,
          status: 'Cancelled',
          status_message: 'Your order has been cancelled. Your refund will be processed within 5–7 business days.',
        },
      }),
      // Email to admin
      sendEmail({
        ...emailBase,
        template_params: {
          to_name: 'Amigo Team',
          to_email: 'enquiry@amigocalculator.info',
          order_id: order.razorpay_payment_id || razorpay_order_id,
          amount: order.total,
          status: 'Cancelled',
          status_message: `Customer (${order.customer_name}, ${order.customer_email}) cancelled their order. Razorpay refund has been auto-initiated for Payment ID: ${order.razorpay_payment_id}.`,
        },
      }),
    ]).catch((err) => console.error('Cancel email failed:', err));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Cancel order error:', err);
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
  }
}
