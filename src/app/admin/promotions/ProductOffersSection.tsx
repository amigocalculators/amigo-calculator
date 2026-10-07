'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ProductPromotion } from '@/types';
import { getProductPromotionStatus, getProductPromotionLabel, ProductPromotionStatus } from '@/lib/productPromotions';
import { Plus, Pencil, Trash2, X, Check, Search, Tag } from 'lucide-react';

type Product = { id: number; name: string; price: number };

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function describeProductIds(ids: number[], products: Product[]): string {
  const names = ids.map((id) => products.find((p) => p.id === id)?.name ?? `#${id}`);
  if (names.length <= 2) return names.join(', ');
  return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`;
}

const STATUS_STYLE: Record<ProductPromotionStatus, { label: string; color: string }> = {
  off: { label: 'Off', color: 'bg-gray-100 text-gray-500' },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
  live: { label: 'Live', color: 'bg-green-100 text-green-700' },
  ended: { label: 'Ended', color: 'bg-gray-100 text-gray-400' },
};

export default function ProductOffersSection({ products, initialProductPromotions }: {
  products: Product[]; initialProductPromotions: ProductPromotion[];
}) {
  const [promotions, setPromotions] = useState<ProductPromotion[]>(initialProductPromotions);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProductPromotion | null>(null);

  // 'all' means "All Products" — a blanket promotion (product_ids NULL in the DB).
  // 'specific' scopes it to selectedProductIds (one or more products).
  const [targetMode, setTargetMode] = useState<'all' | 'specific'>('all');
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<number | ''>('');
  const [buyQty, setBuyQty] = useState<number | ''>('');
  const [getQty, setGetQty] = useState<number | ''>('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [enabled, setEnabled] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const supabase = createClient();

  const openCreate = () => {
    setEditing(null);
    setTargetMode('all');
    setSelectedProductIds([]);
    setProductSearch('');
    setDiscountPercent('');
    setBuyQty('');
    setGetQty('');
    setStartsAt('');
    setEndsAt('');
    setEnabled(true);
    setError('');
    setShowForm(true);
  };

  const openEdit = (promo: ProductPromotion) => {
    setEditing(promo);
    setTargetMode(promo.product_ids === null ? 'all' : 'specific');
    setSelectedProductIds(promo.product_ids ?? []);
    setProductSearch('');
    setDiscountPercent(promo.discount_percent ?? '');
    setBuyQty(promo.buy_qty ?? '');
    setGetQty(promo.get_qty ?? '');
    setStartsAt(toDatetimeLocalValue(promo.starts_at));
    setEndsAt(toDatetimeLocalValue(promo.ends_at));
    setEnabled(promo.enabled);
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    setError('');
    if (targetMode === 'specific' && selectedProductIds.length === 0) {
      setError('Pick at least one product, or choose All Products.');
      return;
    }
    if (!startsAt || !endsAt) {
      setError('Set a start and end date/time.');
      return;
    }
    if (new Date(endsAt) <= new Date(startsAt)) {
      setError('End must be after start.');
      return;
    }
    const hasDiscount = discountPercent !== '';
    const hasBuyGet = buyQty !== '' && getQty !== '';
    if (!hasDiscount && !hasBuyGet) {
      setError('Set a discount %, a buy/get quantity, or both.');
      return;
    }
    if ((buyQty !== '') !== (getQty !== '')) {
      setError('Set both Buy and Get quantities, or neither.');
      return;
    }

    setSaving(true);
    const payload = {
      product_ids: targetMode === 'all' ? null : selectedProductIds,
      discount_percent: hasDiscount ? discountPercent : null,
      buy_qty: hasBuyGet ? buyQty : null,
      get_qty: hasBuyGet ? getQty : null,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      enabled,
    };

    const query = editing
      ? supabase.from('product_promotions').update(payload).eq('id', editing.id).select().single()
      : supabase.from('product_promotions').insert(payload).select().single();

    const { data, error: saveError } = await query;
    if (saveError || !data) {
      setError(saveError?.message ?? 'Save failed');
      setSaving(false);
      return;
    }
    setPromotions((prev) => (editing ? prev.map((p) => (p.id === editing.id ? data : p)) : [data, ...prev]));
    setSaving(false);
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    const { error: deleteError } = await supabase.from('product_promotions').delete().eq('id', id);
    if (deleteError) {
      alert(`Delete failed: ${deleteError.message}`);
      return;
    }
    setPromotions((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

  const handleToggleEnabled = async (promo: ProductPromotion) => {
    const { data, error: updateError } = await supabase
      .from('product_promotions')
      .update({ enabled: !promo.enabled })
      .eq('id', promo.id)
      .select()
      .single();
    if (updateError || !data) {
      alert(`Update failed: ${updateError?.message ?? 'Unknown error'}`);
      return;
    }
    setPromotions((prev) => prev.map((p) => (p.id === promo.id ? data : p)));
  };

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()));

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Product Offers</h2>
          <p className="text-xs text-gray-500 mt-0.5">Discounts and buy-X-get-Y deals for individual products, each with its own date range.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Offer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {promotions.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No product offers yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 border-b">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Offer</th>
                <th className="px-4 py-3 font-medium">Window</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {promotions.map((promo) => {
                const status = getProductPromotionStatus(promo);
                const style = STATUS_STYLE[status];
                return (
                  <tr key={promo.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium max-w-56">
                      {promo.product_ids === null ? 'All Products' : describeProductIds(promo.product_ids, products)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-orange-500" />{getProductPromotionLabel(promo)}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(promo.starts_at).toLocaleString('en-IN')} → {new Date(promo.ends_at).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleEnabled(promo)}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${style.color}`}
                      >
                        {style.label}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(promo)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Pencil className="w-4 h-4" /></button>
                        {deleteConfirm === promo.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(promo.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(promo.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{editing ? 'Edit Offer' : 'Add Offer'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Applies to *</label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setTargetMode('all')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border ${
                      targetMode === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    All Products
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetMode('specific')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border ${
                      targetMode === 'specific' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Specific Products
                  </button>
                </div>

                {targetMode === 'specific' && (
                  <div className="relative">
                    {selectedProductIds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {selectedProductIds.map((id) => (
                          <span key={id} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium pl-2 pr-1 py-1 rounded-full">
                            {products.find((p) => p.id === id)?.name ?? `#${id}`}
                            <button
                              type="button"
                              onClick={() => setSelectedProductIds((prev) => prev.filter((pid) => pid !== id))}
                              className="hover:bg-blue-100 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={productSearch}
                        onFocus={() => setShowProductDropdown(true)}
                        onChange={(e) => setProductSearch(e.target.value)}
                        onBlur={() => setShowProductDropdown(false)}
                        placeholder="Search products to add…"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    {showProductDropdown && (
                      <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                        {filteredProducts.length === 0 ? (
                          <p className="px-3 py-2 text-sm text-gray-400">No matching products</p>
                        ) : (
                          filteredProducts.map((p) => {
                            const checked = selectedProductIds.includes(p.id);
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setSelectedProductIds((prev) => (checked ? prev.filter((pid) => pid !== p.id) : [...prev, p.id]))}
                                className={`w-full flex items-center justify-between text-left px-3 py-2 text-sm hover:bg-blue-50 ${checked ? 'bg-blue-50 font-medium' : ''}`}
                              >
                                <span>{p.name} (₹{p.price.toFixed(2)})</span>
                                {checked && <Check className="w-4 h-4 text-blue-600" />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Discount (optional)</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                  <input
                    type="number" min={1} max={99} value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Buy X Get Y (optional)</p>
                <p className="text-xs text-gray-500 mb-3">e.g. Buy 1 Get 1 → set Buy to 1 and Get to 1. Buy 2 Get 1 → Buy 2, Get 1.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buy</label>
                    <input
                      type="number" min={1} value={buyQty}
                      onChange={(e) => setBuyQty(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Get free</label>
                    <input
                      type="number" min={1} value={getQty}
                      onChange={(e) => setGetQty(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Starts at</label>
                  <input
                    type="datetime-local" value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ends at</label>
                  <input
                    type="datetime-local" value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="offerEnabled" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="w-4 h-4" />
                <label htmlFor="offerEnabled" className="text-sm font-medium text-gray-700">Enabled</label>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving}
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
