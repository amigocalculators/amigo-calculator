import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST() {
  // Basic protection: only callable server-side / from admin
  const headersList = await headers();
  const origin = headersList.get('origin') ?? '';
  const host = headersList.get('host') ?? '';
  if (origin && !origin.includes(host.split(':')[0])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const supabase = createAdminClient();

    // Fetch existing razorpay_payment_ids from Supabase so we skip duplicates
    const { data: existing } = await supabase
      .from('orders')
      .select('razorpay_payment_id, razorpay_order_id');

    const existingPaymentIds = new Set(
      (existing ?? []).map((o) => o.razorpay_payment_id).filter(Boolean)
    );
    const existingOrderIds = new Set(
      (existing ?? []).map((o) => o.razorpay_order_id).filter(Boolean)
    );

    // Fetch captured payments from Razorpay (max 100 per call; extend if needed)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allPayments: any[] = [];
    let skip = 0;
    const count = 100;

    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await razorpay.payments.all({ count, skip }) as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items: any[] = response?.items ?? [];
      if (items.length === 0) break;
      allPayments = allPayments.concat(items);
      if (items.length < count) break;
      skip += count;
    }

    const captured = allPayments.filter((p) => p.status === 'captured');

    const toInsert = captured.filter(
      (p) => !existingPaymentIds.has(p.id) && !(p.order_id && existingOrderIds.has(p.order_id))
    );

    if (toInsert.length === 0) {
      return NextResponse.json({ synced: 0, message: 'All payments already in database.' });
    }

    // Build Supabase rows from Razorpay payment data
    const rows = toInsert.map((p) => {
      const notes = p.notes ?? {};
      return {
        razorpay_payment_id: p.id,
        razorpay_order_id: p.order_id || p.id,
        customer_name: notes.name ?? notes.customer_name ?? 'Unknown',
        customer_email: p.email ?? notes.email ?? '',
        customer_phone: p.contact ?? notes.phone ?? '',
        address: {
          line1: notes.address ?? notes.addressLine1 ?? '',
          line2: notes.addressLine2 ?? '',
          city: notes.city ?? '',
          state: notes.state ?? '',
          pincode: notes.pincode ?? '',
        },
        items: [],
        subtotal: p.amount / 100,
        discount: 0,
        total: p.amount / 100,
        status: 'confirmed',
        created_at: new Date(p.created_at * 1000).toISOString(),
      };
    });

    const { error } = await supabase.from('orders').insert(rows);

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ synced: rows.length, message: `Synced ${rows.length} order(s) from Razorpay.` });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('sync-razorpay error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
