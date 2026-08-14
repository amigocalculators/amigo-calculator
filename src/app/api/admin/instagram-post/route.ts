import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Bump this as Meta deprecates old Graph API versions (~every 2 years).
const GRAPH_API_VERSION = 'v21.0';

async function graphPost(path: string, params: Record<string, string>) {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${path}?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url, { method: 'POST' });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? `Instagram API request to ${path} failed`);
  }
  return data;
}

export async function POST(req: NextRequest) {
  try {
    const { promotionId } = await req.json();
    if (!promotionId) {
      return NextResponse.json({ error: 'Missing promotionId' }, { status: 400 });
    }

    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const igUserId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    if (!accessToken || !igUserId) {
      return NextResponse.json(
        { error: 'Instagram is not connected yet. Add INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID to your environment variables.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: promotion, error: fetchError } = await supabase
      .from('promotions')
      .select('*')
      .eq('id', promotionId)
      .single();

    if (fetchError || !promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }
    if (promotion.instagram_posted) {
      return NextResponse.json({ error: 'This promotion has already been posted to Instagram.' }, { status: 400 });
    }

    const caption = promotion.caption?.trim() ? promotion.caption : promotion.title;

    // Step 1: create a media container from the (publicly reachable) ad image.
    const container = await graphPost(`${igUserId}/media`, {
      image_url: promotion.image_url,
      caption,
      access_token: accessToken,
    });

    // Step 2: publish the container as a feed post.
    const published = await graphPost(`${igUserId}/media_publish`, {
      creation_id: container.id,
      access_token: accessToken,
    });

    // Step 3: fetch the public permalink so the admin can view/share the live post.
    let permalink: string | null = null;
    try {
      const permalinkRes = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${published.id}?fields=permalink&access_token=${accessToken}`
      );
      const permalinkData = await permalinkRes.json();
      permalink = permalinkData.permalink ?? null;
    } catch {
      // Non-fatal — the post is live either way, we just won't have a deep link for it.
    }

    const updates = {
      instagram_posted: true,
      instagram_post_id: published.id as string,
      instagram_permalink: permalink,
      instagram_posted_at: new Date().toISOString(),
    };

    await supabase.from('promotions').update(updates).eq('id', promotionId);

    return NextResponse.json({ success: true, promotion: updates });
  } catch (err) {
    console.error('Instagram post error:', err);
    const message = err instanceof Error ? err.message : 'Failed to post to Instagram';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
