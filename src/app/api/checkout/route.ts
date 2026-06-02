import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { amount, customerDetails, cart, subtotal, discount, total } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Create the Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: 'receipt_' + Date.now(),
      notes: customerDetails ? {
        customer_name: customerDetails.name,
        email: customerDetails.email,
        phone: customerDetails.phone,
        addressLine1: customerDetails.addressLine1,
        addressLine2: customerDetails.addressLine2 ?? '',
        city: customerDetails.city,
        state: customerDetails.state,
        pincode: customerDetails.pincode,
      } : undefined,
    });

    // Save a pending order to Supabase so the webhook can confirm it
    // if the client-side verify-payment call ever fails
    if (customerDetails && cart) {
      const supabase = createAdminClient();
      const fullAddress = customerDetails.addressLine1
        ? `${customerDetails.addressLine1}${customerDetails.addressLine2 ? ', ' + customerDetails.addressLine2 : ''}, ${customerDetails.city}, ${customerDetails.state} - ${customerDetails.pincode}`
        : '';

      await supabase.from('orders').insert({
        razorpay_order_id: order.id,
        razorpay_payment_id: '',
        customer_name: customerDetails.name,
        customer_email: customerDetails.email,
        customer_phone: customerDetails.phone,
        address: {
          line1: customerDetails.addressLine1,
          line2: customerDetails.addressLine2,
          city: customerDetails.city,
          state: customerDetails.state,
          pincode: customerDetails.pincode,
          full: fullAddress,
        },
        items: cart.map((item: { id: number; name: string; price: number; quantity: number; image: string }) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal,
        discount,
        total,
        status: 'pending',
      });
      // Intentionally ignore DB errors here — the Razorpay order is already created.
      // verify-payment will upsert the confirmed order regardless.
    }

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error('Razorpay order creation failed:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
