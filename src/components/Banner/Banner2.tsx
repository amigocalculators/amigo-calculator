import Image from 'next/image';
import Banner9 from './Banner9';
import PromoCarousel, { Slide } from './PromoCarousel';
import TrustBadges from '@/components/TrustBadges';
import CategoryGrid from '@/components/CategoryGrid';
import { Product } from '@/types';

const HERO_SLIDES: Slide[] = [
  { desktopSrc: '/Image/Banner/OFF-2.jpg', alt: 'Amigo Calculators', fit: 'contain' },
  { desktopSrc: '/Image/Banner/Home1.jpg', alt: 'Amigo Calculators', fit: 'cover' },
  { desktopSrc: '/Image/Banner/VD-1.jpg', alt: 'Amigo Calculators Offer', fit: 'contain' },
];

const Banner2 = ({ products }: { products: Product[] }) => {
  return (
    <>
      <PromoCarousel slides={HERO_SLIDES} />

      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <TrustBadges />
      </div>

      <CategoryGrid products={products} />

      <Banner9 products={products} />

      <div className="w-full pb-4">
        {/* Desktop Banner */}
        <div className="hidden md:block w-full h-[600px] relative">
          <Image
            src="/Image/Banner/Home2.jpg"
            alt="Amigo Calculator Desktop Banner"
            fill
            className="object-cover"
          />
        </div>
        {/* Mobile Banner */}
        <div className="block md:hidden w-full h-[300px] relative">
          <Image
            src="/Image/Banner/BANNER BM1.JPLL.jpg"
            alt="Amigo Calculator Mobile Banner"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </>
  );
};

export default Banner2;
