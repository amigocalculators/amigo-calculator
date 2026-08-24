'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/supabase/storage';
import { Plus, Pencil, Trash2, X, Check, Upload, ImageIcon } from 'lucide-react';

type Exhibition = {
  id: number;
  name: string;
  location: string;
  dates: string;
  venue: string;
  image_url: string | null;
  description: string | null;
  year: number;
  visitors: number;
  products_count: number;
  deals: number;
};

type GalleryImage = {
  id: number;
  url: string;
  alt: string | null;
  location: string | null;
  year: number | null;
};

const emptyExhibition: Omit<Exhibition, 'id'> = {
  name: '', location: '', dates: '', venue: '', image_url: '', description: '',
  year: new Date().getFullYear(), visitors: 0, products_count: 0, deals: 0,
};

const emptyGallery: Omit<GalleryImage, 'id'> = { url: '', alt: '', location: '', year: new Date().getFullYear() };

function ImageUploadField({ label, value, onChange, bucket }: {
  label: string; value: string; onChange: (url: string) => void; bucket: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, bucket);
      onChange(url);
    } catch (err) {
      alert(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {value && (
        <div className="relative w-24 h-24 mb-2 rounded-lg overflow-hidden border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="preview" className="w-full h-full object-cover" />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      <div className="flex gap-2 items-center">
        <input value={value ?? ''} onChange={(e) => onChange(e.target.value)}
          placeholder="/Image/Banner/... or upload"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm hover:bg-gray-200 disabled:opacity-60 whitespace-nowrap">
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}

export default function ExhibitionsManager({ initialExhibitions, initialGallery }: {
  initialExhibitions: Exhibition[];
  initialGallery: GalleryImage[];
}) {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>(initialExhibitions);
  const [gallery, setGallery] = useState<GalleryImage[]>(initialGallery);
  const [activeTab, setActiveTab] = useState<'exhibitions' | 'gallery'>('exhibitions');
  const [showForm, setShowForm] = useState(false);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [editing, setEditing] = useState<Exhibition | null>(null);
  const [form, setForm] = useState<Omit<Exhibition, 'id'>>(emptyExhibition);
  const [galleryForm, setGalleryForm] = useState<Omit<GalleryImage, 'id'>>(emptyGallery);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const supabase = createClient();

  const handleSaveExhibition = async () => {
    setSaving(true);
    if (editing) {
      const { data, error } = await supabase.from('exhibitions').update(form).eq('id', editing.id).select().single();
      if (error) {
        alert(`Save failed: ${error.message}`);
        setSaving(false);
        return;
      }
      setExhibitions((prev) => prev.map((e) => (e.id === editing.id ? data : e)));
    } else {
      const { data, error } = await supabase.from('exhibitions').insert(form).select().single();
      if (error) {
        alert(`Save failed: ${error.message}`);
        setSaving(false);
        return;
      }
      setExhibitions((prev) => [data, ...prev]);
    }
    setSaving(false);
    setShowForm(false);
  };

  const handleDeleteExhibition = async (id: number) => {
    const { error } = await supabase.from('exhibitions').delete().eq('id', id);
    if (error) {
      alert(`Delete failed: ${error.message}`);
      return;
    }
    setExhibitions((prev) => prev.filter((e) => e.id !== id));
    setDeleteConfirm(null);
  };

  const handleSaveGallery = async () => {
    setSaving(true);
    const { data, error } = await supabase.from('gallery_images').insert(galleryForm).select().single();
    if (error) {
      alert(`Save failed: ${error.message}`);
      setSaving(false);
      return;
    }
    setGallery((prev) => [data, ...prev]);
    setSaving(false);
    setShowGalleryForm(false);
    setGalleryForm(emptyGallery);
  };

  const handleDeleteGallery = async (id: number) => {
    const { error } = await supabase.from('gallery_images').delete().eq('id', id);
    if (error) {
      alert(`Delete failed: ${error.message}`);
      return;
    }
    setGallery((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b">
        {(['exhibitions', 'gallery'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Exhibitions Tab */}
      {activeTab === 'exhibitions' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => { setEditing(null); setForm(emptyExhibition); setShowForm(true); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              <Plus className="w-4 h-4" /> Add Exhibition
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {exhibitions.length === 0 ? (
              <p className="text-gray-500 text-center py-12">No exhibitions yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 bg-gray-50 border-b">
                    <th className="px-4 py-3 font-medium">Exhibition</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Year</th>
                    <th className="px-4 py-3 font-medium">Visitors</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {exhibitions.map((ex) => (
                    <tr key={ex.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {ex.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={ex.image_url} alt={ex.name} className="w-10 h-10 object-cover rounded" />
                          )}
                          <div>
                            <p className="font-medium">{ex.name}</p>
                            <p className="text-gray-500 text-xs">{ex.dates}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{ex.location}</td>
                      <td className="px-4 py-3">{ex.year}</td>
                      <td className="px-4 py-3 text-gray-600">{ex.visitors.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => {
                            setEditing(ex);
                            setForm({ name: ex.name, location: ex.location, dates: ex.dates, venue: ex.venue, image_url: ex.image_url, description: ex.description, year: ex.year, visitors: ex.visitors, products_count: ex.products_count, deals: ex.deals });
                            setShowForm(true);
                          }} className="p-1.5 rounded hover:bg-blue-50 text-blue-600">
                            <Pencil className="w-4 h-4" />
                          </button>
                          {deleteConfirm === ex.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDeleteExhibition(ex.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Check className="w-4 h-4" /></button>
                              <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(ex.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowGalleryForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              <Plus className="w-4 h-4" /> Add Image
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((img) => (
              <div key={img.id} className="relative group bg-white rounded-xl shadow-sm overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt ?? ''} className="w-full h-40 object-cover" />
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{img.alt ?? 'No description'}</p>
                  <p className="text-xs text-gray-500">{img.location} · {img.year}</p>
                </div>
                <button onClick={() => handleDeleteGallery(img.id)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {gallery.length === 0 && (
              <div className="col-span-full flex flex-col items-center py-12 text-gray-400">
                <ImageIcon className="w-12 h-12 mb-3" />
                <p>No gallery images yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exhibition Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{editing ? 'Edit Exhibition' : 'Add Exhibition'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              {[
                { label: 'Name *', key: 'name' },
                { label: 'Location *', key: 'location' },
                { label: 'Dates *', key: 'dates', placeholder: 'January 21-23, 2025' },
                { label: 'Venue *', key: 'venue' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input value={(form as Record<string, unknown>)[key] as string ?? ''} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              ))}

              <ImageUploadField label="Exhibition Image" value={form.image_url ?? ''}
                onChange={(url) => setForm((f) => ({ ...f, image_url: url }))} bucket="exhibitions" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={2} value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                  <input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visitors</label>
                  <input type="number" value={form.visitors} onChange={(e) => setForm((f) => ({ ...f, visitors: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Products Shown</label>
                  <input type="number" value={form.products_count} onChange={(e) => setForm((f) => ({ ...f, products_count: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deals</label>
                  <input type="number" value={form.deals} onChange={(e) => setForm((f) => ({ ...f, deals: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveExhibition} disabled={saving || !form.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Form Modal */}
      {showGalleryForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">Add Gallery Image</h2>
              <button onClick={() => setShowGalleryForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <ImageUploadField label="Image *" value={galleryForm.url}
                onChange={(url) => setGalleryForm((f) => ({ ...f, url }))} bucket="exhibitions" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input value={galleryForm.alt ?? ''} onChange={(e) => setGalleryForm((f) => ({ ...f, alt: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input value={galleryForm.location ?? ''} onChange={(e) => setGalleryForm((f) => ({ ...f, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input type="number" value={galleryForm.year ?? ''} onChange={(e) => setGalleryForm((f) => ({ ...f, year: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setShowGalleryForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveGallery} disabled={saving || !galleryForm.url}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Saving...' : 'Add Image'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
