import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';

interface CategoryTile {
  name: string;
  image: string;
  startingPrice: number;
  count: number;
}

// There's no categories table — categories are just the `category` column already on
// each product, so the grid is derived from whatever products were already fetched
// for the page rather than a second query.
function buildCategories(products: Product[]): CategoryTile[] {
  const map = new Map<string, CategoryTile>();
  for (const product of products) {
    const name = product.category?.trim();
    if (!name) continue;
    const existing = map.get(name);
    if (!existing) {
      map.set(name, { name, image: product.image, startingPrice: product.price, count: 1 });
    } else {
      existing.startingPrice = Math.min(existing.startingPrice, product.price);
      existing.count += 1;
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export default function CategoryGrid({ products }: { products: Product[] }) {
  const categories = buildCategories(products);
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-[95rem] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">Shop by Category</h2>
        <Link href="/products" className="text-sm font-semibold text-accent-600 hover:underline">
          View all Categories →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={`/products?category=${encodeURIComponent(category.name)}`}
            className="group overflow-hidden rounded-2xl bg-blush transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="relative aspect-square w-full">
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="bg-white p-4">
              <h3 className="font-bold text-ink">{category.name}</h3>
              <p className="text-sm text-ink-muted">Starting @₹{category.startingPrice.toFixed(0)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
