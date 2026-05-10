import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Youtube,
  Instagram,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8"> {/* Changed to grid-cols-4 as policy links are separate */}
          {/* Company Info */}
          <div>
            <img src="Logo-Wh.png" className="h-[45px] " alt="Amigo Calculators Logo" />
            <p className="text-gray-400 pt-4">
              Amigo Calculators guarantees quality, precision, and durability
              through advanced testing and manufacturing.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors duration-200">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-400">
                <Mail className="w-5 h-5 mr-2 flex-shrink-0" />
                <a href="mailto:enquiry@amigocalculator.info" className="hover:text-white transition-colors duration-200">
                  enquiry@amigocalculator.info
                </a>
              </li>
              <li className="flex items-center text-gray-400">
                <Phone className="w-5 h-5 mr-2 flex-shrink-0" />
                <a href="tel:+917044480444" className="hover:text-white transition-colors duration-200">
                  +91 70444 80444
                </a>
              </li>
              <li className="flex items-start text-gray-400">
                <MapPin className="w-5 h-5 mr-2 mt-1 flex-shrink-0" />
                <a
                  href="https://www.google.com/maps/place/Amigo+Calculator/@22.5896369,88.3531915,17z/data=!3m2!4b1!5s0x3a0277c9bd7f61e5:0xf402cab316040113!4m6!3m5!1s0x3a0277c9af98dae1:0xb6ca6e71295ec47f!8m2!3d22.589632!4d88.3557664!16s%2Fg%2F11dxlbj_45?entry=ttu&g_ep=EgoyMDI1MDMyNC4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors duration-200"
                >
                  32 P.K Tagor Street, Kolkata-700006, West Bengal, India.
                </a>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=61577095592615"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="https://www.youtube.com/@amigo_calculator"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="YouTube"
              >
                <Youtube className="w-6 h-6" />
              </a>
              <a
                href="https://www.instagram.com/amigo_calculators/"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* --- */}

        {/* Dedicated Policy Links Section */}
        <div className="
          border-t border-gray-800 mt-8 pt-4
          flex flex-wrap justify-center space-x-4 md:space-x-8
          text-gray-400 text-sm
        ">
          <a href="https://merchant.razorpay.com/policy/PncIuU3t5JnxlK/terms" className="hover:text-white transition-colors duration-200">
            Terms & Conditions
          </a>
          <a href="https://merchant.razorpay.com/policy/PncIuU3t5JnxlK/privacy" className="hover:text-white transition-colors duration-200">
            Privacy Policy
          </a>
          <a href="https://merchant.razorpay.com/policy/PncIuU3t5JnxlK/refund" className="hover:text-white transition-colors duration-200">
            Cancellation & Refund
          </a>
          <a href="https://merchant.razorpay.com/policy/PncIuU3t5JnxlK/shipping" className="hover:text-white transition-colors duration-200">
            Shipping & Delivery
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-400 mt-4">
          <p>© 2024 Amigo-Calculator. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;