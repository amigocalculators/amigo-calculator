import React, { useState, useEffect } from 'react';
import { Clock, Tag, X } from 'lucide-react';

const PromotionalBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // ✅ Hardcoded global end date (15 May 2025, 11:59 PM)
  const endDate = new Date("2025-05-23T23:59:59");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = endDate.getTime();
      const difference = end - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-red-500 to-indigo-600 text-white shadow-md relative overflow-hidden animate-slide-up">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="small-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#small-grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 py-3 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center mb-3 sm:mb-0">
            <div className="hidden md:block">
              <Tag size={18} className="mr-2 animate-pulse" />
            </div>
            <div className="flex flex-col sm:flex-row items-center">
              <p className="font-semibold text-center sm:text-left">
                <span className="inline-block mr-1">🎉</span> Special Offer: Buy 2 Get 1 Free
              </p> 
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex items-center mr-3">
              <Clock size={16} className="mr-1 text-indigo-200" />
              <span className="text-sm">Ends in:</span>
            </div>

            <div className="flex space-x-1 mr-4">
              {[
                { value: timeLeft.days, label: "D" },
                { value: timeLeft.hours, label: "H" },
                { value: timeLeft.minutes, label: "M" },
                { value: timeLeft.seconds, label: "S" }
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="bg-white/20 px-2 py-1 rounded-sm min-w-[2rem] text-center">
                    <span className="font-mono font-medium">{item.value.toString().padStart(2, '0')}</span>
                  </div>
                  <span className="text-[10px] text-indigo-200">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center">
              {/* <button className="bg-white text-indigo-700 hover:bg-indigo-100 transition-colors px-3 py-1 rounded text-sm font-medium mr-2">
                Claim Now
              </button> */}
              <button
                onClick={() => setIsVisible(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close promotion"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default PromotionalBanner;
