import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

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

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
