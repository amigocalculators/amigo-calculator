'use client';

import { useState, useEffect } from 'react';

function formatRemaining(ms: number): string {
  if (ms <= 0) return 'Starting now…';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return days > 0 ? `${days}d ${pad(hours)}h ${pad(minutes)}m` : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// Ticks down to `target` (an ISO timestamp) once per second, entirely client-side —
// used in place of a "Claim Offer" button for a flash sale that hasn't started yet.
export default function FlashCountdown({ target, className }: { target: string; className?: string }) {
  const [remaining, setRemaining] = useState(() => new Date(target).getTime() - Date.now());

  useEffect(() => {
    const timer = setInterval(() => setRemaining(new Date(target).getTime() - Date.now()), 1000);
    return () => clearInterval(timer);
  }, [target]);

  return <span className={className}>{formatRemaining(remaining)}</span>;
}
