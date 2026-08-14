import Link from 'next/link';
import { Promotion } from '@/types';

export default function PromotionBanner({ promotion }: { promotion: Promotion }) {
  return (
    <Link href="/products" className="block relative w-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={promotion.image_url} alt={promotion.title} className="w-full h-auto object-cover" />
      {promotion.caption && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent text-white p-4 text-center">
          <p className="text-sm md:text-base font-medium">{promotion.caption}</p>
        </div>
      )}
    </Link>
  );
}
