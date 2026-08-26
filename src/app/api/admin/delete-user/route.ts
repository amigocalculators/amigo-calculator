import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthorizedAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    if (!(await getAuthorizedAdmin())) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin delete user error:', err);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
