import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Razorpay retries webhooks until it receives a 200 response.
// Always return 200 even on business logic errors to prevent infinite retries.

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'payment.captured') {
      const payment = event.payload?.payment?.entity;
      if (!payment) {
        return NextResponse.json({ error: 'Missing payment entity' }, { status: 200 });
      }

      const supabase = createAdminClient();

      // Update the pending order to confirmed.
      // If verify-payment already confirmed it, this is a no-op.
      // If verify-payment failed (network drop etc.), this is the safety net.
      const { error } = await supabase
        .from('orders')
        .update({
          razorpay_payment_id: payment.id,
          status: 'confirmed',
        })
        .eq('razorpay_order_id', payment.order_id)
        .eq('status', 'pending'); // only update if still pending (don't downgrade confirmed)

      if (error) {
        console.error('Webhook: failed to update order:', error);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    // Still return 200 so Razorpay doesn't retry indefinitely
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
