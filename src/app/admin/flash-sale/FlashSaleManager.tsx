'use client';

import { useState, useEffect } from 'react';
import { Zap, Search } from 'lucide-react';
import { FlashSale } from '@/types';
import ImageUploadField from '@/components/admin/ImageUploadField';

type Product = { id: number; name: string; price: number };
type Lead = { user_id: string; status: string; created_at: string; name: string | null; email: string | null; phone: string | null };

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function statusOf(sale: FlashSale | null, now: Date): { label: string; color: string } {
  if (!sale) return { label: 'Not configured', color: 'bg-gray-100 text-gray-500' };
  if (!sale.enabled) return { label: 'Off', color: 'bg-gray-100 text-gray-500' };
  if (new Date(sale.starts_at) > now) return { label: `Coming Soon — ${new Date(sale.starts_at).toLocaleString('en-IN')}`, color: 'bg-blue-100 text-blue-700' };
  if (sale.claimed_count >= sale.max_claims) {
    if (sale.after_sold_out_discount_percent && sale.after_sold_out_ends_at && new Date(sale.after_sold_out_ends_at) > now) {
      return { label: `${sale.after_sold_out_discount_percent}% Off — until ${new Date(sale.after_sold_out_ends_at).toLocaleString('en-IN')}`, color: 'bg-purple-100 text-purple-700' };
    }
    return { label: `Sold Out — ${sale.claimed_count}/${sale.max_claims}`, color: 'bg-red-100 text-red-700' };
  }
  return { label: `Live — ${sale.claimed_count}/${sale.max_claims} claimed`, color: 'bg-green-100 text-green-700' };
}

