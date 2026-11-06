'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Truck } from 'lucide-react';

export default function SiteSettingsManager({ initialFreeDeliveryEnabled }: { initialFreeDeliveryEnabled: boolean }) {
  const [freeDeliveryEnabled, setFreeDeliveryEnabled] = useState(initialFreeDeliveryEnabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleToggle = async () => {
    const next = !freeDeliveryEnabled;
    setSaving(true);
    setError('');
    const { error: updateError } = await supabase
      .from('site_settings')
      .update({ free_delivery_enabled: next, updated_at: new Date().toISOString() })
      .eq('id', 1);
    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }
    setFreeDeliveryEnabled(next);
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-green-50 h-fit"><Truck className="w-5 h-5 text-green-600" /></div>
          <div>
            <h2 className="font-semibold text-gray-900">Free Delivery</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              When on, the cart drawer and the cart/checkout pages all show a &quot;Delivery: FREE&quot; line in the order total. Turn it off if you ever start charging for shipping — the line disappears everywhere at once.
            </p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={saving}
          role="switch"
          aria-checked={freeDeliveryEnabled}
          className={`shrink-0 w-12 h-7 rounded-full transition-colors relative disabled:opacity-60 ${freeDeliveryEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${freeDeliveryEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </div>
  );
}
