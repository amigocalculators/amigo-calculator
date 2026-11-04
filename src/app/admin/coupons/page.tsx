import { createAdminClient } from '@/lib/supabase/server';
import CouponsManager from './CouponsManager';

export default async function AdminCouponsPage() {
  const supabase = createAdminClient();
  const { data: coupons } = await supabase.from('coupon_codes').select('*').order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Coupons</h1>
      <CouponsManager initialCoupons={coupons ?? []} />
    </div>
  );
}
