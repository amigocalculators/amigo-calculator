'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type Slide = { desktopSrc: string; mobileSrc?: string; alt: string; href?: string; fit?: 'cover' | 'contain' };

const AUTO_SCROLL_MS = 4000;

const PromoCarousel = ({ slides }: { slides: Slide[] }) => {
  const n = slides.length;
  const looping = n > 1;
  // Clone the last slide before the first, and the first slide after the last,
  // so the strip can always animate in one direction — no reverse snap-back.
  const extended = looping ? [slides[n - 1], ...slides, slides[0]] : slides;

  const [position, setPosition] = useState(looping ? 1 : 0);
  const [withTransition, setWithTransition] = useState(true);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const step = useCallback((dir: 1 | -1) => {
    setWithTransition(true);
    setPosition((p) => p + dir);
  }, []);

  useEffect(() => {
    if (paused || !looping) return;
    const timer = setInterval(() => step(1), AUTO_SCROLL_MS);
    return () => clearInterval(timer);
  }, [paused, looping, step]);

  const handleTransitionEnd = () => {
    if (!looping) return;
    if (position === extended.length - 1) {
      setWithTransition(false);
      setPosition(1);
    } else if (position === 0) {
      setWithTransition(false);
      setPosition(n);
    }
  };

  // After an instant (transition-less) jump back to the real slide, re-enable
  // the transition on the next frame so the *next* step animates again.
  useEffect(() => {
    if (!withTransition) {
      const id = requestAnimationFrame(() => setWithTransition(true));
      return () => cancelAnimationFrame(id);
    }
  }, [withTransition]);

  const activeDot = looping ? ((position - 1) % n + n) % n : 0;

  const goToDot = (i: number) => {
    setWithTransition(true);
    setPosition(looping ? i + 1 : i);
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (delta > 50) step(-1);
        else if (delta < -50) step(1);
        touchStartX.current = null;
      }}
    >
      <div
        className={`flex ${withTransition ? 'transition-transform duration-700 ease-out' : ''}`}
        style={{ transform: `translateX(-${position * 100}%)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {extended.map((slide, i) => {
          const isPriority = looping ? i >= 1 && i <= n : i === 0;
          return (
            <a key={`${slide.desktopSrc}-${i}`} href={slide.href} className="w-full shrink-0">
              {/* Desktop */}
              <div className="hidden md:block w-full h-[500px] relative overflow-hidden bg-black">
                {slide.fit === 'contain' && (
                  <Image
                    src={slide.desktopSrc}
                    alt=""
                    aria-hidden
                    fill
                    sizes="100vw"
                    className="object-cover blur-2xl scale-110 opacity-60"
                  />
                )}
                <Image
                  src={slide.desktopSrc}
                  alt={slide.alt}
                  fill
                  sizes="100vw"
                  className={`relative ${slide.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
                  priority={isPriority}
                />
              </div>
              {/* Mobile */}
              <div className="block md:hidden w-full h-[300px] relative overflow-hidden bg-black">
                {slide.fit === 'contain' && (
                  <Image
                    src={slide.mobileSrc ?? slide.desktopSrc}
                    alt=""
                    aria-hidden
                    fill
                    sizes="100vw"
                    className="object-cover blur-2xl scale-110 opacity-60"
                  />
                )}
                <Image
                  src={slide.mobileSrc ?? slide.desktopSrc}
                  alt={slide.alt}
                  fill
                  sizes="100vw"
                  className={`relative ${slide.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
                  priority={isPriority}
                />
              </div>
            </a>
          );
        })}
      </div>

      {looping && (
        <>
          <button
            aria-label="Previous slide"
            onClick={() => step(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full w-9 h-9 flex items-center justify-center shadow"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            aria-label="Next slide"
            onClick={() => step(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full w-9 h-9 flex items-center justify-center shadow"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.desktopSrc}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goToDot(i)}
                className={`h-2 rounded-full transition-all ${i === activeDot ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PromoCarousel;
