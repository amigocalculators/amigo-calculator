import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthorizedUser } from '@/lib/supabase/server';

// A logged-in customer rates a product (1-5 stars) tied to an order they actually
// placed. Gated on "post checkout" (order status past pending/cancelled) rather than
// delivery, and on the order's `items` JSONB actually containing this product --
// see supabase/migration_020_product_ratings.sql for the aggregate side of this.
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthorizedUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { order_id, product_id, stars } = await req.json();
    if (!order_id || !product_id || !Number.isInteger(stars) || stars < 1 || stars > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: profile } = await supabase.from('profiles').select('email, phone').eq('id', user.id).single();
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { data: order } = await supabase.from('orders').select('*').eq('id', order_id).single();
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const ownsOrder = order.customer_email === profile.email || (!!profile.phone && order.customer_phone === profile.phone);
    if (!ownsOrder) {
      return NextResponse.json({ error: 'This order does not belong to you' }, { status: 403 });
    }

    if (order.status === 'pending' || order.status === 'cancelled') {
      return NextResponse.json({ error: 'You can only rate a product after checkout is complete' }, { status: 400 });
    }

    const purchasedThisProduct = ((order.items ?? []) as { id: number }[]).some((item) => item.id === product_id);
    if (!purchasedThisProduct) {
      return NextResponse.json({ error: 'This product was not part of that order' }, { status: 400 });
    }

    const { error } = await supabase
      .from('product_ratings')
      .insert({ product_id, order_id, customer_email: order.customer_email, stars });

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'You already rated this product for this order' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Rating submit error:', err);
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
  }
}
