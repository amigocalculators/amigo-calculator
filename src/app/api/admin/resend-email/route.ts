import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const sendEmail = (payload: object) =>
  fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amigocalculator.com';
    const cancelUrl = `${siteUrl}/cancel-order?oid=${order.razorpay_order_id}`;

    const fullAddress = order.address
      ? `${order.address.line1}${order.address.line2 ? ', ' + order.address.line2 : ''}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`
      : 'N/A';

    const itemsList = order.items
      ? order.items.map((item: { name: string; quantity: number }) => `${item.name} (${item.quantity})`).join(', ')
      : 'N/A';

    const emailBase = {
      service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
    };

    const templateParams = (toName: string, toEmail: string) => ({
      to_name: toName,
      to_email: toEmail,
      order_id: order.razorpay_payment_id || order.razorpay_order_id,
      amount: order.total,
      items: itemsList,
      address: fullAddress,
      phone: order.customer_phone,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      cancel_url: cancelUrl,
    });

    await Promise.all([
      sendEmail({ ...emailBase, template_params: templateParams(order.customer_name, order.customer_email) }),
      sendEmail({ ...emailBase, template_params: templateParams('Amigo Team', 'enquiry@amigocalculator.info') }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Resend email error:', err);
    return NextResponse.json({ error: 'Failed to resend email' }, { status: 500 });
  }
}
