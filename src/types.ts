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

export interface LogoPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LogoState extends LogoPosition {
  constraintArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

