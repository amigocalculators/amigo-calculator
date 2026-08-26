import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';

// Server-side admin client — uses service role key, bypasses RLS
// Only use in API routes and server actions, never expose to the browser
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Reads the caller's session from cookies and confirms app_metadata.role === 'admin'.
// app_metadata can't be set by the user themselves, so this can't be spoofed by a regular account.
// Use at the top of any /api/admin/* route — that path isn't covered by the /admin/:path* middleware matcher.
export async function getAuthorizedAdmin(): Promise<User | null> {
  const user = await getSessionUser();
  return user?.app_metadata?.role === 'admin' ? user : null;
}

// Reads the caller's session from cookies — any logged-in user, no role check.
// Use in API routes that require "someone is logged in" (e.g. checkout, flash-sale claims)
// but aren't admin-only.
export async function getAuthorizedUser(): Promise<User | null> {
  return getSessionUser();
}
