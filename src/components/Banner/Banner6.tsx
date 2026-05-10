import React, { useEffect, useState } from 'react';
import { Users, BarChart, Globe, Zap } from 'lucide-react';

const StatsBanner: React.FC = () => {
  const [animatedValues, setAnimatedValues] = useState({
    customers: 0,
    countries: 0,
    projects: 0,
    satisfaction: 0,
  });

  const targetValues = {
    customers: 10000,
    countries: 42,
    projects: 25000,
    satisfaction: 98,
  };

  useEffect(() => {
    const animationDuration = 2000; // ms
    const frameDuration = 1000 / 60; // 60 fps
    const totalFrames = Math.round(animationDuration / frameDuration);
    
    let frame = 0;
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      
      setAnimatedValues({
        customers: Math.floor(progress * targetValues.customers),
        countries: Math.floor(progress * targetValues.countries),
        projects: Math.floor(progress * targetValues.projects),
        satisfaction: Math.floor(progress * targetValues.satisfaction),
      });
      
      if (frame === totalFrames) {
        clearInterval(counter);
        setAnimatedValues(targetValues);
      }
    }, frameDuration);
    
    return () => clearInterval(counter);
  }, []);

  const stats = [
    {
      icon: <Users size={24} />,
      value: animatedValues.customers.toLocaleString(),
      label: "Happy Customers",
      suffix: "+",
    },
    {
      icon: <Globe size={24} />,
      value: animatedValues.countries,
      label: "Countries",
      suffix: "+",
    },
    {
      icon: <BarChart size={24} />,
      value: animatedValues.projects.toLocaleString(),
      label: "Projects Completed",
      suffix: "+",
    },
    {
      icon: <Zap size={24} />,
      value: animatedValues.satisfaction,
      label: "Satisfaction Rate",
      suffix: "%",
    },
  ];

  return (
    <div className="bg-gray-900 text-white overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Teams Worldwide</h2>
          <p className="text-xl text-gray-400">
            Our platform helps thousands of companies deliver exceptional design experiences.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/10 group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 mb-4 group-hover:bg-blue-500/20 transition-colors">
                  {stat.icon}
                </div>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-white">{stat.value}</span>
                  <span className="text-2xl font-bold text-blue-400 ml-1">{stat.suffix}</span>
                </div>
                <span className="text-gray-400 mt-2">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 opacity-80">
          {[
            "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
            "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
            "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
            "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
            "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
            "https://upload.wikimedia.org/wikipedia/commons/e/e1/Logo_of_YouTube_%282015-2017%29.svg"
          ].map((logo, index) => (
            <div key={index} className="flex items-center justify-center">
              <img 
                src={logo} 
                alt={`Company ${index + 1}`} 
                className="h-8 md:h-10 opacity-50 hover:opacity-100 transition-opacity invert"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsBanner;