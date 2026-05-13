import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Big 404 */}
        <div className="relative mb-6">
          <p className="text-[10rem] font-black leading-none tracking-tighter text-white/5 select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-8xl font-black tracking-tighter">
              <span className="text-white">4</span>
              <span className="text-[#ED3237]">0</span>
              <span className="text-white">4</span>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-white/10" />
          <div className="w-2 h-2 rounded-full bg-[#ED3237]" />
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-white/50 mb-10 text-sm leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          <br />
          Let&apos;s get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-8 py-3 bg-[#ED3237] text-white font-semibold rounded-lg hover:bg-[#c8282c] transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/products"
            className="px-8 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/15 transition-colors border border-white/10"
          >
            Browse Products
          </Link>
        </div>

        {/* Brand */}
        <p className="mt-14 text-white/20 text-xs tracking-widest uppercase">
          Amigo Calculators
        </p>
      </div>
    </div>
  );
}
