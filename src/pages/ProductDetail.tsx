import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { products } from "../data/products"; // Assuming this is in a separate file
import { useCart } from "../context/CartContext"; // And this as well
import Banner10 from "../components/Banner/Banner10";
import {
  ShoppingCart,
  Share2,
  Shield,
  Truck,
  Package,
  ChevronRight,
  Check,
  ArrowLeft,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
} from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === Number(id));
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  // const [showReviewForm, setShowReviewForm] = useState(false);

  // Define custom demo images for each product
  const getProductImages = (product) => {
    if (!product) return [];

    // Use product images if available, otherwise generate custom demo images
    if (product.images && product.images.length >= 4) {
      return product.images;
    }

    // Generate custom demo images based on product category
    const baseImage = product.image;

    // Different angles/views for the product
    return [
      baseImage,
      "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=800&q=80", // Different angle
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", // Lifestyle shot
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80", // Detail shot
    ];
  };

  // Get product images
  const productImages = getProductImages(product);

  // Check if product is in cart
  const isInCart = cart.some((item) => item.id === Number(id));

  // Handle quantity change
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
    }
  };

  // Handle share
  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this ${product?.name} on ShopHub!`;

    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(url)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url
        )}`;
        break;
      case "copy":
        navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        break;
      default:
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }

    if (platform !== "copy") {
      setShowShareOptions(false);
    }
  };

  // Handle wishlist toggle
  const toggleWishlist = () => {
    setWishlist(!wishlist);
  };

  // Related products with random selection
  const relatedProducts = products.filter((p) => p.id !== Number(id));

  // Function to shuffle an array (Fisher-Yates algorithm for efficiency)
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  };

  const shuffledRelatedProducts = shuffleArray(relatedProducts);
  const randomRelatedProducts = shuffledRelatedProducts.slice(0, 4);

  useEffect(() => {
    // Reset selected image when product changes
    setSelectedImage(0);
    setQuantity(1);
    setActiveTab("description");
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    return (
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/products")}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Products
            </button>
          </div>
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <p className="text-gray-600 mb-8">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 bg-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <Banner10 />
        <div className="flex items-center text-sm text-gray-500 py-4">
          <button onClick={() => navigate("/")} className="hover:text-gray-700">
            Home
          </button>
          <ChevronRight className="w-4 h-4 mx-2" />
          <button
            onClick={() => navigate("/products")}
            className="hover:text-gray-700"
          >
            Products
          </button>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-700 font-medium truncate">
            {product.name}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 p-6">
            {/* Product Images - Left Column (Desktop) */}

            {/* Main Product Image */}
            <div className="lg:col-span-1 ">
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="h-auto w-auto object-cover transition-transform duration-300 hover:scale-105"
                />
                {product.inStock ? (
                  <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    In Stock
                  </div>
                ) : (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Out of Stock
                  </div>
                )}
              </div>

              <div className="hidden lg:block lg:col-span-1 space-x-10 sticky top-12 self-start gap-12">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative rounded-lg overflow-hidden w-[115px] aspect-square ${
                      selectedImage === index
                        ? "ring-2 ring-blue-500"
                        : "hover:ring-2 hover:ring-blue-300"
                    } transition-all duration-200`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {selectedImage === index && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-10" />
                    )}
                  </button>
                ))}
              </div>

              {/* Product Thumbnails - Mobile & Tablet */}
              <div className="grid grid-cols-4 gap-2 lg:hidden">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative rounded-lg overflow-hidden aspect-square ${
                      selectedImage === index
                        ? "ring-2 ring-blue-500"
                        : "hover:ring-2 hover:ring-blue-300"
                    } transition-all duration-200`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6 lg:pl-24">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {product.name}
                  </h1>
                </div>

                {/* Highlights */}
                {product.highlights && (
                  <div className="mb-6 py-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Highlights
                    </h3>
                    <ul className="space-y-2">
                      {product.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-600">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="text-2xl font-bold">
                  <del>₹{product.prevprice}</del>
                </div>
                <div className="text-3xl font-bold mb-6 text-blue-600">
                  ₹{product.price.toFixed(2)}
                </div>
                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        handleQuantityChange(parseInt(e.target.value) || 1)
                      }
                      className="w-16 px-3 py-2 border-t border-b border-gray-300 text-center focus:outline-none"
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="px-3 py-2 border border-gray-300 rounded-r-md bg-gray-50 text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <button
                    onClick={
                      isInCart ? () => navigate("/cart") : handleAddToCart
                    }
                    disabled={!product.inStock}
                    className={`py-3 px-6 rounded-lg flex items-center justify-center gap-2 ${
                      isInCart
                        ? "bg-orange-400 hover:bg-orange-500"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white transition-colors`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {isInCart ? "View Cart" : "Add to Cart"}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowShareOptions(!showShareOptions)}
                      className="py-3 px-6 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center gap-2 text-gray-700 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      Share
                    </button>

                    {showShareOptions && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 p-2">
                        <button
                          onClick={() => handleShare("facebook")}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 rounded-md"
                        >
                          <Facebook className="w-5 h-5 text-blue-600" />
                          <span>Facebook</span>
                        </button>
                        <button
                          onClick={() => handleShare("twitter")}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 rounded-md"
                        >
                          <Twitter className="w-5 h-5 text-blue-400" />
                          <span>Twitter</span>
                        </button>
                        <button
                          onClick={() => handleShare("linkedin")}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 rounded-md"
                        >
                          <Linkedin className="w-5 h-5 text-blue-700" />
                          <span>LinkedIn</span>
                        </button>
                        <button
                          onClick={() => handleShare("copy")}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 rounded-md"
                        >
                          <Copy className="w-5 h-5 text-gray-600" />
                          <span>{copied ? "Copied!" : "Copy Link"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping & Returns */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">
                        Free Shipping
                      </h4>
                      <p className="text-sm text-blue-700">
                        Free standard shipping on orders over ₹499
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">
                        Secure Payment
                      </h4>
                      <p className="text-sm text-green-700">
                        Your payment information is processed securely
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <Package className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-900">
                        Easy Returns
                      </h4>
                      <p className="text-sm text-purple-700">
                        7 day return policy for eligible items
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-12">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab("description")}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                  activeTab === "description"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("specifications")}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                  activeTab === "specifications"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Specifications
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <p className="mb-4">{product.description}</p>
                <h3 className="text-lg font-semibold mb-3">Features</h3>
                <ul className="space-y-2">
                  {(
                    product.features || [
                      "Premium Quality",
                      "Durable Construction",
                      "Ergonomic Design",
                      "User-Friendly Interface",
                      "Energy Efficient",
                    ]
                  ).map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === "specifications" && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Technical Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <table className="w-full">
                      <tbody>
                        {Object.entries(
                          product.specifications || {
                            Brand: "ShopHub",
                            Model: `SH-${product.id}`,
                            Warranty: "1 Year",
                            "Country of Origin": "India",
                            Color: "Black",
                          }
                        ).map(([key, value], index) => (
                          <tr
                            key={index}
                            className={index % 2 === 0 ? "bg-gray-100" : ""}
                          >
                            <td className="py-2 px-4 font-medium text-gray-700">
                              {key}
                            </td>
                            <td className="py-2 px-4 text-gray-600">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">What&apos;s in the Box</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-gray-600">{product.name}</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-gray-600">User Manual</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-gray-600">Warranty Card</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mb-12 px-6">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {randomRelatedProducts.map((relatedProduct) => (
              <div
                key={relatedProduct.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow p-0"
              >
                <Link
                  to={`/product/${relatedProduct.id}`}
                  className="block relative group"
                >
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="w-auto h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                </Link>
                <div className="p-4 bg-slate-300">
                  <Link to={`/product/${relatedProduct.id}`}>
                    <h3 className="text-lg font-semibold mb-2 hover:text-blue-600 transition-colors">
                      {relatedProduct.name}
                    </h3>
                  </Link>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-blue-600">
                      ₹{relatedProduct.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => {
                        addToCart(relatedProduct);
                        navigate(`/product/${relatedProduct.id}`);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
