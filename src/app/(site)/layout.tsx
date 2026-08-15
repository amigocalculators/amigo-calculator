import Script from 'next/script';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactFormWrapper from '@/components/ContactFormWrapper';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      <Toaster position="top-center" />
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <ContactFormWrapper />
    </>
  );
}
