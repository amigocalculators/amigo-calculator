import { createAdminClient } from '@/lib/supabase/server';
import FlashSaleManager from './FlashSaleManager';

export default async function AdminFlashSalePage() {
  const supabase = createAdminClient();

  const [{ data: flashSale }, { data: products }] = await Promise.all([
    supabase.from('flash_sales').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('products').select('id, name, price').order('name', { ascending: true }),
  ]);

  let leads: { user_id: string; status: string; created_at: string; name: string | null; email: string | null; phone: string | null }[] = [];

  if (flashSale) {
    const { data: claims } = await supabase
      .from('flash_sale_claims')
      .select('user_id, status, created_at')
      .eq('flash_sale_id', flashSale.id)
      .order('created_at', { ascending: false });

    if (claims && claims.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email, phone')
        .in('id', claims.map((c) => c.user_id));

      leads = claims.map((claim) => {
        const profile = profiles?.find((p) => p.id === claim.user_id);
        return {
          user_id: claim.user_id,
          status: claim.status,
          created_at: claim.created_at,
          name: profile?.name ?? null,
          email: profile?.email ?? null,
          phone: profile?.phone ?? null,
        };
      });
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Flash Sale</h1>
      <FlashSaleManager
        initialFlashSale={flashSale ?? null}
        products={products ?? []}
        initialLeads={leads}
      />
    </div>
  );
}
