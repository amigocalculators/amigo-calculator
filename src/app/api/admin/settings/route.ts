import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthorizedAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    if (!(await getAuthorizedAdmin())) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { buy2get1_enabled } = await req.json();
    if (typeof buy2get1_enabled !== 'boolean') {
      return NextResponse.json({ error: 'Missing or invalid buy2get1_enabled' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('site_settings')
      .update({ buy2get1_enabled, updated_at: new Date().toISOString() })
      .eq('id', 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, buy2get1_enabled });
  } catch (err) {
    console.error('Update site settings error:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
