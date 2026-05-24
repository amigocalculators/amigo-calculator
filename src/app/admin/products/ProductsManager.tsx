'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/supabase/storage';
import { Plus, Pencil, Trash2, X, Check, Upload, ImageIcon } from 'lucide-react';

type Product = {
  id: number;
  name: string;
  price: number;
  prevprice: number | null;
  image: string;
  images: string[];
  description: string | null;
  category: string | null;
  rating: string | null;
  reviews: number;
  in_stock: boolean;
  features: string[];
  specifications: Record<string, string>;
  warranty: string | null;
  highlights: string[];
};

const emptyProduct: Omit<Product, 'id'> = {
  name: '', price: 0, prevprice: null, image: '', images: [], description: '',
  category: '', rating: '', reviews: 0, in_stock: true, features: [],
  specifications: {}, warranty: '', highlights: [],
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
    } catch {
      alert('Upload failed. Make sure the Supabase storage bucket exists and is public.');
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
        <input value={value} onChange={(e) => onChange(e.target.value)}
          placeholder="/Image/Product/... or upload"
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

function MultiImageUpload({ images, onChange, bucket }: {
  images: string[]; onChange: (images: string[]) => void; bucket: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, bucket);
      onChange([...images, url]);
    } catch {
      alert('Upload failed.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Additional Images</label>
      <div className="flex flex-wrap gap-2 mb-1">
        {images.map((url, i) => (
          <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`img-${i}`} className="w-full h-full object-cover" />
            <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))}
              className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5">
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-60">
          {uploading ? <span className="text-xs">...</span> : (
            <><ImageIcon className="w-5 h-5 mb-0.5" /><span className="text-xs">Add</span></>
          )}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

export default function ProductsManager({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const supabase = createClient();

  const [featuresInput, setFeaturesInput] = useState('');
  const [highlightsInput, setHighlightsInput] = useState('');
  const [specsInput, setSpecsInput] = useState('');

  const openCreate = () => {
    setEditing(null);
    setForm(emptyProduct);
    setFeaturesInput('');
    setHighlightsInput('');
    setSpecsInput('');
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name, price: product.price, prevprice: product.prevprice,
      image: product.image, images: product.images, description: product.description ?? '',
      category: product.category ?? '', rating: product.rating ?? '', reviews: product.reviews,
      in_stock: product.in_stock, features: product.features, specifications: product.specifications,
      warranty: product.warranty ?? '', highlights: product.highlights,
    });
    setFeaturesInput(product.features.join('\n'));
    setHighlightsInput(product.highlights.join('\n'));
    setSpecsInput(Object.entries(product.specifications).map(([k, v]) => `${k}: ${v}`).join('\n'));
    setShowForm(true);
  };

  const parseFormArrays = () => ({
    features: featuresInput.split('\n').map((s) => s.trim()).filter(Boolean),
    highlights: highlightsInput.split('\n').map((s) => s.trim()).filter(Boolean),
    specifications: Object.fromEntries(
      specsInput.split('\n').map((s) => s.trim()).filter(Boolean).map((line) => {
        const idx = line.indexOf(':');
        return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
      })
    ),
  });

  const handleSave = async () => {
    setSaving(true);
    const { features, highlights, specifications } = parseFormArrays();
    const payload = { ...form, features, highlights, specifications };

    if (editing) {
      const { data, error } = await supabase.from('products').update(payload).eq('id', editing.id).select().single();
      if (!error && data) setProducts((prev) => prev.map((p) => (p.id === editing.id ? data : p)));
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select().single();
      if (!error && data) setProducts((prev) => [...prev, data]);
    }
    setSaving(false);
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    await supabase.from('products').delete().eq('id', id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No products yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 border-b">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded" />
                    <span className="font-medium">{p.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    ₹{Number(p.price).toFixed(2)}
                    {p.prevprice && <p className="text-gray-400 text-xs line-through">₹{Number(p.prevprice).toFixed(2)}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.category ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input value={form.category ?? ''} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
                  <input type="number" value={form.prevprice ?? ''} onChange={(e) => setForm((f) => ({ ...f, prevprice: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <ImageUploadField label="Main Image *" value={form.image}
                onChange={(url) => setForm((f) => ({ ...f, image: url }))} bucket="products" />

              <MultiImageUpload images={form.images}
                onChange={(imgs) => setForm((f) => ({ ...f, images: imgs }))} bucket="products" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating Label</label>
                  <input value={form.rating ?? ''} onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                    placeholder="e.g. Large Calculator"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warranty</label>
                  <input value={form.warranty ?? ''} onChange={(e) => setForm((f) => ({ ...f, warranty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
                <textarea rows={4} value={featuresInput} onChange={(e) => setFeaturesInput(e.target.value)}
                  placeholder="14-Digit Display&#10;AA Battery&#10;Tax Calculation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Highlights (one per line)</label>
                <textarea rows={3} value={highlightsInput} onChange={(e) => setHighlightsInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specifications (one per line, format: Key: Value)</label>
                <textarea rows={4} value={specsInput} onChange={(e) => setSpecsInput(e.target.value)}
                  placeholder="Display Type: LCD&#10;Power Source: Solar & Battery&#10;Weight: 251g"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="in_stock" checked={form.in_stock} onChange={(e) => setForm((f) => ({ ...f, in_stock: e.target.checked }))} className="w-4 h-4" />
                <label htmlFor="in_stock" className="text-sm font-medium text-gray-700">In Stock</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.image}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
