import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizedUser } from '@/lib/supabase/server';
import { confirmPaidOrder } from '@/lib/orderConfirmation';

export async function POST(req: NextRequest) {
  try {
    // Defense-in-depth, not the real authorization boundary — the flash-sale side
    // effects are keyed off the order's own user_id (captured at checkout-creation),
    // not off whoever's session happens to call this route.
    const user = await getAuthorizedUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json();

    // Verify the payment signature (cryptographic proof payment happened for this exact order)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Everything else (pricing, items, flash-sale slot, emails) was already computed and
    // stored at checkout-creation time — this just flips the row to confirmed and reads
    // it back, idempotently shared with the webhook in case both fire for the same order.
    const { order } = await confirmPaidOrder(razorpay_order_id, razorpay_payment_id);

    return NextResponse.json({
      success: true,
      orderId: order?.id ?? null,
      paymentId: razorpay_payment_id,
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
