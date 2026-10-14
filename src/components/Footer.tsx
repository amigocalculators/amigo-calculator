import { Mail, Phone, MapPin, Facebook, Youtube, Instagram } from 'lucide-react';
import Link from 'next/link';
import TrustBadges from '@/components/TrustBadges';

const Footer = () => {
  return (
    <footer className="border-t border-border-soft bg-blush/30 pt-10 pb-8 text-ink">
      <div className="mx-auto max-w-7xl px-4">
        <TrustBadges className="mb-10" tileClassName="bg-white shadow-sm" />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element -- matches existing logo usage elsewhere in the codebase */}
            <img src="/LOGO1.png" className="h-[40px]" alt="Amigo Calculators Logo" />
            <p className="pt-4 text-ink-muted">
              Amigo Calculators guarantees quality, precision, and durability
              through advanced testing and manufacturing.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-ink">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-ink-muted transition-colors duration-200 hover:text-accent-600">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-ink-muted transition-colors duration-200 hover:text-accent-600">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-ink-muted transition-colors duration-200 hover:text-accent-600">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-ink">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-center text-ink-muted">
                <Mail className="mr-2 h-5 w-5 shrink-0" />
                <a href="mailto:enquiry@amigocalculator.info" className="transition-colors duration-200 hover:text-accent-600">
                  enquiry@amigocalculator.info
                </a>
              </li>
              <li className="flex items-center text-ink-muted">
                <Phone className="mr-2 h-5 w-5 shrink-0" />
                <a href="tel:+917044480444" className="transition-colors duration-200 hover:text-accent-600">
                  +91 70444 80444
                </a>
              </li>
              <li className="flex items-start text-ink-muted">
                <MapPin className="mr-2 mt-1 h-5 w-5 shrink-0" />
                <a
                  href="https://www.google.com/maps/place/Amigo+Calculator/@22.5896369,88.3531915,17z/data=!3m2!4b1!5s0x3a0277c9bd7f61e5:0xf402cab316040113!4m6!3m5!1s0x3a0277c9af98dae1:0xb6ca6e71295ec47f!8m2!3d22.589632!4d88.3557664!16s%2Fg%2F11dxlbj_45?entry=ttu&g_ep=EgoyMDI1MDMyNC4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-200 hover:text-accent-600"
                >
                  32 P. K. Tagore Street, PRB Tower, Ground Floor, Kolkata - 700006, West Bengal, India
                </a>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-ink">Follow Us</h4>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61577095592615"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-muted shadow-sm transition-colors duration-200 hover:bg-accent-500 hover:text-ink"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/@amigo_calculator"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-muted shadow-sm transition-colors duration-200 hover:bg-accent-500 hover:text-ink"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/amigo_calculators/"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-muted shadow-sm transition-colors duration-200 hover:bg-accent-500 hover:text-ink"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Policy Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-border-soft pt-4 text-sm text-ink-muted md:gap-x-8">
          <a href="https://merchant.razorpay.com/policy/PncIuU3t5JnxlK/terms" className="transition-colors duration-200 hover:text-accent-600">
            Terms &amp; Conditions
          </a>
          <a href="https://merchant.razorpay.com/policy/PncIuU3t5JnxlK/privacy" className="transition-colors duration-200 hover:text-accent-600">
            Privacy Policy
          </a>
          <a href="https://merchant.razorpay.com/policy/PncIuU3t5JnxlK/refund" className="transition-colors duration-200 hover:text-accent-600">
            Cancellation &amp; Refund
          </a>
          <a href="https://merchant.razorpay.com/policy/PncIuU3t5JnxlK/shipping" className="transition-colors duration-200 hover:text-accent-600">
            Shipping &amp; Delivery
          </a>
        </div>

        {/* Copyright */}
        <div className="mt-4 text-center text-ink-muted">
          <p>© 2024 Amigo-Calculator. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
