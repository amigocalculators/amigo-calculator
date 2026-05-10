import { useState } from 'react'; // Import useState
import { AlertTriangle, X } from 'lucide-react'; // Import X icon for close button

const PaymentRedAlertBanner = () => {
  const [isVisible, setIsVisible] = useState(true); // State to control banner visibility

  if (!isVisible) {
    return null; // Don't render if not visible
  }

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-3 md:p-4 rounded-none shadow-lg mb-0 w-full flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-3 relative overflow-hidden">
      {/* Close Button */}
      <button
        onClick={() => setIsVisible(false)} // Hide the banner on click
        className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors duration-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 z-20"
        aria-label="Close alert"
      >
        <X className="h-5 w-5" /> {/* Adjusted icon size for shorter height */}
      </button>

      {/* Subtle background shimmer effect (CSS animation) */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .shimmer-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1), /* Adjusted for darker background */
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 5s infinite linear;
          pointer-events: none;
        }
      `}</style>

      {/* IMPORTANT: Changed rounded-xl to rounded-none to match parent banner */}
      <div className="shimmer-effect absolute inset-0 rounded-none"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-3 text-center md:text-left flex-grow">
        {/* Icon */}
        <div className="flex-shrink-0 pr-0 md:pr-8"> {/* Adjusted padding for better alignment */}
          <AlertTriangle className="h-8 w-8 md:h-10 md:w-10 text-yellow-300 animate-pulse" /> {/* Adjusted icon size */}
        </div>

        {/* Text Content */}
        <div className="flex-grow"> {/* Allows text to take available space */}
          <h2 className="text-base md:text-xl font-bold mb-0 leading-tight "> {/* Adjusted text size and removed mb-1 */}
            Important Notice: Payment Services Unavailable.
          </h2>
          <p className="text-xs md:text-sm text-white opacity-90"> {/* Adjusted text size */}
            We are currently implementing a new payment system on our website.
             We appreciate your patience during this upgrade.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentRedAlertBanner;
