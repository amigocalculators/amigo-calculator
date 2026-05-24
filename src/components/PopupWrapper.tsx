'use client';

import dynamic from 'next/dynamic';

const Popup = dynamic(() => import('./Popup'), { ssr: false });

export default function PopupWrapper() {
  return <Popup />;
}
