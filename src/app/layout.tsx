import type { Metadata } from 'next';
import './globals.css';

// Same fallback pattern used elsewhere in the codebase (see orderConfirmation.ts,
// resend-email route) — falls back to the production domain when the env var isn't set.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amigocalculator.com';

const defaultTitle = 'Amigo Calculators - Quality Calculators Made in India';
const defaultDescription =
  'Buy 14-digit, 12-digit, scientific, and printing calculators online from Amigo. Quality, precision, and durability — manufactured in India, trusted by 200,000+ customers since 2009.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: '%s | Amigo Calculators',
  },
  description: defaultDescription,
  keywords: [
    'amigo calculators',
    'buy calculator online India',
    'scientific calculator',
    'printing calculator',
    '12 digit calculator',
    '14 digit calculator',
    'calculator manufacturer India',
  ],
  authors: [{ name: 'Amigo Calculators' }],
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'Amigo Calculators',
    title: defaultTitle,
    description: defaultDescription,
    images: [{ url: '/Image/Banner/Home1.jpg', width: 1920, height: 800, alt: 'Amigo Calculators' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: ['/Image/Banner/Home1.jpg'],
  },
};

// Site-wide Organization schema — helps Google understand who we are (logo, contact
// details, social profiles) independent of any single page's content.
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Amigo Calculators',
  url: siteUrl,
  logo: `${siteUrl}/LOGO1.png`,
  description: defaultDescription,
  address: {
    '@type': 'PostalAddress',
    streetAddress: '32 P.K Tagor Street',
    addressLocality: 'Kolkata',
    postalCode: '700006',
    addressRegion: 'West Bengal',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-7044480444',
    email: 'enquiry@amigocalculator.info',
    contactType: 'customer service',
  },
  sameAs: [
    'https://www.facebook.com/profile.php?id=61577095592615',
    'https://www.youtube.com/@amigo_calculator',
    'https://www.instagram.com/amigo_calculators/',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
