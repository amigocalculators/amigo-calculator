import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      customerDetails,
      cart,
      subtotal,
      discount,
      total,
    } = await req.json();

    // 1. Verify the payment signature (cryptographic proof payment happened)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 2. Upsert verified order to Supabase
    // Uses razorpay_order_id as the conflict key so the pending order
    // created at checkout is updated instead of a duplicate being inserted.
    const supabase = createAdminClient();
    const { data: order, error } = await supabase
      .from('orders')
      .upsert(
        {
          razorpay_payment_id,
          razorpay_order_id,
          customer_name: customerDetails.name,
          customer_email: customerDetails.email,
          customer_phone: customerDetails.phone,
          address: {
            line1: customerDetails.addressLine1,
            line2: customerDetails.addressLine2,
            city: customerDetails.city,
            state: customerDetails.state,
            pincode: customerDetails.pincode,
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
          status: 'confirmed',
        },
        { onConflict: 'razorpay_order_id' }
      )
      .select('id')
      .single();

    if (error) {
      console.error('Failed to save order:', error);
      // Payment is verified — still return success even if DB write fails
    }

    // 3. Send confirmation email via EmailJS REST API (to customer + business owner)
    const fullAddress = `${customerDetails.addressLine1}, ${customerDetails.addressLine2 ? customerDetails.addressLine2 + ', ' : ''}${customerDetails.city}, ${customerDetails.state} - ${customerDetails.pincode}`;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amigocalculator.info';
    const cancelUrl = `${siteUrl}/cancel-order?oid=${razorpay_order_id}`;

    const emailPayload = (toName: string, toEmail: string) => ({
      service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
      template_params: {
        to_name: toName,
        to_email: toEmail,
        order_id: razorpay_payment_id,
        amount: total,
        items: cart.map((item: { name: string; quantity: number }) => `${item.name} (${item.quantity})`).join(', '),
        address: fullAddress,
        phone: customerDetails.phone,
        customer_name: customerDetails.name,
        customer_email: customerDetails.email,
        cancel_url: cancelUrl,
      },
    });

    const sendEmail = (payload: object) =>
      fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

    await Promise.all([
      sendEmail(emailPayload(customerDetails.name, customerDetails.email)),
      sendEmail(emailPayload('Amigo Team', 'enquiry@amigocalculator.info')),
    ]).catch((err) => console.error('Email sending failed:', err));

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
