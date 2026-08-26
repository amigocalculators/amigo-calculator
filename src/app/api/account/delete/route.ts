import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }
    if (user.app_metadata?.role === 'admin') {
      return NextResponse.json({ error: 'Admin accounts cannot be deleted here' }, { status: 403 });
    }

    const admin = createAdminClient();
    // Deleting the auth user cascades to the profiles row (ON DELETE CASCADE).
    // Order history is untouched — orders are matched by email/phone at query time, not a foreign key.
    const { error } = await admin.auth.admin.deleteUser(user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Account delete error:', err);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
