export interface Product {
  id: number;
  name: string;
  price: number;
  prevprice: number;
  images?: string[];
  image: string;
  description: string;
  category?: string;
  rating?: string;
  reviews?: number;
  inStock?: boolean;
  features?: string[];
  specifications?: {
    [key: string]: string;
  };
  warranty?: string;
  highlights?: string[];
  // Admin-editable placeholder rating shown until the product earns its first real
  // one. See src/lib/productRating.ts and supabase/migration_020_product_ratings.sql.
  dummy_rating?: number | string | null;
  dummy_rating_count?: number | null;
  // Admin-editable while in the dummy phase; see migration_021_product_top_rated_flag.sql.
  dummy_top_rated?: boolean;
  // Computed from product_ratings by a DB trigger -- never written directly.
  real_rating_avg?: number | string | null;
  real_rating_count?: number;
  // Computed by the same trigger (top 5 by real rating) -- never written directly.
  real_top_rated?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Banner {
  id: number;
  image: string;
  title: string;
  description: string;
  cta: string;
  backgroundColor: string;
  textColor: string;
}

export interface Exhibition {
  id: number;
  name: string;
  location: string;
  dates: string;
  venue: string;
  image: string;
  description: string;
  year: number;
  stats?: {
    visitors: number;
    products: number;
    deals: number;
  };
}

export interface GalleryImage {
  url: string;
  alt: string;
  location?: string;
  year?: number;
  id?: number;
}

export interface Promotion {
  id: number;
  title: string;
  image_url: string;
  caption: string | null;
  active: boolean;
  free_gift_name: string | null;
  free_gift_image: string | null;
  free_gift_value: number | null;
  free_gift_per_unit: boolean;
  instagram_posted: boolean;
  instagram_post_id: string | null;
  instagram_permalink: string | null;
  instagram_posted_at: string | null;
  created_at: string;
}

// A per-product offer configured from the admin Promotions tab: a discount percentage,
// a buy-X-get-Y rule, or both, active over [starts_at, ends_at). A product can have many
// of these over time (e.g. different campaigns on different date ranges). product_ids is
// null for an "All Products" promotion that applies to the whole catalog at once, or a
// list of one or more specific product ids it's scoped to.
export interface ProductPromotion {
  id: number;
  product_ids: number[] | null;
  discount_percent: number | null;
  buy_qty: number | null;
  get_qty: number | null;
  // Only meaningful when buy_qty/get_qty are set and the promotion covers more than one
  // product: true counts only repeat purchases of the same product toward the buy/get
  // total; false pools quantity across every product the promotion covers.
  same_product_only: boolean;
  starts_at: string;
  ends_at: string;
  enabled: boolean;
  created_at: string;
}

// A cart-level coupon, configured from the admin Coupons tab and typed in at checkout.
// Unlike ProductPromotion/Promotion, these are looked up by code (never publicly listed)
// — see getCouponByCode in src/lib/couponCodes.ts.
export interface CouponCode {
  id: number;
  code: string;
  discount_type: 'flat' | 'percentage';
  discount_value: number;
  min_cart_total: number;
  // If false, this coupon is rejected when the cart already has a flash-sale discount,
  // a product promotion discount, a selected free gift, or an auto-apply tier active.
  combinable_with_other_offers: boolean;
  // When true, this row is a tier (e.g. "spend ₹699, get 10% off") — applied
  // automatically once the cart subtotal crosses min_cart_total, no code typed. Shown in
  // the cart drawer's progress bar instead of the Available Coupons carousel. Always
  // applies regardless of combinable_with_other_offers (that flag only governs whether a
  // manually-typed coupon can stack with a tier, not the reverse).
  auto_apply: boolean;
  active: boolean;
  starts_at: string;
  ends_at: string;
  created_at: string;
}

export interface FlashSale {
  id: number;
  product_id: number;
  sale_price: number;
  max_claims: number;
  claimed_count: number;
  starts_at: string;
  enabled: boolean;
  ad_image_url: string | null;
  ad_title: string | null;
  ad_caption: string | null;
  coming_soon_message: string | null;
  after_sold_out_discount_percent: number | null;
  after_sold_out_ends_at: string | null;
  created_at: string;
}

// A single promotional slide shown in the homepage top banner and floating corner
// card — regular promotions and the flash sale's site-wide ad both get adapted into
// this common shape so those two placements don't need to know which is which.
export interface AdSlide {
  key: string;
  title: string;
  caption: string | null;
  image_url: string;
  href: string;
  // Set only for a flash sale that hasn't started yet — when present, the CTA button
  // is replaced with a live countdown to this timestamp instead of a claim action.
  flashStartsAt?: string;
  // Set only for the flash-sale slide — when present, clicking the CTA claims + adds
  // this exact product to the cart and jumps straight to checkout, instead of just
  // navigating to `href` like a regular promotion does.
  flashProduct?: Product;
}

// Singleton sitewide settings row (always id=1) — see supabase/migration_019_site_settings.sql.
export interface SiteSettings {
  id: number;
  free_delivery_enabled: boolean;
  updated_at: string;
}

export interface FlashSaleClaim {
  id: number;
  flash_sale_id: number;
  user_id: string;
  status: 'interested' | 'confirmed';
  order_id: string | null;
  created_at: string;
  confirmed_at: string | null;
}
