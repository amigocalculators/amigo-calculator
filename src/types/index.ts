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
