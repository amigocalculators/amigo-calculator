import React from "react";
// import { ArrowRight } from 'lucide-react';
// import Banner3 from './Banner3';
import Banner9 from "./Banner9";
// import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  ShoppingBag,
  Truck,
  Shield,
  HeadphonesIcon as HeadphoneIcon,
} from "lucide-react";

const BackgroundImageBanner: React.FC = () => {
  // const navigate = useNavigate();
  return (
    <>
      <div className="w-full pb-4">
        {/* Desktop Banner */}
        <img
          src="/Image/Banner/Home1.jpg"
          alt="Amigo Calculator Desktop Banner"
          className="hidden md:block w-full h-[500px] object-cover"
          style={{ filter: "blur(0px)" }}
        />

        {/* Mobile Banner */}
        <img
          // src="/Image/Banner/MOBILE-1.jpg"
          // src="/Image/Banner/MOBILE-1.jpg"
          src="/Image/Banner/CONCEPT-7.1.JPLL.jpg"
          alt="Amigo Calculator Mobile Banner"
          className="block md:hidden w-full h-auto object-cover"
          style={{ filter: "blur(0px)" }}
        />
      </div>

      {/* <Banner3 /> */}
      <Banner9 />

       <div className="w-full pb-4">
        {/* Desktop Banner */}
        <img
          src="/Image/Banner/Home2.jpg"
          alt="Amigo Calculator Desktop Banner"
          className="hidden md:block w-full h-[600px] object-cover"
          style={{ filter: "blur(0px)" }}
        />

        {/* Mobile Banner */}
        <img
          src="/Image/Banner/BANNER BM1.JPLL.jpg"
          alt="Amigo Calculator Mobile Banner"
          className="block md:hidden w-full h-[300px] object-cover"
          style={{ filter: "blur(0px)" }}
        />
      </div>
      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12 lg:px-32 px-12">
        <div className="flex items-center gap-4 p-6 bg-blue-50 rounded-xl">
          <ShoppingBag className="w-10 h-10 text-blue-600" />
          <div>
            <h3 className="font-semibold">Free Shipping</h3>
            <p className="text-sm text-gray-600">On orders over ₹499</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6 bg-green-50 rounded-xl">
          <Truck className="w-10 h-10 text-green-600" />
          <div>
            <h3 className="font-semibold">Fast Delivery</h3>
            <p className="text-sm text-gray-600">Within 24-48 hours</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6 bg-purple-50 rounded-xl">
          <Shield className="w-10 h-10 text-purple-600" />
          <div>
            <h3 className="font-semibold">Secure Payment</h3>
            <p className="text-sm text-gray-600">100% secure checkout</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6 bg-orange-50 rounded-xl">
          <HeadphoneIcon className="w-10 h-10 text-orange-600" />
          <div>
            <h3 className="font-semibold">24/7 Support</h3>
            <p className="text-sm text-gray-600">Dedicated support</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BackgroundImageBanner;
