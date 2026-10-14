import { Truck, ShieldCheck, Headset, Zap } from 'lucide-react';

export const TRUST_BADGES = [
  { icon: Truck, label: 'Free Shipping', caption: 'On orders over ₹499' },
  { icon: Zap, label: 'Fast Delivery', caption: 'Within 24-48 hours' },
  { icon: ShieldCheck, label: 'Secure Payment', caption: '100% secure checkout' },
  { icon: Headset, label: '24/7 Support', caption: 'Dedicated support' },
];

// Shared across the homepage trust strip and the footer so the same four promises
// don't drift into two different copies.
export default function TrustBadges({ className = '', tileClassName = 'bg-blush/50' }: { className?: string; tileClassName?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-4 sm:grid-cols-4 ${className}`}>
      {TRUST_BADGES.map(({ icon: Icon, label, caption }) => (
        <div key={label} className={`flex items-center gap-3 rounded-xl p-4 ${tileClassName}`}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-500/20 text-accent-600">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">{label}</p>
            <p className="text-xs text-ink-muted">{caption}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
