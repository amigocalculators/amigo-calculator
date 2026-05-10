import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useParams } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Star,
  ShoppingCart,
  Heart,
  StarHalf,
  ArrowLeft,
  XCircle,
} from "lucide-react";
// import { Eye, ChevronRight } from "lucide-react"; // or your icon library

interface Product {
  id: string;
  name: string;
  price: number;
  discountedPrice: number;
  imageUrl: string;
  rating: number;
  reviews: number;
  description: string;
}

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  discountedPrice: number;
  imageUrl: string;
  theme?: "fancy" | "simple"; // Visual theme for the card
}

interface MessageModalProps {
  message: string | null;
  onClose: () => void;
}

const allProductsData: Product[] = [
  {
    id: "6",
    name: "fx-82MS (Pink)",
    price: 535,
    discountedPrice: 399,
    imageUrl: "/Image/Product/SC-PINK.jpg", // Placeholder for demonstration
    rating: 4.8,
    reviews: 120,
    description:
      "A vibrant pink scientific calculator, perfect for students and professionals. Features a clear display and a wide range of functions for all your mathematical needs.",
  },
  {
    id: "12",
    name: "Mi-847 (Black)",
    price: 400,
    discountedPrice: 320,
    imageUrl: "/Image/Product/MI-847BK.jpg", // Placeholder for demonstration
    rating: 4.5,
    reviews: 85,
    description:
      "Sleek and reliable black calculator with a comfortable keypad and essential functions for everyday calculations. Its compact design makes it easy to carry.",
  },
  {
    id: "10",
    name: "Mi-141E",
    price: 580,
    discountedPrice: 464,
    imageUrl: "/Image/Product/MI-141E-1.jpg", // Placeholder for demonstration
    rating: 4.9,
    reviews: 210,
    description:
      "Advanced calculator with a premium feel, offering extensive features for complex mathematical problems. Ideal for engineers and advanced students.",
  },
  {
    id: "25",
    name: "Mi-121DLX",
    price: 400,
    discountedPrice: 320,
    imageUrl: "/Image/Product/dlx normal pic.jpg", // Placeholder for demonstration
    rating: 4.2,
    reviews: 60,
    description:
      "A deluxe calculator designed for ease of use and durability, suitable for both office and home use. Features large, easy-to-read buttons.",
  },
];

const MessageModal: React.FC<MessageModalProps> = ({ message, onClose }) => {
  if (!message) return null; // Don't render if there's no message

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close message"
        >
          <XCircle size={24} />
        </button>
        <p className="text-lg font-semibold text-gray-800 mb-4">{message}</p>
        <button
          onClick={onClose}
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-5 rounded-md text-sm font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Got It!
        </button>
      </div>
    </div>
  );
};

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  discountedPrice,
  imageUrl,
  theme = "simple",
}) => {
  // Calculate discount percentage if a discounted price is provided
  const discountPercentage = discountedPrice
    ? Math.round(((price - discountedPrice) / price) * 100)
    : 0;

  // State for image error handling
  const [imgSrc, setImgSrc] = useState(imageUrl);
  const handleImageError = () => {
    // Fallback to a generic placeholder if the image fails to load
    setImgSrc(
      `https://placehold.co/400x300/E0E0E0/616161?text=Image+Not+Found`
    );
  };

  return (
    <div
      className={`group relative bg-white rounded-lg shadow-lg overflow-hidden flex flex-col justify-between
                     ${
                       theme === "fancy"
                         ? "border border-indigo-200 hover:shadow-indigo-300/50 transition-all duration-300"
                         : "border border-gray-200"
                     }`}
    >
      {/* Product Image and Discount Badge */}
      <div className="relative overflow-hidden sm:h-60 md:h-72 lg:h-80">
        <img
          src={imgSrc}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError} // Handle image loading errors
        />
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10 shadow-md">
            {discountPercentage}% OFF
          </div>
        )}
      </div>

      <div className="p-5 bg-gray-200 border border-green-200 rounded-lg flex flex-col group hover:bg-green-100 transition">
        <h3
          className="text-lg font-semibold text-green-800 truncate mb-2"
          title={name}
        >
          {name}
        </h3>

        <div className="flex items-baseline mb-4">
          {discountedPrice ? (
            <>
              <p className="text-xl font-bold text-blue-600">
                ₹{discountedPrice.toFixed(2)}
              </p>
              <p className="text-sm text-gray-700 line-through ml-2">
                ₹{price.toFixed(2)}
              </p>
            </>
          ) : (
            <p className="text-xl font-bold text-green-800">
              ₹{price.toFixed(2)}
            </p>
          )}
        </div>

        <Link
          to={`/product/${id}`}
          className="mt-auto w-full flex items-center justify-between px-4 py-2.5 bg-orange-400 text-white rounded-lg text-sm font-medium transition group-hover:bg-blue-400"
        >
          View Product
          <ShoppingCart size={24} />
        </Link>
      </div>
    </div>
  );
};

const FeaturedProductsSection: React.FC = () => {
  // Select the first 4 products to be featured
  const featuredProducts = allProductsData.slice(0, 4);

  return (
    <section className="py-12 md:py-6 bg-gradient-to-b from-indigo-50 via-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 md:mb-12">
          <div className="flex items-center mb-4 md:mb-36">
            <div className="p-2.5 bg-indigo-100 rounded-full mr-3 md:mr-4 shadow">
              <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Featured Products
              </h2>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                Premium selections for your lifestyle
              </p>
            </div>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors duration-300 self-start md:self-auto shadow-sm hover:shadow"
          >
            View all products
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              discountedPrice={product.discountedPrice}
              imageUrl={product.imageUrl}
              theme="fancy"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const ProductListPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          All Products
        </h1>
        <Link
          to="/"
          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center text-sm"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Home
        </Link>
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {allProductsData.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            discountedPrice={product.discountedPrice}
            imageUrl={product.imageUrl}
            theme="fancy"
          />
        ))}
      </div>
    </div>
  );
};

