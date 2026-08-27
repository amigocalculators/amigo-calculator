import Image from 'next/image';
import Banner9 from './Banner9';
import PromoCarousel, { Slide } from './PromoCarousel';
import { ShoppingBag, Truck, Shield, HeadphonesIcon as HeadphoneIcon } from 'lucide-react';
import { Product } from '@/types';

const HERO_SLIDES: Slide[] = [
  { desktopSrc: '/Image/Banner/Home1.jpg', mobileSrc: '/Image/Banner/CONCEPT-7.1.JPLL.jpg', alt: 'Amigo Calculator Banner' },
  { desktopSrc: '/Image/Banner/VD-1.jpg', alt: 'Amigo Plus Rakhi Offer — Scientific Calculator for ₹1', fit: 'contain' },
];

const Banner2 = ({ products }: { products: Product[] }) => {
  return (
    <>
      <div className="w-full pb-4">
        <PromoCarousel slides={HERO_SLIDES} />
      </div>

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

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12 lg:px-32 px-12">
        <div className="flex items-center gap-4 p-6 bg-blue-50 rounded-xl">
          <ShoppingBag className="w-10 h-10 text-blue-600" />
          <div>
            <h3 className="font-semibold">Free Shipping</h3>
            <p className="text-sm text-gray-600">On orders over ₹499</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6 bg-green-50 rounded-xl">
          <Truck className="w-10 h-10 text-green-600" />
          <div>
            <h3 className="font-semibold">Fast Delivery</h3>
            <p className="text-sm text-gray-600">Within 24-48 hours</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6 bg-purple-50 rounded-xl">
          <Shield className="w-10 h-10 text-purple-600" />
          <div>
            <h3 className="font-semibold">Secure Payment</h3>
            <p className="text-sm text-gray-600">100% secure checkout</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6 bg-orange-50 rounded-xl">
          <HeadphoneIcon className="w-10 h-10 text-orange-600" />
          <div>
            <h3 className="font-semibold">24/7 Support</h3>
            <p className="text-sm text-gray-600">Dedicated support</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Banner2;
