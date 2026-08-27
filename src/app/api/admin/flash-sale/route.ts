import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createAdminClient, getAuthorizedAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  if (!(await getAuthorizedAdmin())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { product_id, sale_price, max_claims, starts_at, enabled, ad_image_url, ad_title, ad_caption } = await req.json();

  if (!product_id || !sale_price || !max_claims || !starts_at) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = createAdminClient();
  // Upsert keyed by product_id (unique) — editing an existing campaign updates its
  // price/schedule/enabled flag in place without touching claimed_count; picking a
  // different product starts a fresh campaign row, leaving the old one as history.
  const { data, error } = await supabase
    .from('flash_sales')
    .upsert(
      {
        product_id, sale_price, max_claims, starts_at, enabled,
        ad_image_url: ad_image_url || null,
        ad_title: ad_title || null,
        ad_caption: ad_caption || null,
      },
      { onConflict: 'product_id' }
    )
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath(`/product/${product_id}`);
  revalidatePath('/');
  revalidatePath('/products');

  return NextResponse.json({ success: true, flashSale: data });
}
