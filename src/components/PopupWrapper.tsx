'use client';

import dynamic from 'next/dynamic';
import { AdSlide } from '@/types';

const PromotionCard = dynamic(() => import('./PromotionCard'), { ssr: false });

export default function PopupWrapper({ slides = [], buy2Get1Enabled = true }: {
  slides?: AdSlide[]; buy2Get1Enabled?: boolean;
}) {
  return <PromotionCard slides={slides} buy2Get1Enabled={buy2Get1Enabled} />;
}
