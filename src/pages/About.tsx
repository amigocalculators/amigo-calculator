import CountUp from "react-countup";

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 mt-16 bg-[#f0efef]">
      <h1 className="text-3xl font-bold mb-8">About Us</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <p className="text-gray-700 mb-6">
            Amigo is a brand operating under Mitra agro enterprises Ltd based in
            West Bengal, India.
          </p>
          <p className="text-gray-700 mb-6">
            Over the decade the company has built its significance inside the
            domestic and the international market. The company essentially
            involves and believes in house manufacturing, endeavoring to provide
            the best to its customers. We can be recognized as one of the
            largest manufacturing units of calculators in India. The vision of
            the company is to provide the best in quality of products with
            unbeatable prices. With a constant effort and continuous progress of
            enhancing features that was never offered before. Therefore, raising
            bars and gifting its consumers with more lavishing designs and
            extraordinary products. With a strength of over hundreds of heads
            and an area of 100 acres the company believes to expand in the
            international markets. We endeavour to offer high-quality
            calculators and personalized customer service while motivating
            motivation, creativity and teamwork in a constantly evolving
            environment. As core values, we wish to deliver satisfaction to our
            customer.
          </p>
          <p className="text-gray-700">
            We are a reliable manufacturer, distributor/wholesaler, exporter,
            trader and supplier of high-end as well as modern calculators in the
            market since 2009.A Make In India member and a brainchild of Mr.
            Joydeb Mitra, we produce bulk products within the stipulated period.
            Thus, we are attentive towards the punctuality of product delivery.
          </p>
        </div>
        <div>
          <img
            src="https://images.unsplash.com/photo-1497366754035-f200968a6e72"
            alt="Our Store"
            className="w-full h-650px object-cover rounded-lg shadow-lg"
          />
        </div>
      </div>

      <div className="bg-gray-100 py-16 rounded-2xl mt-4 p-8">
        <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <div className="text-center p-4">
            <h3 className="text-xl font-semibold mb-2">OUR VISION</h3>
            <p className="text-gray-600">
              Being one of the biggest calculator manufacturers in india, our
              mission is to satisfy customer demands and expectations by
              offering the highest calibre goods at competitive prices.
            </p>
          </div>
          <div className="text-center p-4">
            <h3 className="text-xl font-semibold mb-2">OUR MISSION</h3>
            <p className="text-gray-600">
              QUALITY FIRST,COST SECOND Our AIM is to have better creativity,
              team work and a constantly evolving atmosphere within the
              organisation. Our Core Value is to Satisfy the Customer needs.
            </p>
          </div>
        </div>
      </div>

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

      <div className="mb-4">
        {/* Desktop View Image */}
        <img
          src="/Image/Banner/CORPORATE WITH ROSE.jpg"
          alt="Our Client - Desktop View"
          className="hidden md:block w-full h-auto"
        />

        {/* Mobile View Image */}
        <img
          src="/Image/Banner/CORPORATE WITH ROSE MOBILE VIEW.jpg"
          alt="Our Client - Mobile View"
          className="block md:hidden w-full h-auto"
        />
      </div>

      <div>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117878.8697486497!2d88.27334022484438!3d22.58977224980281!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0277c9af98dae1%3A0xb6ca6e71295ec47f!2samigo!5e0!3m2!1sen!2sin!4v1722944286385!5m2!1sen!2sin"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-8">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4">
            <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
            <p className="text-gray-600">
              Carefully curated selection of high-quality items
            </p>
          </div>
          <div className="text-center p-4">
            <h3 className="text-xl font-semibold mb-2">Fast Shipping</h3>
            <p className="text-gray-600">
              Quick and reliable delivery to your doorstep
            </p>
          </div>
          <div className="text-center p-4">
            <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
            <p className="text-gray-600">
              Safe and encrypted payment processing
            </p>
          </div>
          <div className="text-center p-4">
            <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
            <p className="text-gray-600">
              Always here to help with your questions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
