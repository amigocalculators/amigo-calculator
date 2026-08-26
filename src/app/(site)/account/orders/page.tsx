import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/server';
import AccountOrdersClient from './AccountOrdersClient';

export default async function AccountOrdersPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role === 'admin') redirect('/account/login');

  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single();

  if (!profile) redirect('/account/login');

  const filters = [profile.email && `customer_email.eq.${profile.email}`, profile.phone && `customer_phone.eq.${profile.phone}`]
    .filter(Boolean)
    .join(',');

  const { data: orders } = filters
    ? await admin.from('orders').select('*').or(filters).order('created_at', { ascending: false })
    : { data: [] };

  return <AccountOrdersClient profile={profile} orders={orders ?? []} />;
}
