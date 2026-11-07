'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

const DISMISSED_KEY = 'diwali_gift_popup_dismissed';
const SHOW_DELAY_MS = 1500;
const CLOSE_ANIMATION_MS = 300;

// A one-off seasonal campaign popup (client-supplied pen gift image) — unlike the
// admin-configurable Promotions popup (PromotionCard), this is hardcoded since it's a
// single fixed announcement, not something that needs its own admin management UI.
// Stays dismissed for the rest of the browser session once closed, same as PromotionCard.
export default function DiwaliGiftPopup() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISSED_KEY)) return;
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, 'true');
    setClosing(true);
    setTimeout(() => setVisible(false), CLOSE_ANIMATION_MS);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        closing ? 'opacity-0' : 'opacity-100'
      } bg-black/60`}
      role="dialog"
      aria-modal="true"
      aria-label="Diwali offer"
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-gradient-to-b from-amber-50 to-white rounded-2xl shadow-2xl border-2 border-amber-400 w-full max-w-sm overflow-hidden transition-all duration-300 ease-out ${
          closing ? 'translate-y-6 opacity-0 scale-95' : 'translate-y-0 opacity-100 scale-100'
        }`}
      >
        <button
          onClick={dismiss}
          aria-label="Dismiss offer"
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 text-gray-500 hover:text-red-700 hover:bg-white transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-6 pt-8 pb-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Image/Banner/diwali-gift-pens.png"
            alt="Gift pens"
            className="w-32 h-32 object-contain mx-auto"
          />
          <p className="mt-3 text-xl font-extrabold text-gray-900">Diwali Special 🪔</p>
          <p className="mt-1 text-gray-700">Get a FREE Gift with Every Order!</p>
          <Link
            href="/products"
            onClick={dismiss}
            className="mt-5 inline-block w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-full shadow hover:shadow-md transition-all active:scale-95"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}
