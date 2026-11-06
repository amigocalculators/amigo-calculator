'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CouponCode } from '@/types';
import { getCouponStatus, CouponStatus, describeDiscount } from '@/lib/couponCodes';
import { Plus, Pencil, Trash2, X, Check, Ticket, Sparkles } from 'lucide-react';

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const STATUS_STYLE: Record<CouponStatus, { label: string; color: string }> = {
  off: { label: 'Off', color: 'bg-gray-100 text-gray-500' },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
  live: { label: 'Live', color: 'bg-green-100 text-green-700' },
  ended: { label: 'Ended', color: 'bg-gray-100 text-gray-400' },
};

export default function CouponsManager({ initialCoupons }: { initialCoupons: CouponCode[] }) {
  const [coupons, setCoupons] = useState<CouponCode[]>(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CouponCode | null>(null);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('flat');
  const [discountValue, setDiscountValue] = useState<number | ''>('');
  const [minCartTotal, setMinCartTotal] = useState<number | ''>(0);
  const [combinable, setCombinable] = useState(false);
  const [autoApply, setAutoApply] = useState(false);
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [active, setActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const supabase = createClient();

  const openCreate = () => {
    setEditing(null);
    setCode('');
    setDiscountType('flat');
    setDiscountValue('');
    setMinCartTotal(0);
    setCombinable(false);
    setAutoApply(false);
    setStartsAt('');
    setEndsAt('');
    setActive(true);
    setError('');
    setShowForm(true);
  };

  const openEdit = (coupon: CouponCode) => {
    setEditing(coupon);
    setCode(coupon.code);
    setDiscountType(coupon.discount_type);
    setDiscountValue(coupon.discount_value);
    setMinCartTotal(coupon.min_cart_total);
    setCombinable(coupon.combinable_with_other_offers);
    setAutoApply(coupon.auto_apply);
    setStartsAt(toDatetimeLocalValue(coupon.starts_at));
    setEndsAt(toDatetimeLocalValue(coupon.ends_at));
    setActive(coupon.active);
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    setError('');
    if (!code.trim()) {
      setError('Enter a code.');
      return;
    }
    if (discountValue === '' || discountValue <= 0) {
      setError('Enter a discount value greater than 0.');
      return;
    }
    if (discountType === 'percentage' && discountValue > 100) {
      setError('A percentage discount can\'t exceed 100.');
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

    setSaving(true);
    const payload = {
      // Stored/compared uppercase, trimmed — matches getCouponByCode's normalization so
      // a code typed any way at checkout matches what's saved here.
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: discountValue,
      min_cart_total: minCartTotal === '' ? 0 : minCartTotal,
      combinable_with_other_offers: combinable,
      auto_apply: autoApply,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      active,
    };

    const query = editing
      ? supabase.from('coupon_codes').update(payload).eq('id', editing.id).select().single()
      : supabase.from('coupon_codes').insert(payload).select().single();

    const { data, error: saveError } = await query;
    if (saveError || !data) {
      setError(saveError?.message ?? 'Save failed');
      setSaving(false);
      return;
    }
    setCoupons((prev) => (editing ? prev.map((c) => (c.id === editing.id ? data : c)) : [data, ...prev]));
    setSaving(false);
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    const { error: deleteError } = await supabase.from('coupon_codes').delete().eq('id', id);
    if (deleteError) {
      alert(`Delete failed: ${deleteError.message}`);
      return;
    }
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirm(null);
  };

  const handleToggleActive = async (coupon: CouponCode) => {
    const { data, error: updateError } = await supabase
      .from('coupon_codes')
      .update({ active: !coupon.active })
      .eq('id', coupon.id)
      .select()
      .single();
    if (updateError || !data) {
      alert(`Update failed: ${updateError?.message ?? 'Unknown error'}`);
      return;
    }
    setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? data : c)));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Coupon Codes</h2>
          <p className="text-xs text-gray-500 mt-0.5">Cart-level codes customers can type in at checkout for an extra flat or % discount.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {coupons.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No coupon codes yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 border-b">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Min. Cart</th>
                <th className="px-4 py-3 font-medium">Combinable</th>
                <th className="px-4 py-3 font-medium">Window</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((coupon) => {
                const status = getCouponStatus(coupon);
                const style = STATUS_STYLE[status];
                return (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      <span className="flex items-center gap-1.5"><Ticket className="w-3.5 h-3.5 text-orange-500" />{coupon.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      {coupon.auto_apply ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-full w-fit"><Sparkles className="w-3 h-3" />Tier (auto)</span>
                      ) : (
                        <span className="text-xs font-medium text-gray-500">Coupon</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{describeDiscount(coupon)}</td>
                    <td className="px-4 py-3 text-gray-600">₹{coupon.min_cart_total.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">{coupon.auto_apply ? '—' : coupon.combinable_with_other_offers ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(coupon.starts_at).toLocaleString('en-IN')} → {new Date(coupon.ends_at).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${style.color}`}
                      >
                        {style.label}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(coupon)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Pencil className="w-4 h-4" /></button>
                        {deleteConfirm === coupon.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(coupon.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(coupon.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
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
              <h2 className="text-lg font-bold">{editing ? 'Edit Coupon' : 'Add Coupon'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="flex items-start gap-2 bg-purple-50 border border-purple-100 rounded-lg p-3">
                <input type="checkbox" id="autoApply" checked={autoApply} onChange={(e) => setAutoApply(e.target.checked)} className="w-4 h-4 mt-0.5" />
                <label htmlFor="autoApply" className="text-sm text-gray-700">
                  <span className="font-medium flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-purple-600" />Auto-apply tier</span>
                  <span className="block text-xs text-gray-500 mt-0.5">No code to type, and shoppers can&apos;t pick it — it applies automatically once the cart subtotal crosses the minimum below. Shown in the cart drawer&apos;s progress bar instead of the coupon carousel, always applies regardless of the &quot;Combinable&quot; setting, and its code <strong>is</strong> shown to the customer once applied (in the drawer and at checkout) — pick something presentable, not an internal id.</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={autoApply ? 'e.g. EXTRA10 — shown to the customer once applied' : 'e.g. WELCOME10'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount type *</label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setDiscountType('flat')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border ${
                      discountType === 'flat' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Flat (₹)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('percentage')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border ${
                      discountType === 'percentage' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Percentage (%)
                  </button>
                </div>
                <input
                  type="number" min={1} max={discountType === 'percentage' ? 100 : undefined} value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={discountType === 'percentage' ? 'e.g. 10' : 'e.g. 100'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum cart total (₹)</label>
                <input
                  type="number" min={0} value={minCartTotal}
                  onChange={(e) => setMinCartTotal(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
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

              {autoApply ? (
                <p className="text-xs text-gray-500 italic">Tiers always apply automatically regardless of other offers — the &quot;Combinable&quot; setting is inert for tier rows.</p>
              ) : (
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="combinable" checked={combinable} onChange={(e) => setCombinable(e.target.checked)} className="w-4 h-4" />
                  <label htmlFor="combinable" className="text-sm font-medium text-gray-700">
                    Combinable with other offers (flash sale / product promotion / free gift / auto-apply tier)
                  </label>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input type="checkbox" id="couponActive" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4" />
                <label htmlFor="couponActive" className="text-sm font-medium text-gray-700">Active</label>
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
