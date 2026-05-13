'use client';

import { useRouter } from 'next/navigation';
import { ShoppingBag, Gift } from 'lucide-react';

const Banner10 = () => {
  const router = useRouter();
  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="container mx-auto flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-4">
          <Gift className="h-8 w-8 animate-bounce" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Buy 2 Get 1 FREE!</h2>
            <p className="text-sm md:text-base opacity-90">Limited time offer on all items</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/products')}
          className="bg-white text-purple-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:inline">Claim Offer</span>
        </button>
      </div>
    </div>
  );
};

export default Banner10;
