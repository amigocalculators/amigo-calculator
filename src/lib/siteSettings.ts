import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from './supabase/client';
import { SiteSettings } from '@/types';

// Defaults used if the singleton row is ever missing (shouldn't happen after the
// migration's seed insert) — fails open to "on" so a fetch hiccup never silently hides
// free delivery messaging that was meant to be there.
const DEFAULT_SETTINGS: Pick<SiteSettings, 'free_delivery_enabled'> = { free_delivery_enabled: true };

// Accepts an injected client so server routes/pages can pass createAdminClient() for an
// authoritative read, while client components keep using the default browser client.
export async function getSiteSettings(supabase: SupabaseClient = createClient()): Promise<Pick<SiteSettings, 'free_delivery_enabled'>> {
  const { data } = await supabase.from('site_settings').select('free_delivery_enabled').eq('id', 1).maybeSingle();
  return data ?? DEFAULT_SETTINGS;
}
