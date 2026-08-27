'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { X, Gift } from 'lucide-react';
import { AdSlide } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { handleAdSlideClick } from '@/lib/flashSale';

const DISMISSED_KEY = 'promo_card_dismissed';
const ROTATE_MS = 5000;
const FADE_MS = 300;

export default function PromotionCard({ slides = [], buy2Get1Enabled = true }: {
  slides?: AdSlide[]; buy2Get1Enabled?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const router = useRouter();
  const { addToCart } = useCartStore();

  useEffect(() => {
    if (slides.length === 0 && !buy2Get1Enabled) return; // nothing active to advertise
    if (sessionStorage.getItem(DISMISSED_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, [slides.length, buy2Get1Enabled]);

  // Cycle through multiple active slides while the card is up — same pattern as
  // the homepage banner rotator. A single slide (or none) just never advances.
  useEffect(() => {
    if (!visible || slides.length <= 1) return;
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % slides.length);
        setFading(false);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [visible, slides.length]);

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, 'true');
    setClosing(true);
    setTimeout(() => setVisible(false), 300);
  };

  const claimSlide = (s: AdSlide) => {
    dismiss();
    handleAdSlideClick(s, router, addToCart, (message) => toast.error(message));
  };

  const claimGeneric = () => {
    dismiss();
    router.push('/products');
  };

  if (!visible) return null;

  const slide = slides[index % slides.length] ?? null;

  return (
    <div
      className={`fixed bottom-24 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] max-w-[320px] transition-all duration-300 ${
        closing ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
      }`}
      role="complementary"
      aria-label="Promotional offer"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden relative">
        <button
          onClick={dismiss}
          aria-label="Dismiss offer"
          className="absolute top-2 right-2 z-10 bg-white/90 rounded-full w-7 h-7 flex items-center justify-center text-gray-500 hover:text-red-700 hover:bg-white transition-colors shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        <div className={`transition-opacity duration-300 ${fading ? 'opacity-0' : 'opacity-100'}`}>
          {slide ? (
            <>
              <button onClick={() => claimSlide(slide)} className="block w-full bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slide.image_url} alt={slide.title} className="w-full h-36 object-contain bg-white" />
              </button>
              <div className="p-4 pt-3">
                <p className="font-bold text-gray-900 leading-snug">{slide.title}</p>
                {slide.caption && <p className="text-sm text-gray-600 mt-0.5">{slide.caption}</p>}
                <button
                  onClick={() => claimSlide(slide)}
                  className="mt-3 w-full py-2.5 bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold rounded-full shadow hover:shadow-md transition-all active:scale-95"
                >
                  Grab the Offer
                </button>
              </div>
            </>
          ) : (
            <div className="p-4">
              <div className="flex items-center gap-2 text-red-600">
                <Gift className="w-5 h-5" />
                <p className="font-bold">Buy 2, Get 1 FREE!</p>
              </div>
              <p className="text-sm text-gray-600 mt-1">Limited time offer on all items.</p>
              <button
                onClick={claimGeneric}
                className="mt-3 w-full py-2.5 bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold rounded-full shadow hover:shadow-md transition-all active:scale-95"
              >
                Grab the Offer
              </button>
            </div>
          )}
        </div>

        {slides.length > 1 && (
          <div className="flex justify-center gap-1.5 pb-3">
            {slides.map((s, i) => (
              <button
                key={s.key}
                aria-label={`Show promotion ${i + 1} of ${slides.length}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-red-600' : 'w-1.5 bg-gray-300'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
