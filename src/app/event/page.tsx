import { createAdminClient } from '@/lib/supabase/server';
import EventPageClient from './EventPageClient';

export default async function EventPage() {
  const supabase = createAdminClient();
  const [{ data: dbExhibitions }, { data: dbGallery }] = await Promise.all([
    supabase.from('exhibitions').select('*').order('year', { ascending: false }),
    supabase.from('gallery_images').select('*').order('id', { ascending: false }),
  ]);

  const exhibitions = (dbExhibitions ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    location: e.location,
    dates: e.dates,
    venue: e.venue,
    image: e.image_url ?? '',
    description: e.description ?? '',
    year: e.year,
    stats: { visitors: e.visitors, products: e.products_count, deals: e.deals },
  }));

  const gallery = (dbGallery ?? []).map((g) => ({
    id: g.id,
    url: g.url,
    alt: g.alt ?? '',
    location: g.location ?? '',
    year: g.year ?? undefined,
  }));

  return <EventPageClient exhibitions={exhibitions} galleryImages={gallery} />;
}
