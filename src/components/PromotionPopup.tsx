'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Promotion } from '@/types';

export default function PromotionPopup({ promotion, onClose }: { promotion: Promotion; onClose?: () => void }) {
  const [showPopup, setShowPopup] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(true), 700);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setShowPopup(false);
      setIsAnimatingOut(false);
      onClose?.();
    }, 400);
  };

  useEffect(() => {
    document.body.style.overflow = showPopup ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPopup]);

  if (!showPopup && !isAnimatingOut) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        isAnimatingOut ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="promotion-popup-title"
    >
      <div
        className={`bg-white rounded-3xl shadow-3xl max-w-md w-full relative overflow-hidden transform transition-all duration-400 ${
          isAnimatingOut ? 'scale-75 opacity-0' : 'scale-100 opacity-100 animate-popup-bounce'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 z-10 bg-white/90 rounded-full w-9 h-9 flex items-center justify-center text-gray-500 hover:text-red-700 text-2xl font-light leading-none transition-transform duration-200 hover:rotate-90"
          onClick={handleClose}
          aria-label="Close offer popup"
        >
          &times;
        </button>

        <button onClick={() => router.push('/products')} className="block w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={promotion.image_url} alt={promotion.title} className="w-full h-auto" />
        </button>

        <div className="p-6 pt-5 text-center">
          {promotion.caption && (
            <p id="promotion-popup-title" className="text-gray-700 text-sm mb-4">
              {promotion.caption}
            </p>
          )}
          <button
            onClick={() => router.push('/products')}
            className="px-10 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Grab the Offer Now!
          </button>
        </div>
      </div>
    </div>
  );
}
