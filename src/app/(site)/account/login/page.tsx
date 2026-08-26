import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/server';
import AccountLoginClient from './AccountLoginClient';

export default async function AccountLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Only ever redirect within our own site — never follow an attacker-supplied absolute/external URL.
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/account/orders';

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();

  if (user && user.app_metadata?.role !== 'admin') {
    const admin = createAdminClient();
    const { data: profile } = await admin.from('profiles').select('id').eq('id', user.id).maybeSingle();
    if (profile) redirect(safeNext);
    // Verified session but no profile yet (e.g. they closed the tab mid-signup) —
    // resume straight at the "complete your profile" step instead of bouncing
    // between this page and /account/orders forever.
    return <AccountLoginClient resumeProfile={{ email: user.email ?? null, phone: user.phone ?? null }} next={safeNext} />;
  }

  return <AccountLoginClient next={safeNext} />;
}
