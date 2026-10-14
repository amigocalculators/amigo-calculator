'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Menu, X, User, Search, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { createClient } from '@/lib/supabase/client';
import { PRODUCT_CATEGORIES } from '@/data/categories';
import LoginModal from '@/components/LoginModal';

const NAV_LINKS = [
  { href: '/event', label: 'Event' },
  { href: '/bulk-orders', label: 'Bulk Orders' },
  { href: '/about', label: 'About Us' },
];

const Navbar = () => {
  const router = useRouter();
  const { cart } = useCartStore();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [categoriesOpen, setCategoriesOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [loginOpen, setLoginOpen] = React.useState(false);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border-soft bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- matches existing logo usage elsewhere in the codebase */}
          <img src="/LOGO1.png" className="h-9" alt="Amigo Calculators" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-7 md:flex">
          <div
            className="relative"
            onMouseEnter={() => setCategoriesOpen(true)}
            onMouseLeave={() => setCategoriesOpen(false)}
          >
            <Link href="/products" className="flex items-center gap-1 font-medium text-ink hover:text-accent-600">
              All Categories <ChevronDown className="h-4 w-4" />
            </Link>
            {categoriesOpen && (
              <div className="absolute left-0 top-full w-56 rounded-xl border border-border-soft bg-white py-2 shadow-lg">
                {PRODUCT_CATEGORIES.map((category) => (
                  <Link
                    key={category}
                    href={`/products?category=${encodeURIComponent(category)}`}
                    className="block px-4 py-2 text-sm text-ink hover:bg-blush/60"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="font-medium text-ink hover:text-accent-600">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Search - desktop */}
        <form onSubmit={handleSearch} className="relative hidden max-w-sm flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-full border border-border-soft bg-blush/30 py-2 pl-9 pr-4 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
        </form>

        {/* Icons */}
        <div className="flex items-center gap-5">
          {isLoggedIn ? (
            <Link href="/account/orders" className="hidden items-center gap-1.5 text-ink hover:text-accent-600 md:flex">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">My Orders</span>
            </Link>
          ) : (
            <button
              onClick={() => setLoginOpen(true)}
              className="hidden items-center gap-1.5 text-ink hover:text-accent-600 md:flex"
            >
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">Login</span>
            </button>
          )}
          <Link href="/cart" className="relative text-ink hover:text-accent-600">
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-badge text-xs font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <button onClick={() => setIsMenuOpen((open) => !open)} className="text-ink md:hidden" aria-label="Toggle menu">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <div className="border-t border-border-soft bg-white px-4 py-4 md:hidden">
          <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-border-soft bg-blush/30 py-2 pl-9 pr-4 text-sm focus:border-accent-500 focus:outline-none"
            />
          </form>
          <div className="flex flex-col gap-1">
            <Link href="/products" className="rounded-lg px-3 py-2 font-medium text-ink hover:bg-blush/60" onClick={() => setIsMenuOpen(false)}>
              All Categories
            </Link>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 font-medium text-ink hover:bg-blush/60"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <Link
                href="/account/orders"
                className="rounded-lg px-3 py-2 font-medium text-ink hover:bg-blush/60"
                onClick={() => setIsMenuOpen(false)}
              >
                My Orders
              </Link>
            ) : (
              <button
                onClick={() => { setIsMenuOpen(false); setLoginOpen(true); }}
                className="rounded-lg px-3 py-2 text-left font-medium text-ink hover:bg-blush/60"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </nav>
  );
};

export default Navbar;
