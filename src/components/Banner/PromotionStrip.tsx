'use client';

import { useRouter } from 'next/navigation';
import { ShoppingBag, Gift } from 'lucide-react';
import { AdSlide } from '@/types';

export default function PromotionStrip({ slide }: { slide: AdSlide }) {
  const router = useRouter();
  return (
    <div className="h-full bg-gradient-to-r from-orange-500 to-green-600 text-white py-4 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="w-full flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center space-x-3 min-w-0">
          <Gift className="h-8 w-8 shrink-0 animate-bounce" />
          <div className="min-w-0">
            <h2 className="text-lg lg:text-xl font-bold truncate">{slide.title}</h2>
            {slide.caption && <p className="text-sm opacity-90 truncate">{slide.caption}</p>}
          </div>
        </div>
        <button
          onClick={() => router.push(slide.href)}
          className="shrink-0 bg-white text-green-700 px-4 sm:px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:inline">Claim Offer</span>
        </button>
      </div>
    </div>
  );
}
