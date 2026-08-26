'use client';

import { useState, useEffect } from 'react';
import { AdSlide } from '@/types';
import PromotionStrip from './PromotionStrip';

const ROTATE_MS = 4000;
const FADE_MS = 300;

export default function PromotionStripRotator({ slides }: { slides: AdSlide[] }) {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % slides.length);
        setFading(false);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const current = slides[index % slides.length];

  return (
    <div className="relative h-full">
      <div className={`h-full transition-opacity duration-300 ${fading ? 'opacity-0' : 'opacity-100'}`}>
        <PromotionStrip slide={current} />
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.key}
              aria-label={`Show promotion ${i + 1} of ${slides.length}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
