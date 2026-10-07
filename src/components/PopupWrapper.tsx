'use client';

import dynamic from 'next/dynamic';
import { AdSlide } from '@/types';

const PromotionCard = dynamic(() => import('./PromotionCard'), { ssr: false });

export default function PopupWrapper({ slides = [] }: { slides?: AdSlide[] }) {
  return <PromotionCard slides={slides} />;
}
