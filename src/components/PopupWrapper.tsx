'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Promotion } from '@/types';

const Popup = dynamic(() => import('./Popup'), { ssr: false });
const PromotionPopup = dynamic(() => import('./PromotionPopup'), { ssr: false });

export default function PopupWrapper({ promotion }: { promotion?: Promotion | null }) {
  const [promoClosed, setPromoClosed] = useState(false);

  // Show the active promotion's popup first; once dismissed, fall back to the evergreen offer popup.
  if (promotion && !promoClosed) {
    return <PromotionPopup promotion={promotion} onClose={() => setPromoClosed(true)} />;
  }
  return <Popup />;
}
