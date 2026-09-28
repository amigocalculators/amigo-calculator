'use client';

import CountUp from 'react-countup';

export default function AboutStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16 mt-16">
      <div className="text-center p-6">
        <div className="text-4xl font-bold text-green-600 mb-2">
          <CountUp start={0} end={200000} duration={10} /> +
        </div>
        <div className="text-gray-600">Happy Customers</div>
      </div>
      <div className="text-center p-6">
        <div className="text-4xl font-bold text-blue-600 mb-2">
          <CountUp start={0} end={100} duration={10} />+
        </div>
        <div className="text-gray-600">Distributor</div>
      </div>
      <div className="text-center p-6">
        <div className="text-4xl font-bold text-blue-600 mb-2">
          <CountUp start={0} end={10000} duration={10} />+
        </div>
        <div className="text-gray-600">Retailers</div>
      </div>
      <div className="text-center p-6">
        <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
        <div className="text-gray-600">Customer Support</div>
      </div>
    </div>
  );
}
