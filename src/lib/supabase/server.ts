import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Server-side admin client — uses service role key, bypasses RLS
// Only use in API routes and server actions, never expose to the browser
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