export default function FlashSaleManager({ initialFlashSale, products, initialLeads }: {
  initialFlashSale: FlashSale | null; products: Product[]; initialLeads: Lead[];
}) {
  const [flashSale, setFlashSale] = useState<FlashSale | null>(initialFlashSale);
  const [leads] = useState<Lead[]>(initialLeads);
  const [now, setNow] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [productId, setProductId] = useState(initialFlashSale?.product_id ?? products[0]?.id ?? 0);
  const [salePrice, setSalePrice] = useState(initialFlashSale?.sale_price ?? 1);
  const [maxClaims, setMaxClaims] = useState(initialFlashSale?.max_claims ?? 10);
  const [startsAt, setStartsAt] = useState(initialFlashSale ? toDatetimeLocalValue(initialFlashSale.starts_at) : '');
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [adImageUrl, setAdImageUrl] = useState(initialFlashSale?.ad_image_url ?? '');
  const [adTitle, setAdTitle] = useState(initialFlashSale?.ad_title ?? '');
  const [adCaption, setAdCaption] = useState(initialFlashSale?.ad_caption ?? '');
  const [afterSoldOutDiscountPercent, setAfterSoldOutDiscountPercent] = useState<number | ''>(initialFlashSale?.after_sold_out_discount_percent ?? '');
  const [afterSoldOutEndsAt, setAfterSoldOutEndsAt] = useState(
    initialFlashSale?.after_sold_out_ends_at ? toDatetimeLocalValue(initialFlashSale.after_sold_out_ends_at) : ''
  );

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSave = async () => {
    setError('');
    if (!startsAt) {
      setError('Set a start date/time.');
      return;
    }
    if (afterSoldOutDiscountPercent && !afterSoldOutEndsAt) {
      setError('Set an end date/time for the after-sold-out discount.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/flash-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          sale_price: salePrice,
          max_claims: maxClaims,
          starts_at: new Date(startsAt).toISOString(),
          // No standalone form control for this — a brand-new sale always starts
          // enabled; editing an existing one preserves whatever the pill last set,
          // so tweaking price/schedule/copy here can't accidentally flip it off.
          enabled: flashSale?.enabled ?? true,
          ad_image_url: adImageUrl,
          ad_title: adTitle,
          ad_caption: adCaption,
          after_sold_out_discount_percent: afterSoldOutDiscountPercent || null,
          after_sold_out_ends_at: afterSoldOutEndsAt ? new Date(afterSoldOutEndsAt).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Save failed');
      setFlashSale(data.flashSale);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = async () => {
    if (!flashSale) return;
    setSaving(true);
    setError('');
    const next = !flashSale.enabled;
    try {
      const res = await fetch('/api/admin/flash-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: flashSale.product_id,
          sale_price: flashSale.sale_price,
          max_claims: flashSale.max_claims,
          starts_at: flashSale.starts_at,
          enabled: next,
          ad_image_url: flashSale.ad_image_url,
          ad_title: flashSale.ad_title,
          ad_caption: flashSale.ad_caption,
          after_sold_out_discount_percent: flashSale.after_sold_out_discount_percent,
          after_sold_out_ends_at: flashSale.after_sold_out_ends_at,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Update failed');
      setFlashSale(data.flashSale);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const status = statusOf(flashSale, now);
  const productName = products.find((p) => p.id === flashSale?.product_id)?.name;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">{productName ?? 'Flash Sale'}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
            {flashSale && (
              <button
                onClick={handleToggleEnabled}
                disabled={saving}
                className={`px-3 py-1.5 rounded-full text-xs font-medium disabled:opacity-60 ${
                  flashSale.enabled ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {flashSale.enabled ? 'Turn Off' : 'Turn On'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={showProductDropdown ? productSearch : (products.find((p) => p.id === productId)?.name ?? '')}
                onFocus={() => { setShowProductDropdown(true); setProductSearch(''); }}
                onChange={(e) => setProductSearch(e.target.value)}
                onBlur={() => setShowProductDropdown(false)}
                placeholder="Search products…"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            {showProductDropdown && (
              <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                {products.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase())).length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray-400">No matching products</p>
                ) : (
                  products
                    .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                    .map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { setProductId(p.id); setShowProductDropdown(false); setProductSearch(''); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${p.id === productId ? 'bg-blue-50 font-medium' : ''}`}
                      >
                        {p.name} (₹{p.price.toFixed(2)})
                      </button>
                    ))
                )}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flash price (₹)</label>
            <input
              type="number" min={0} step="0.01" value={salePrice}
              onChange={(e) => setSalePrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max claims</label>
            <input
              type="number" min={1} value={maxClaims}
              onChange={(e) => setMaxClaims(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goes live at</label>
            <input
              type="datetime-local" value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <p className="text-sm font-semibold text-gray-700 mb-1">After all claims are gone</p>
          <p className="text-xs text-gray-500 mb-3">
            Optional. Once all {maxClaims} claims are used up, the product can keep selling at a
            discount for everyone (no login/limit) until the end date/time below. Leave both blank
            to just go back to full price once sold out, like before.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
              <input
                type="number" min={1} max={99} value={afterSoldOutDiscountPercent}
                onChange={(e) => setAfterSoldOutDiscountPercent(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount ends at</label>
              <input
                type="datetime-local" value={afterSoldOutEndsAt}
                onChange={(e) => setAfterSoldOutEndsAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <p className="text-sm font-semibold text-gray-700 mb-1">Site-wide ad</p>
          <p className="text-xs text-gray-500 mb-3">
            Shown in the homepage top banner and floating corner card, alongside any other active
            promotions, as soon as this sale is enabled. Uploading an image here is optional — if
            you skip it, the product&apos;s own photo is used instead.
          </p>
          <div className="space-y-4">
            <ImageUploadField label="Ad image (optional — falls back to the product photo)" value={adImageUrl} onChange={setAdImageUrl} bucket="promotions" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad title</label>
              <input
                type="text" value={adTitle} onChange={(e) => setAdTitle(e.target.value)}
                placeholder={`Leave blank for "⚡ Flash Sale — ₹${salePrice}!"`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad caption</label>
              <input
                type="text" value={adCaption} onChange={(e) => setAdCaption(e.target.value)}
                placeholder={`Leave blank for "First ${maxClaims} orders only!"`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving || !productId}
          className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? 'Saving…' : flashSale ? 'Save Changes' : 'Create Flash Sale'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Leads ({leads.length})</h3>
          <p className="text-xs text-gray-500 mt-0.5">Everyone who clicked &quot;Claim&quot; — whether or not they completed the purchase.</p>
        </div>
        {leads.length === 0 ? (
          <p className="text-gray-500 text-center py-10 text-sm">No one has claimed interest yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 border-b">
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Phone</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((lead) => (
                <tr key={lead.user_id}>
                  <td className="px-4 py-2">{lead.name ?? '—'}</td>
                  <td className="px-4 py-2 text-gray-600">{lead.email ?? '—'}</td>
                  <td className="px-4 py-2 text-gray-600">{lead.phone ?? '—'}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      lead.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {lead.status === 'confirmed' ? 'Purchased' : 'Interested'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500 text-xs">{new Date(lead.created_at).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
