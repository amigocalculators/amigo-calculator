import type { Metadata } from 'next';
import { createAdminClient, getAuthorizedUser } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import { FlashSale, ProductPromotion } from '@/types';

type Props = { params: Promise<{ id: string }> };

// Cache this page instead of hitting Supabase twice on every single visit.
export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amigocalculator.com';

// Duplicates the products fetch below by id, but Next's fetch deduping collapses
// the two calls into one request per render pass — this is the standard pattern
// for a page that needs the same data in both generateMetadata and the component.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('products')
    .select('name, description, image')
    .eq('id', Number(id))
    .single();

  if (!data) return { title: 'Product Not Found' };

  const description = data.description?.trim()
    ? data.description.slice(0, 160)
    : `Buy ${data.name} online from Amigo Calculators — quality, precision, and durability, made in India.`;

  return {
    title: data.name,
    description,
    alternates: { canonical: `/product/${id}` },
    openGraph: {
      title: data.name,
      description,
      images: data.image ? [{ url: data.image }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', Number(id))
    .single();

  if (error || !data) notFound();

  const product = { ...data, inStock: data.in_stock };

  const { data: relatedData } = await supabase
    .from('products')
    .select('*')
    .neq('id', Number(id))
    .limit(4);

  const relatedProducts = (relatedData ?? []).map((p) => ({ ...p, inStock: p.in_stock }));

  // Only relevant if this specific product is the one currently on flash sale — the raw
  // starts_at/enabled/claimed_count are passed down as-is (not a pre-computed "isLive"
  // boolean) so the client can evaluate liveness against Date.now() itself, immune to
  // this page's 60s ISR cache window.
  const { data: flashSaleRow } = await supabase
    .from('flash_sales')
    .select('*')
    .eq('product_id', Number(id))
    .maybeSingle();
  const flashSale = (flashSaleRow as FlashSale | null) ?? null;

  // Unfiltered, same philosophy as the flash_sales fetch above — the client resolves
  // scheduled/live/ended against Date.now() itself, immune to this page's ISR window.
  // Includes "All Products" rows (product_ids IS NULL) alongside ones naming this product.
  const { data: productPromotionRows } = await supabase
    .from('product_promotions')
    .select('*')
    .or(`product_ids.cs.{${Number(id)}},product_ids.is.null`);
  const productPromotions = (productPromotionRows as ProductPromotion[] | null) ?? [];

  let alreadyClaimed = false;
  if (flashSale) {
    const user = await getAuthorizedUser();
    if (user) {
      const { data: claim } = await supabase
        .from('flash_sale_claims')
        .select('status')
        .eq('flash_sale_id', flashSale.id)
        .eq('user_id', user.id)
        .maybeSingle();
      alreadyClaimed = claim?.status === 'confirmed';
    }
  }

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image ? [product.image] : undefined,
    sku: String(product.id),
    brand: { '@type': 'Brand', name: 'Amigo' },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/product/${id}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    ...(product.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviews && product.reviews > 0 ? product.reviews : 1,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
        flashSale={flashSale}
        flashAlreadyClaimed={alreadyClaimed}
        productPromotions={productPromotions}
      />
    </>
  );
}
