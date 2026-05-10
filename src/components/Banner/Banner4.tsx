import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';

const EventPromoBanner: React.FC = () => {
  const eventDateString = "2025-06-20T09:00:00"; // ISO format
  const eventLocation = "India Gate, Delhi, India";
  const eventTime = "9:00 AM - 6:00 PM PDT";

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const eventTime = new Date(eventDateString).getTime();
      const distance = eventTime - now;

      if (distance <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  return (
    <div className=" py-0">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left: Event Info */}
          <div className="w-full lg:w-1/2">
            <div className="inline-flex items-center bg-white bg-opacity-10 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
              <div className="bg-yellow-500 text-xs font-bold uppercase px-2 py-0.5 rounded text-gray-900 mr-2">
                New
              </div>
              <span className="text-sm font-medium text-white"> Join with US </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Paperworld India 2025(Delhi)
            </h1>

            <p className="text-lg text-indigo-100 mb-8 leading-relaxed max-w-2xl">
              Join industry leaders and visionaries for three days of inspiring talks,
              hands-on workshops, and networking opportunities. Discover the latest trends 
              and technologies shaping the future.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-white">
                <Calendar className="h-5 w-5 text-indigo-200" />
                <span className="font-medium">May 15–17, 2025</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <MapPin className="h-5 w-5 text-indigo-200" />
                <span className="font-medium">{eventLocation}</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Clock className="h-5 w-5 text-indigo-200" />
                <span className="font-medium">{eventTime}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-6 py-3 bg-white text-indigo-700 font-medium rounded-lg shadow hover:shadow-lg transition duration-300 ease-in-out">
                Register Now
              </button>
              <button className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-lg hover:bg-white hover:bg-opacity-10 transition duration-300 ease-in-out flex items-center gap-2">
                Learn More <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Right: Countdown */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl max-w-md w-full">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Countdown to the Event
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Secure your spot before tickets sell out
                </p>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-8 text-center">
                {[
                  { label: 'Days', value: countdown.days },
                  { label: 'Hours', value: countdown.hours },
                  { label: 'Minutes', value: countdown.minutes },
                  { label: 'Seconds', value: countdown.seconds },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-indigo-100 dark:bg-indigo-900/30 rounded-lg py-6"
                  >
                    <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 uppercase tracking-wide">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Early Bird</span>
                  <span className="font-medium text-green-600 dark:text-green-400">Available</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Regular</span>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Coming soon</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">VIP Pass</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">Limited</span>
                </div>
              </div>

              <div className="mt-8">
                <button className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition duration-300 ease-in-out">
                  Get Tickets Now
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EventPromoBanner;
