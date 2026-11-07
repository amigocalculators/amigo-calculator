'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/supabase/storage';
import { Plus, Pencil, Trash2, X, Check, Upload, ImageIcon, Search } from 'lucide-react';

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
  dummy_rating: number | null;
  dummy_rating_count: number | null;
  dummy_top_rated: boolean;
  // Trigger-maintained once a real rating comes in -- read-only here, shown as an
  // info note in the edit form, never part of the save payload.
  real_rating_avg: number | null;
  real_rating_count: number;
  real_top_rated: boolean;
};

type ProductForm = Omit<Product, 'id' | 'real_rating_avg' | 'real_rating_count' | 'real_top_rated'>;

const emptyProduct: ProductForm = {
  name: '', price: 0, prevprice: null, image: '', images: [], description: '',
  category: '', rating: '', reviews: 0, in_stock: true, features: [],
  specifications: {}, warranty: '', highlights: [], dummy_rating: null, dummy_rating_count: null,
  dummy_top_rated: false,
};

// New products get a random, plausible placeholder rating pre-filled (editable
// before saving) so admins don't have to invent a number for every product --
// mirrors the backfill in supabase/migration_020_product_ratings.sql.
const randomDummyRating = () => ({
  dummy_rating: Math.round((4.3 + Math.random() * 0.6) * 10) / 10,
  dummy_rating_count: Math.floor(35 + Math.random() * 400),
});

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
        <input value={value} onChange={(e) => onChange(e.target.value)}
          placeholder="Image URL or upload"
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
    } catch (err) {
      alert(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
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

type StockFilter = 'all' | 'in' | 'out';

export default function ProductsManager({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const supabase = createClient();

  const [featuresInput, setFeaturesInput] = useState('');
  const [highlightsInput, setHighlightsInput] = useState('');
  const [specsInput, setSpecsInput] = useState('');

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyProduct, ...randomDummyRating() });
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
      dummy_rating: product.dummy_rating, dummy_rating_count: product.dummy_rating_count,
      dummy_top_rated: product.dummy_top_rated,
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
      if (error) {
        alert(`Save failed: ${error.message}`);
        setSaving(false);
        return;
      }
      setProducts((prev) => prev.map((p) => (p.id === editing.id ? data : p)));
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select().single();
      if (error) {
        alert(`Save failed: ${error.message}`);
        setSaving(false);
        return;
      }
      setProducts((prev) => [...prev, data]);
    }
    setSaving(false);
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert(`Delete failed: ${error.message}`);
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

  const filteredProducts = products.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.category ?? '').toLowerCase().includes(q) ||
      String(p.price).includes(q);
    const matchesStock = stockFilter === 'all' || (stockFilter === 'in' ? p.in_stock : !p.in_stock);
    return matchesSearch && matchesStock;
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-60">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, price or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as StockFilter)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="all">All Stock</option>
            <option value="in">In Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No products yet.</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No products match your search.</p>
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
              {filteredProducts.map((p) => (
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dummy Star Rating (0–5)</label>
                  <input type="number" step="0.1" min="0" max="5" value={form.dummy_rating ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, dummy_rating: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dummy Rating Count</label>
                  <input type="number" min="0" step="1" value={form.dummy_rating_count ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, dummy_rating_count: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              {(!editing || editing.real_rating_count === 0) && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="dummy_top_rated" checked={form.dummy_top_rated}
                    onChange={(e) => setForm((f) => ({ ...f, dummy_top_rated: e.target.checked }))} className="w-4 h-4" />
                  <label htmlFor="dummy_top_rated" className="text-sm font-medium text-gray-700">
                    Show &quot;Top Rated&quot; badge (while on dummy rating)
                  </label>
                </div>
              )}
              <p className="text-xs text-gray-500 -mt-2">
                The star rating above always shows on the storefront until the product gets its first real customer rating.
                The &quot;Top Rated&quot; label is separate -- check it only for the handful of products you want to
                highlight.
              </p>
              {editing && editing.real_rating_count > 0 && (
                <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                  This product has real customer ratings now ({Number(editing.real_rating_avg).toFixed(2)}★ from{' '}
                  {editing.real_rating_count} rating{editing.real_rating_count === 1 ? '' : 's'}) and permanently shows
                  those instead of the dummy rating above. The &quot;Top Rated&quot; label is now automatic --{' '}
                  {editing.real_top_rated
                    ? 'it IS currently showing, because this is one of the 5 highest-rated real-rated products.'
                    : "it is NOT currently showing, because this isn't in the top 5 highest-rated real-rated products."}
                </p>
              )}

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
