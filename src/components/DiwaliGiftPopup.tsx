'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Gift } from 'lucide-react';
import ConfettiBurst from '@/components/ConfettiBurst';

const AUTO_SHOWN_KEY = 'diwali_gift_popup_auto_shown';
const SHOW_DELAY_MS = 1500;
const CLOSE_ANIMATION_MS = 300;
const RING_TEXT = '✦ FREE GIFT ✦ DIWALI SPECIAL ✦ FREE GIFT ✦ DIWALI SPECIAL ';

// A one-off seasonal campaign (client-supplied pen gift image) — unlike the
// admin-configurable Promotions popup (PromotionCard), this is hardcoded since it's a
// single fixed announcement, not something that needs its own admin management UI.
//
// The full offer card still auto-opens once per session, but closing it no longer
// dismisses the campaign for the session — it just closes the card. A persistent,
// continuously-spinning gift badge stays fixed in the bottom-left corner the whole
// visit (never auto-hides), so the offer stays visible and reachable at any time;
// clicking the badge reopens the full card.
export default function DiwaliGiftPopup() {
  const [modalOpen, setModalOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  // Fires every time the card opens (first auto-show or a later badge click) — not a
  // one-shot, since the badge can reopen this any number of times during the visit.
  const openModal = () => {
    setModalOpen(true);
    setConfettiKey((k) => k + 1);
    setShowConfetti(true);
  };

  useEffect(() => {
    if (sessionStorage.getItem(AUTO_SHOWN_KEY)) return;
    const timer = setTimeout(() => {
      sessionStorage.setItem(AUTO_SHOWN_KEY, 'true');
      openModal();
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const closeModal = () => {
    setClosing(true);
    setTimeout(() => {
      setModalOpen(false);
      setClosing(false);
    }, CLOSE_ANIMATION_MS);
  };

  return (
    <>
      {showConfetti && <ConfettiBurst key={confettiKey} onDone={() => setShowConfetti(false)} />}

      <button
        onClick={openModal}
        aria-label="Diwali free gift offer"
        className="fixed left-4 sm:left-6 bottom-6 z-40 w-20 h-20 sm:w-24 sm:h-24 group"
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_9s_linear_infinite] drop-shadow-lg">
          <defs>
            <path id="diwaliBadgeRing" d="M 50,50 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0" />
            <linearGradient id="diwaliRingBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#9a3412" />
            </linearGradient>
          </defs>
          {/* Solid backing disc so the ring text stays legible over any page
              background (white sections, photos, banners) instead of relying on
              whatever happens to be behind the badge. */}
          <circle cx="50" cy="50" r="48" fill="url(#diwaliRingBg)" />
          <text fontSize="9" fontWeight="700" fill="#fff" letterSpacing="1">
            <textPath href="#diwaliBadgeRing" startOffset="0%">
              {RING_TEXT}
            </textPath>
          </text>
        </svg>
        <span className="absolute inset-[14%] rounded-full bg-gradient-to-br from-amber-500 to-orange-600 border-2 border-amber-200 shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform">
          <Gift className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </span>
      </button>

      {modalOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
            closing ? 'opacity-0' : 'opacity-100'
          } bg-black/60`}
          role="dialog"
          aria-modal="true"
          aria-label="Diwali offer"
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative bg-gradient-to-b from-amber-50 to-white rounded-2xl shadow-2xl border-2 border-amber-400 w-full max-w-sm overflow-hidden transition-all duration-300 ease-out ${
              closing ? 'translate-y-6 opacity-0 scale-95' : 'translate-y-0 opacity-100 scale-100'
            }`}
          >
            <button
              onClick={closeModal}
              aria-label="Dismiss offer"
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 text-gray-500 hover:text-red-700 hover:bg-white transition-colors shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="px-6 pt-8 pb-6 text-center">
              <style>{`
                @keyframes diwali-pop {
                  0% { transform: scale(0.4) rotate(-6deg); opacity: 0; }
                  60% { transform: scale(1.15) rotate(2deg); opacity: 1; }
                  100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }
              `}</style>
              <p
                className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent"
                style={{ animation: 'diwali-pop 0.6s ease-out' }}
              >
                ✨ Happy Diwali! ✨
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Image/Banner/diwali-gift-pens.png"
                alt="Gift pens"
                className="w-32 h-32 object-contain mx-auto"
              />
              <p className="mt-3 text-xl font-extrabold text-gray-900">Diwali Special: Assured Free Gift!</p>
              <Link
                href="/products"
                onClick={closeModal}
                className="mt-5 inline-block w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-full shadow hover:shadow-md transition-all active:scale-95"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
