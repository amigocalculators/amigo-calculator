export interface RatableProduct {
  dummy_rating?: number | string | null;
  dummy_rating_count?: number | null;
  dummy_top_rated?: boolean | null;
  real_rating_avg?: number | string | null;
  real_rating_count?: number | null;
  real_top_rated?: boolean | null;
}

export interface RatingBadge {
  avg: number;
  count: number;
  // Whether to show the "Top Rated" pill alongside the star+count. Dummy phase: set
  // by hand per product in the admin panel. Real phase: automatic, top 5 by average --
  // see supabase/migration_021_product_top_rated_flag.sql.
  isTopRated: boolean;
}

// A product shows its real average the moment it earns its first genuine rating and
// stays on real ratings from then on; until that happens it shows the admin-set
// placeholder. The switch is automatic and per-product -- see
// supabase/migration_020_product_ratings.sql.
export function getRatingBadge(product: RatableProduct): RatingBadge | null {
  if (product.real_rating_count && product.real_rating_avg != null) {
    return {
      avg: Number(product.real_rating_avg),
      count: Number(product.real_rating_count),
      isTopRated: !!product.real_top_rated,
    };
  }
  if (product.dummy_rating != null && product.dummy_rating_count != null) {
    return {
      avg: Number(product.dummy_rating),
      count: Number(product.dummy_rating_count),
      isTopRated: !!product.dummy_top_rated,
    };
  }
  return null;
}
