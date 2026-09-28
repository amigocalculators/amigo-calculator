import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amigocalculator.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Account, cart/checkout, and admin areas are per-user or private — nothing
      // there is content worth ranking, so keep crawlers out of them.
      disallow: ['/admin', '/api', '/account', '/cart', '/checkout', '/payment-status', '/cancel-order'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
