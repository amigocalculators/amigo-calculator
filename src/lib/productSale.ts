import { Product } from '@/types';

// Per-product scheduled sale — any product can have its own %-off for a date range,
// independent of the single-campaign Flash Sale. Active whenever `now` falls inside
// [sale_starts_at, sale_ends_at] and a percent is set.
export function isProductSaleActive(product: Pick<Product, 'sale_enabled' | 'sale_percent' | 'sale_starts_at' | 'sale_ends_at'>): boolean {
  if (!product.sale_enabled || !product.sale_percent || !product.sale_starts_at || !product.sale_ends_at) return false;
  const now = Date.now();
  return new Date(product.sale_starts_at).getTime() <= now && now < new Date(product.sale_ends_at).getTime();
}

export function getProductSalePrice(product: Pick<Product, 'price' | 'sale_percent'>): number {
  // Rounded to the nearest whole rupee, not the nearest paisa.
  return Math.round(product.price * (1 - product.sale_percent! / 100));
}
