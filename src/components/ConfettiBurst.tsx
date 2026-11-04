'use client';

import { useEffect, useMemo } from 'react';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

interface Piece {
  id: number;
  left: number;
  color: string;
  width: number;
  height: number;
  delay: number;
  duration: number;
  rotation: number;
  drift: number;
}

// Self-contained (keyframes defined inline, not in globals.css) so this never depends on
// — or has to be kept in sync with — whatever shared theme tokens a given branch has.
export default function ConfettiBurst({ onDone, pieceCount = 90 }: { onDone?: () => void; pieceCount?: number }) {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: pieceCount }, (_, id) => ({
        id,
        left: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        width: 6 + Math.random() * 6,
        height: 10 + Math.random() * 8,
        delay: Math.random() * 0.35,
        duration: 1.8 + Math.random() * 1.2,
        rotation: 180 + Math.random() * 540,
        drift: (Math.random() - 0.5) * 160,
      })),
    [pieceCount]
  );

  useEffect(() => {
    const timer = setTimeout(() => onDone?.(), 3200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes confetti-burst-fall {
          0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) translateX(var(--confetti-drift)) rotate(var(--confetti-rot)); opacity: 0.9; }
        }
      `}</style>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={
            {
              position: 'absolute',
              top: 0,
              left: `${p.left}%`,
              width: p.width,
              height: p.height,
              backgroundColor: p.color,
              borderRadius: 2,
              animationName: 'confetti-burst-fall',
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              animationTimingFunction: 'ease-in',
              animationFillMode: 'forwards',
              '--confetti-drift': `${p.drift}px`,
              '--confetti-rot': `${p.rotation}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
