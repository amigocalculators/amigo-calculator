import type { Metadata } from 'next';
import BulkOrdersClient from './BulkOrdersClient';

export const metadata: Metadata = {
  title: 'Bulk Orders',
  description:
    'Order calculators in bulk for schools, offices, and retail distribution. Amigo offers wholesale pricing, custom quantities, and pan-India delivery for bulk enquiries.',
  alternates: { canonical: '/bulk-orders' },
};

export default function BulkOrdersPage() {
  return <BulkOrdersClient />;
}
