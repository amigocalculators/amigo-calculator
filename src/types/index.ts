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