const ProductDetailPage: React.FC<{ showMessage: (msg: string) => void }> = ({
  showMessage,
}) => {
  const { productId } = useParams<{ productId: string }>(); // Get product ID from URL params
  const product = allProductsData.find((p) => p.id === productId); // Find the product by ID

  // State for image error handling
  const [imgSrc, setImgSrc] = useState(product?.imageUrl || "");
  useEffect(() => {
    // Reset imgSrc when product changes
    setImgSrc(product?.imageUrl || "");
  }, [product]);

  const handleImageError = () => {
    setImgSrc(
      `https://placehold.co/600x450/E0E0E0/616161?text=Image+Not+Found`
    );
  };

  // If product is not found, display a 404-like message
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Oops! Product Not Found
        </h2>
        <p className="text-gray-500 mb-8">
          We couldn't find the product you were looking for.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-md"
        >
          <ArrowLeft size={18} className="mr-2" />
          Go Back Home
        </Link>
      </div>
    );
  }

  // Calculate discount percentage
  const discountPercentage = product.discountedPrice
    ? Math.round(
        ((product.price - product.discountedPrice) / product.price) * 100
      )
    : 0;

  // Handle cart/wishlist actions, using the passed showMessage function
  const handleCartAction = (action: "Added to Cart" | "Added to Wishlist") => {
    console.log(`${action}: ${product.name} (ID: ${product.id})`);
    showMessage(
      `${product.name} ${
        action === "Added to Cart" ? "added to cart!" : "added to wishlist!"
      }`
    );
  };

  // Function to render star ratings visually
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 !== 0;

    // Render full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} fill="currentColor" size={20} />);
    }

    // Render half star if applicable
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" fill="currentColor" size={20} />);
    }

    // Render empty stars to complete the 5-star rating
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} size={20} className="text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-5xl">
      <div className="mb-6 md:mb-8">
        <Link
          to="/"
          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center text-sm transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Home
        </Link>
      </div>
      <div className="bg-white shadow-2xl rounded-xl overflow-hidden md:flex">
        <div className="md:w-1/2 p-4">
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-auto md:max-h-[500px] object-contain rounded-lg"
            onError={handleImageError} // Handle image loading errors
          />
          {discountPercentage > 0 && (
            <div className="mt-4 md:hidden text-center">
              <span className="bg-red-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-md">
                {discountPercentage}% OFF
              </span>
            </div>
          )}
        </div>
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>

          {discountPercentage > 0 && (
            <div className="hidden md:block mb-4">
              <span className="bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-md">
                {discountPercentage}% OFF
              </span>
            </div>
          )}

          <p className="text-gray-600 mb-4 text-sm md:text-base leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400">{renderStars()}</div>
            <span className="ml-2 text-gray-600 text-sm">
              ({product.reviews} reviews)
            </span>
          </div>

          <div className="flex items-baseline mb-6">
            {product.discountedPrice ? (
              <>
                <p className="text-2xl md:text-3xl font-bold text-indigo-600">
                  ₹{product.discountedPrice.toFixed(2)}
                </p>
                <p className="text-md md:text-lg text-gray-500 line-through ml-3">
                  ₹{product.price.toFixed(2)}
                </p>
              </>
            ) : (
              <p className="text-2xl md:text-3xl font-bold text-gray-800">
                ₹{product.price.toFixed(2)}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleCartAction("Added to Cart")}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg flex items-center justify-center text-base md:text-lg font-medium transition-colors duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <ShoppingCart size={20} className="mr-2.5" />
              Add to Cart
            </button>
            <button
              onClick={() => handleCartAction("Added to Wishlist")}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg flex items-center justify-center text-base md:text-lg font-medium transition-colors duration-300 border border-gray-300 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              <Heart size={20} className="mr-2.5" />
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // State to manage the message displayed in the modal
  const [message, setMessage] = useState<string | null>(null);

  // Function to show a message in the modal
  const showMessage = (msg: string) => {
    setMessage(msg);
  };

  // Function to close the message modal
  const closeMessage = () => {
    setMessage(null);
  };

  return (
    // Remove the BrowserRouter from here since it's already in your main App.tsx
    <main className="min-h-screen bg-gray-50 font-sans">
      <Routes>
        {/* Route for the home page displaying featured products */}
        <Route path="/" element={<FeaturedProductsSection />} />
        {/* Route for the page displaying all products */}
        <Route path="/products" element={<ProductListPage />} />
        {/* Route for individual product detail pages, passing showMessage prop */}
        <Route
          path="/product/:productId"
          element={<ProductDetailPage showMessage={showMessage} />}
        />
        {/* Fallback route for any unknown paths (404 Not Found) */}
        <Route
          path="*"
          element={
            <div className="container mx-auto px-4 py-16 text-center">
              <h1 className="text-4xl font-bold text-indigo-600 mb-4">404</h1>
              <p className="text-xl text-gray-700 mb-8">Page Not Found</p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-md"
              >
                Go Back Home
              </Link>
            </div>
          }
        />
      </Routes>
      {/* Message modal, displayed when 'message' state is not null */}
      <MessageModal message={message} onClose={closeMessage} />
    </main>
  );
};

export default App;
