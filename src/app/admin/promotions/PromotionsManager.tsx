'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/supabase/storage';
import { Promotion } from '@/types';
import { Plus, Pencil, Trash2, X, Check, Upload, Instagram, ExternalLink, Loader2 } from 'lucide-react';

type PromotionForm = Omit<Promotion, 'id' | 'instagram_posted' | 'instagram_post_id' | 'instagram_permalink' | 'instagram_posted_at' | 'created_at'>;

const emptyPromotion: PromotionForm = {
  title: '', image_url: '', caption: '', active: true,
  free_gift_name: '', free_gift_image: '', free_gift_value: null, free_gift_per_unit: false,
};

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
          placeholder="/Image/... or upload"
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

export default function PromotionsManager({ initialPromotions }: { initialPromotions: Promotion[] }) {
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState<PromotionForm>(emptyPromotion);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [postingId, setPostingId] = useState<number | null>(null);
  const supabase = createClient();

  const openCreate = () => {
    setEditing(null);
    setForm(emptyPromotion);
    setShowForm(true);
  };

  const openEdit = (promo: Promotion) => {
    setEditing(promo);
    setForm({
      title: promo.title, image_url: promo.image_url, caption: promo.caption ?? '',
      active: promo.active, free_gift_name: promo.free_gift_name ?? '',
      free_gift_image: promo.free_gift_image ?? '', free_gift_value: promo.free_gift_value,
      free_gift_per_unit: promo.free_gift_per_unit,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form, free_gift_name: form.free_gift_name || null, free_gift_image: form.free_gift_image || null };
    if (editing) {
      const { data, error } = await supabase.from('promotions').update(payload).eq('id', editing.id).select().single();
      if (!error && data) setPromotions((prev) => prev.map((p) => (p.id === editing.id ? data : p)));
      else if (error) alert(`Save failed: ${error.message}`);
    } else {
      const { data, error } = await supabase.from('promotions').insert(payload).select().single();
      if (!error && data) setPromotions((prev) => [data, ...prev]);
      else if (error) alert(`Save failed: ${error.message}`);
    }
    setSaving(false);
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    await supabase.from('promotions').delete().eq('id', id);
    setPromotions((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

  const handleToggleActive = async (promo: Promotion) => {
    const { data, error } = await supabase.from('promotions').update({ active: !promo.active }).eq('id', promo.id).select().single();
    if (!error && data) setPromotions((prev) => prev.map((p) => (p.id === promo.id ? data : p)));
  };

  const handlePostToInstagram = async (id: number) => {
    setPostingId(id);
    try {
      const res = await fetch('/api/admin/instagram-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promotionId: id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? 'Failed to post to Instagram');
      setPromotions((prev) => prev.map((p) => (p.id === id ? { ...p, ...result.promotion } : p)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to post to Instagram');
    } finally {
      setPostingId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Promotion
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {promotions.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No promotions yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 border-b">
                <th className="px-4 py-3 font-medium">Promotion</th>
                <th className="px-4 py-3 font-medium">Free Gift</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Instagram</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {promotions.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image_url} alt={p.title} className="w-10 h-10 object-cover rounded" />
                      <span className="font-medium">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.free_gift_name ? (
                      <>
                        {p.free_gift_name}
                        <p className="text-gray-400 text-xs">{p.free_gift_per_unit ? 'per calculator' : 'per order'}</p>
                      </>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(p)}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${p.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {p.active ? 'Active' : 'Ended'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {p.instagram_posted ? (
                      p.instagram_permalink ? (
                        <a href={p.instagram_permalink} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline text-xs font-medium">
                          <Check className="w-3.5 h-3.5" /> Posted <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-500 text-xs font-medium"><Check className="w-3.5 h-3.5" /> Posted</span>
                      )
                    ) : (
                      <button
                        onClick={() => handlePostToInstagram(p.id)}
                        disabled={postingId === p.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
                      >
                        {postingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Instagram className="w-3.5 h-3.5" />}
                        {postingId === p.id ? 'Posting...' : 'Post to Instagram'}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Pencil className="w-4 h-4" /></button>
                      {deleteConfirm === p.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{editing ? 'Edit Promotion' : 'Add Promotion'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Independence Day Offer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <ImageUploadField label="Ad Image *" value={form.image_url}
                onChange={(url) => setForm((f) => ({ ...f, image_url: url }))} bucket="promotions" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                <textarea rows={3} value={form.caption ?? ''} onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
                  placeholder="Used as the website banner subtext and the Instagram caption"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="w-4 h-4" />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">Active (shown on website)</label>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Free gift (optional)</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gift name</label>
                    <input value={form.free_gift_name ?? ''} onChange={(e) => setForm((f) => ({ ...f, free_gift_name: e.target.value }))}
                      placeholder="e.g. Amigo Fan (leave blank for no free gift)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  {form.free_gift_name && (
                    <>
                      <ImageUploadField label="Gift photo (shown in cart)" value={form.free_gift_image ?? ''}
                        onChange={(url) => setForm((f) => ({ ...f, free_gift_image: url }))} bucket="promotions" />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gift value (₹, for &quot;worth ₹X&quot; display)</label>
                        <input type="number" value={form.free_gift_value ?? ''} onChange={(e) => setForm((f) => ({ ...f, free_gift_value: e.target.value ? Number(e.target.value) : null }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gift quantity rule</label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="radio" name="giftRule" checked={!form.free_gift_per_unit} onChange={() => setForm((f) => ({ ...f, free_gift_per_unit: false }))} />
                            1 free gift per order
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="radio" name="giftRule" checked={form.free_gift_per_unit} onChange={() => setForm((f) => ({ ...f, free_gift_per_unit: true }))} />
                            1 free gift per calculator bought
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title || !form.image_url}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
