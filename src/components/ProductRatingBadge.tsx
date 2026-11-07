import { Star } from 'lucide-react';
import { getRatingBadge, RatableProduct } from '@/lib/productRating';

// Renders nothing if the product has no rating at all yet (e.g. it predates
// migration_020 and hasn't been backfilled). The star+count pill shows for every
// rated product; the "Top Rated" pill only shows when isTopRated is set -- see
// getRatingBadge. Positioning is left to the caller via `className`.
export default function ProductRatingBadge({ product, className = '' }: { product: RatableProduct; className?: string }) {
  const badge = getRatingBadge(product);
  if (!badge) return null;

  return (
    <div className={`flex flex-col items-start gap-1 pointer-events-none ${className}`}>
      {badge.isTopRated && (
        <span className="bg-rose-400 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
          Top Rated
        </span>
      )}
      <span className="flex items-center gap-1 bg-white border border-gray-200 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        <span className="text-gray-900">{badge.avg.toFixed(2)}</span>
        <span className="text-gray-400 font-normal">({badge.count})</span>
      </span>
    </div>
  );
}
