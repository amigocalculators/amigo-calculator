import { createAdminClient } from '@/lib/supabase/server';
import ExhibitionsManager from './ExhibitionsManager';

export default async function AdminExhibitionsPage() {
  const supabase = createAdminClient();
  const [{ data: exhibitions }, { data: gallery }] = await Promise.all([
    supabase.from('exhibitions').select('*').order('year', { ascending: false }),
    supabase.from('gallery_images').select('*').order('id', { ascending: false }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Exhibitions & Gallery</h1>
      <ExhibitionsManager initialExhibitions={exhibitions ?? []} initialGallery={gallery ?? []} />
    </div>
  );
}
