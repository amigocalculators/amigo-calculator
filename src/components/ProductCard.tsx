'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingBag } from 'lucide-react';
import type { Product } from '@/types';
import FlashCountdown from '@/components/FlashCountdown';

export type ProductBadgeTone = 'wine' | 'gold' | 'gray' | 'green';

const badgeToneClasses: Record<ProductBadgeTone, string> = {
  wine: 'bg-badge text-white',
  gold: 'bg-accent-500 text-ink',
  gray: 'bg-ink/80 text-white',
  green: 'bg-emerald-600 text-white',
};

export interface ProductBadgeProps {
  label: string;
  tone?: ProductBadgeTone;
  countdownTarget?: string;
  className?: string;
}

// Shared pill used for discount/flash/promo callouts on both product cards and the
// PDP main image — keeps every "X% OFF" / "Flash Sale" / countdown badge on the site
// looking like one system instead of each page inventing its own.
export function ProductBadge({ label, tone = 'wine', countdownTarget, className = '' }: ProductBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${badgeToneClasses[tone]} ${className}`}>
      {label}
      {countdownTarget && <FlashCountdown target={countdownTarget} />}
    </span>
  );
}

export interface ProductCardProps {
  product: Pick<Product, 'id' | 'name' | 'image' | 'rating' | 'reviews' | 'inStock'>;
  price: { current: number; original?: number };
  badge?: ProductBadgeProps;
  footnote?: React.ReactNode;
  onAddToCart: () => void;
  addToCartDisabled?: boolean;
  addToCartLabel?: string;
  href?: string;
}

// The one product-card implementation for the whole site (homepage grid, listing
// page, PDP related-products) — these used to be three independently hand-rolled
// cards that had already drifted into different visual styles.
export default function ProductCard({
  product,
  price,
  badge,
  footnote,
  onAddToCart,
  addToCartDisabled = false,
  addToCartLabel,
  href,
}: ProductCardProps) {
  const link = href ?? `/product/${product.id}`;
  const rating = product.rating ? parseFloat(product.rating) : NaN;
  const hasRating = !Number.isNaN(rating);
  const outOfStock = product.inStock === false;

  return (
    <div className="group overflow-hidden rounded-2xl border border-border-soft bg-blush/40 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={link} className="relative block">
        <div className="relative aspect-square w-full bg-white">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`object-contain p-4 transition-transform duration-500 group-hover:scale-105 ${outOfStock ? 'opacity-50' : ''}`}
          />
        </div>
        {badge && <ProductBadge {...badge} className="absolute left-3 top-3" />}
        {outOfStock && (
          <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold text-white">
            Out of Stock
          </span>
        )}
      </Link>

      <div className="space-y-2 p-4">
        {hasRating && (
          <div className="flex items-center gap-1 text-xs text-ink-muted">
            <Star className="h-3.5 w-3.5 fill-accent-500 text-accent-500" />
            <span className="font-semibold text-ink">{rating.toFixed(1)}</span>
            {typeof product.reviews === 'number' && <span>({product.reviews})</span>}
          </div>
        )}

        <Link href={link}>
          <h3 className="line-clamp-1 font-bold text-ink transition-colors group-hover:text-accent-600">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-baseline gap-1.5">
            {price.original && price.original > price.current && (
              <del className="text-sm text-ink-muted">₹{price.original.toFixed(2)}</del>
            )}
            <span className="text-lg font-bold text-ink">₹{price.current.toFixed(2)}</span>
          </div>
          <button
            onClick={onAddToCart}
            disabled={addToCartDisabled}
            aria-label={addToCartLabel ?? 'Add to cart'}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
              addToCartDisabled
                ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                : 'bg-accent-500 text-ink shadow-sm hover:bg-accent-600 hover:shadow-md'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
        {footnote && <div className="text-xs text-ink-muted">{footnote}</div>}
      </div>
    </div>
  );
}
