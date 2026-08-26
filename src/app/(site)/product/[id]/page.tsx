import { createAdminClient, getAuthorizedUser } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import { FlashSale } from '@/types';

type Props = { params: Promise<{ id: string }> };

// Cache this page instead of hitting Supabase twice on every single visit.
export const revalidate = 60;

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

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
      flashSale={flashSale}
      flashAlreadyClaimed={alreadyClaimed}
    />
  );
}
