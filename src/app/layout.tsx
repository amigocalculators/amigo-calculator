import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Amigo Calculators - Quality Calculators Made in India',
  description:
    'Amigo Calculators - Quality, precision, and durability. Buy 14-digit, 12-digit, scientific calculators and more. Made in India.',
  keywords: 'amigo calculators, calculator, scientific calculator, India, buy calculator',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
