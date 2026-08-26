'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types';

interface Banner9Props {
  products: Product[];
  currentProductId?: number;
}

const Banner9 = ({ products, currentProductId }: Banner9Props) => {
  const router = useRouter();
  const filtered = products.filter((p) => p.id !== currentProductId);

  // Same slice on the server and the client's first render (no Math.random() here) so
  // hydration matches — the shuffle below only runs after mount, client-side only.
  const [relatedProducts, setRelatedProducts] = useState(() => filtered.slice(0, 4));

  useEffect(() => {
    setRelatedProducts([...filtered].sort(() => 0.5 - Math.random()).slice(0, 4));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProductId, products]);

  return (
    <div className="mb-4 py-6 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-700 mb-10 pl-4 border-l-4 border-gray-400">
          You May Also Like
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 gap-4">
          {relatedProducts.map((product: Product) => (
            <div
              key={product.id}
              className="bg-gray-200 rounded-xl overflow-hidden shadow-[5px_5px_15px_rgba(0,0,0,0.1),-5px_-5px_15px_rgba(255,255,255,0.8)] p-0 lg:p-4 transition-all duration-300 hover:shadow-[8px_8px_20px_rgba(0,0,0,0.12),-8px_-8px_20px_rgba(255,255,255,0.9)]"
            >
              <Link href={`/product/${product.id}`} className="rounded-lg overflow-hidden mb-2 h-48 sm:h-56 block relative">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="p-2">
                <Link href={`/product/${product.id}`}>
                  <h3 className="text-2xl font-semibold text-gray-700 mb-2 relative transition-all duration-300">
                    <span className="inline-block transition-transform duration-300">
                      {product.name}
                    </span>
                  </h3>
                </Link>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xl font-semibold text-gray-700">
                    ₹{product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => router.push(`/product/${product.id}`)}
                    className="bg-gray-100 text-gray-700 p-3 rounded-full shadow-[3px_3px_6px_rgba(0,0,0,0.1),-3px_-3px_6px_rgba(255,255,255,0.8)] hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] transition-all duration-300 flex items-center justify-center"
                    aria-label="Go to product page"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Banner9;
