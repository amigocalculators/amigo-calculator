import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { confirmPaidOrder } from '@/lib/orderConfirmation';

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

      // Shared with /api/verify-payment — idempotent, so if that route already
      // confirmed this order, this is a no-op. If it failed (network drop etc. between
      // the browser and our server), this is the safety net that still runs the
      // flash-sale slot claim and emails exactly once.
      await confirmPaidOrder(payment.order_id, payment.id);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    // Still return 200 so Razorpay doesn't retry indefinitely
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
