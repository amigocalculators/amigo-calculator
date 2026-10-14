'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { useCartStore } from '@/store/cartStore';

interface Banner9Props {
  products: Product[];
  currentProductId?: number;
}

const Banner9 = ({ products, currentProductId }: Banner9Props) => {
  const { addToCart } = useCartStore();
  const filtered = products.filter((p) => p.id !== currentProductId);

  // Same slice on the server and the client's first render (no Math.random() here) so
  // hydration matches — the shuffle below only runs after mount, client-side only.
  const [relatedProducts, setRelatedProducts] = useState(() => filtered.slice(0, 4));

  useEffect(() => {
    setRelatedProducts([...filtered].sort(() => 0.5 - Math.random()).slice(0, 4));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProductId, products]);

  if (relatedProducts.length === 0) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="mb-8 border-l-4 border-accent-500 pl-4 text-2xl font-bold text-ink">
        You May Also Like
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {relatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            price={{
              current: product.price,
              original: product.prevprice !== product.price ? product.prevprice : undefined,
            }}
            addToCartDisabled={product.inStock === false}
            onAddToCart={() => {
              addToCart(product);
              toast.success(`${product.name} added to cart`);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner9;
