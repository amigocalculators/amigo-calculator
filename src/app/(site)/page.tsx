import { createAdminClient } from '@/lib/supabase/server';
import Banner2 from '@/components/Banner/Banner2';
import Banner10 from '@/components/Banner/Banner10';
import PromotionStripRotator from '@/components/Banner/PromotionStripRotator';
import PopupWrapper from '@/components/PopupWrapper';
import { AdSlide, FlashSale } from '@/types';

// Cache this page instead of hitting Supabase on every single visit — admin changes
// (new promotion, product edit) show up within this window rather than instantly.
export const revalidate = 30;

export default async function Home() {
  const supabase = createAdminClient();
  const [{ data }, { data: promoData }, { data: settings }, { data: flashSaleRow }] = await Promise.all([
    supabase.from('products').select('*').order('id', { ascending: true }),
    supabase.from('promotions').select('*').eq('active', true).order('created_at', { ascending: false }),
    supabase.from('site_settings').select('buy2get1_enabled').eq('id', 1).single(),
    supabase.from('flash_sales').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);
  const products = (data ?? []).map((p) => ({ ...p, inStock: p.in_stock }));
  const activePromotions = promoData ?? [];
  const buy2Get1Enabled = settings?.buy2get1_enabled ?? true;
  const flashSale = (flashSaleRow as FlashSale | null) ?? null;

  const promotionSlides: AdSlide[] = activePromotions.map((p) => ({
    key: `promo-${p.id}`,
    title: p.title,
    caption: p.caption,
    image_url: p.image_url,
    href: '/products',
  }));

  // Advertised site-wide once it's actually live — the uploaded ad image is optional
  // custom artwork; if there isn't one, the product's own photo is used instead so the
  // sale is never silently left out of the rotation.
  const flashProduct = flashSale ? products.find((p) => p.id === flashSale.product_id) : null;
  const flashNotStartedYet = !!flashSale?.enabled && !!flashProduct && new Date(flashSale.starts_at) > new Date();
  const flashIsLive = !!flashSale?.enabled
    && !!flashProduct
    && new Date(flashSale.starts_at) <= new Date()
    && flashSale.claimed_count < flashSale.max_claims;
  const flashSlide: AdSlide | null = flashIsLive || flashNotStartedYet
    ? {
        key: `flash-${flashSale!.id}`,
        title: flashSale!.ad_title?.trim() || `⚡ Flash Sale — ₹${flashSale!.sale_price}!`,
        caption: flashSale!.ad_caption?.trim() || `First ${flashSale!.max_claims} orders only!`,
        image_url: flashSale!.ad_image_url || flashProduct!.image,
        href: `/product/${flashSale!.product_id}`,
        // Only claimable once actually live — while "coming soon" this stays unset so the
        // slide shows a countdown instead of a claim button (see flashStartsAt below).
        flashProduct: flashIsLive ? flashProduct! : undefined,
        flashStartsAt: flashNotStartedYet ? flashSale!.starts_at : undefined,
      }
    : null;

  // Flash sale ad takes priority — it's the most time-sensitive thing worth showing first.
  const slides: AdSlide[] = [...(flashSlide ? [flashSlide] : []), ...promotionSlides];

  return (
    <div className="pt-16 bg-[#f0efef]">
      <div className="max-w-[95rem] mx-auto">
        {slides.length > 0 && buy2Get1Enabled ? (
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2">
              <Banner10 />
            </div>
            <div className="md:w-1/2">
              <PromotionStripRotator slides={slides} />
            </div>
          </div>
        ) : slides.length > 0 ? (
          <PromotionStripRotator slides={slides} />
        ) : buy2Get1Enabled ? (
          <Banner10 />
        ) : null}
        <Banner2 products={products} />
        <PopupWrapper slides={slides} buy2Get1Enabled={buy2Get1Enabled} />
      </div>
    </div>
  );
}
