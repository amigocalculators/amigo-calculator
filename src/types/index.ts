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

export interface SiteSettings {
  buy2get1_enabled: boolean;
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
  // Set only for the flash-sale slide — when present, clicking the CTA claims + adds
  // this exact product to the cart and jumps straight to checkout, instead of just
  // navigating to `href` like a regular promotion does.
  flashProduct?: Product;
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
