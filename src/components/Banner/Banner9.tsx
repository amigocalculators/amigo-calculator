// import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { products } from "../../data/products";
import { useCart } from "../../context/CartContext";
import { ShoppingCart } from "lucide-react";
// import { toast } from 'react-toastify'; // Import if you plan to use toast notifications

const NeumorphicDesign = ({ currentProductId }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate(); // Keep navigate for other links if needed

  // Filter out the current product and shuffle the array
  const relatedProducts = products
    .filter((p) => p.id !== currentProductId)
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  // Separate function for adding to cart without navigation
  const handleAddToCart = (product) => {
    addToCart(product);
    // Optionally: Show a toast notification here instead of navigation
    // toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="mb-4 py-6 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-700 mb-10 pl-4 border-l-4 border-gray-400">
          You May Also Like
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 gap-4">
          {relatedProducts.map((relatedProduct) => (
            <div
              key={relatedProduct.id}
              className="bg-gray-200 rounded-xl overflow-hidden shadow-[5px_5px_15px_rgba(0,0,0,0.1),-5px_-5px_15px_rgba(255,255,255,0.8)] p-0 lg:p-4 transition-all duration-300 hover:shadow-[8px_8px_20px_rgba(0,0,0,0.12),-8px_-8px_20px_rgba(255,255,255,0.9)]"
            >
              <Link
                to={`/product/${relatedProduct.id}`}
                className="rounded-lg overflow-hidden mb-2 h-48 sm:h-56" // Added fixed height for consistent image area
              >
                <img
                  src={relatedProduct.image}
                  alt={relatedProduct.name}
                  className=" object-cover transform group-hover:scale-105 transition-transform duration-300" // Changed h-auto to h-full
                />
              </Link>
              <div className="p-2">
                <Link to={`/product/${relatedProduct.id}`}>
                  <h3 className="text-2xl font-semibold text-gray-700 mb-2 relative transition-all duration-300 group-hover:text-blue-700">
                    <span className="group-hover:translate-x-1 inline-block transition-transform duration-300">
                      {relatedProduct.name}
                    </span>
                  </h3>
                </Link>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xl font-semibold text-gray-700">
                    ₹{relatedProduct.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => navigate(`/product/${relatedProduct.id}`)}
                    className="bg-gray-100 text-gray-700 p-3 rounded-full shadow-[3px_3px_6px_rgba(0,0,0,0.1),-3px_-3px_6px_rgba(255,255,255,0.8)] hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] transition-all duration-300 flex items-center justify-center"
                    aria-label="Go to product page"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NeumorphicDesign;
