import { createAdminClient } from './supabase/server';

interface OrderRow {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: { line1?: string; line2?: string; city?: string; state?: string; pincode?: string } | null;
  items: { name: string; quantity: number }[] | null;
  total: number;
  status: string;
  user_id: string | null;
  flash_sale_id: number | null;
}

async function sendOrderConfirmationEmails(order: OrderRow) {
  const address = order.address ?? {};
  const fullAddress = `${address.line1 ?? ''}${address.line2 ? ', ' + address.line2 : ''}, ${address.city ?? ''}, ${address.state ?? ''} - ${address.pincode ?? ''}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amigocalculator.info';
  const cancelUrl = `${siteUrl}/cancel-order?oid=${order.razorpay_order_id}`;

  const emailPayload = (toName: string, toEmail: string) => ({
    service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
    accessToken: process.env.EMAILJS_PRIVATE_KEY,
    template_params: {
      to_name: toName,
      to_email: toEmail,
      order_id: order.razorpay_payment_id,
      amount: order.total,
      items: (order.items ?? []).map((item) => `${item.name} (${item.quantity})`).join(', '),
      address: fullAddress,
      phone: order.customer_phone,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
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
    sendEmail(emailPayload(order.customer_name, order.customer_email)),
    sendEmail(emailPayload('Amigo Team', 'enquiry@amigocalculator.info')),
  ]).catch((err) => console.error('Email sending failed:', err));
}

// Idempotent order confirmation shared by /api/verify-payment (the client-driven path)
// and /api/razorpay-webhook (the server-to-server safety net for the same event) — the
// two can race for the same order, so only whichever call actually flips pending ->
// confirmed runs the side effects (flash-sale slot claim + emails); the other is a no-op.
export async function confirmPaidOrder(razorpay_order_id: string, razorpay_payment_id: string) {
  const supabase = createAdminClient();

  const { data: order, error } = await supabase
    .from('orders')
    .update({ status: 'confirmed', razorpay_payment_id, confirmed_at: new Date().toISOString() })
    .eq('razorpay_order_id', razorpay_order_id)
    .eq('status', 'pending')
    .select('*')
    .single();

  if (error || !order) {
    // Already confirmed by the other path (or the order truly doesn't exist) — return
    // whatever's there so the caller can still respond sensibly, but do nothing further.
    const { data: existing } = await supabase.from('orders').select('*').eq('razorpay_order_id', razorpay_order_id).single();
    return { order: (existing as OrderRow | null) ?? null, firstConfirmation: false };
  }

  const row = order as OrderRow;

  if (row.flash_sale_id && row.user_id) {
    // The slot itself was already atomically reserved at checkout time (see
    // /api/checkout), so this is just record-keeping — marking which reservation
    // turned into a real, paid order. Do not re-claim a slot here: that would double
    // count a person who already consumed one at checkout.
    await supabase
      .from('flash_sale_claims')
      .upsert(
        {
          flash_sale_id: row.flash_sale_id,
          user_id: row.user_id,
          status: 'confirmed',
          order_id: row.id,
          confirmed_at: new Date().toISOString(),
        },
        { onConflict: 'flash_sale_id,user_id' }
      );
  }

  await sendOrderConfirmationEmails(row);

  return { order: row, firstConfirmation: true };
}
