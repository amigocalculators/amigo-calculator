import React from "react";
// import { Play, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Banner2: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="relative w-full h-[650px] overflow-hidden">
      {/* Background Image with Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/Image/Banner/847-3.jpeg)", // Ensure the path starts with '/'
          filter: "blur(20px)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(20, 20, 20, 0.5)" }}
      />

      {/* Content */}
      <div className="relative z-10 w-full h-full">
        <div className="container mx-auto px-8 h-full flex flex-col md:flex-row justify-start items-center gap-8">
          {/* Left Text Section */}
          <div className="sm:text-center lg:text-left">
            <h1 className="text-4xl tracking-tight font-bold text-white sm:text-5xl md:text-6xl">
              <span className="block">Introducing</span>
              <span className="block text-orange-600 2xl:inline">
                mi-847
              </span>
            </h1>
            <p className="mt-3 text-base text-gray-200 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
            The MI-847 calculator is designed for professionals, students, and everyday users who need reliable performance in a compact form. With its sleek black finish and intuitive keypad layout, it offers both style and functionality.
            </p>
            <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
              {/* <div className="rounded-md shadow">
                <a
                  href="#"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors duration-300"
                >
                  Pre-order Now
                </a>
              </div> */}
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <a
                  href="/product/12"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10 transition-colors duration-300"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-gray-200">
                Shipping free over all India. <br />
                <span className="text-orange-600 font-semibold">Limited time offer!</span>
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl blur opacity-30"></div>
            <img
              src="/Image/Banner/847-2.jpg"
              alt="Mobile app interface"
              className="relative z-10 rounded-2xl shadow-2xl max-w-full h-auto border-8 border-white"
            />
            <div className="absolute -bottom-6 -right-6 bg-white rounded-full p-4 shadow-lg z-20">
              <div className="text-emerald-600 font-bold text-xl">4.2</div>
              <div className="text-xs text-gray-500">★★★★★</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner2;
