import { NextResponse } from 'next/server';
import { createAdminClient, getAuthorizedUser } from '@/lib/supabase/server';
import { isFlashSaleLive } from '@/lib/flashSale';
import { FlashSale } from '@/types';

// Fires the instant a logged-in customer clicks "claim" on the flash-sale product —
// this is the lead-capture moment, independent of whether they ever complete payment.
// Safe to call repeatedly: the unique constraint on (flash_sale_id, user_id) means a
// second call just no-ops rather than erroring or duplicating.
export async function POST() {
  const user = await getAuthorizedUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: flashSaleRow } = await supabase
    .from('flash_sales')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const flashSale = flashSaleRow as FlashSale | null;

  if (!isFlashSaleLive(flashSale)) {
    return NextResponse.json({ error: 'No flash sale is currently live' }, { status: 400 });
  }

  const { error } = await supabase
    .from('flash_sale_claims')
    .upsert({ flash_sale_id: flashSale.id, user_id: user.id }, { onConflict: 'flash_sale_id,user_id', ignoreDuplicates: true });

  if (error) {
    console.error('Flash sale claim-interest failed:', error);
    return NextResponse.json({ error: 'Failed to record claim' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
