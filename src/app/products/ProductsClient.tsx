'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import Banner10 from '@/components/Banner/Banner10';
import {
  Search,
  X,
  SlidersHorizontal,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const ContactForm = dynamic(() => import('@/components/ContactForm'));

const categories = ['14 Digits', '12 Digits', '8 Digits', 'Scientific Calculator'];
const priceRanges = [
  { value: '0-200', label: '₹0 - ₹200' },
  { value: '200-300', label: '₹200 - ₹300' },
  { value: '300-400', label: '₹300 - ₹400' },
  { value: '400-500', label: '₹400 - ₹500' },
  { value: '500-100000', label: 'Above ₹500' },
];

export default function ProductsClient({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [expandedSections, setExpandedSections] = useState({ categories: true, price: true });

  const { addToCart } = useCartStore();

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section as keyof typeof prev] }));
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handlePriceRangeChange = (range: { value: string; label: string }) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(range.value) ? prev.filter((r) => r !== range.value) : [...prev, range.value]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRanges([]);
    setSearchTerm('');
    setSortBy('featured');
  };

  const hasActiveFilters =
    selectedCategories.length > 0 || selectedPriceRanges.length > 0 || searchTerm;

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(product.category ?? '');
      const matchesPriceRange =
        selectedPriceRanges.length === 0 ||
        selectedPriceRanges.some((range) => {
          const [min, max] = range.split('-').map(Number);
          return product.price >= min && product.price <= max;
        });
      return matchesSearch && matchesCategory && matchesPriceRange;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low-high': return a.price - b.price;
        case 'price-high-low': return b.price - a.price;
        case 'name-a-z': return a.name.localeCompare(b.name);
        case 'name-z-a': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });

  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all duration-200 bg-gray-50 hover:bg-white"
        />
      </div>

      {/* Categories */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-700">Categories</h3>
          <button onClick={() => toggleSection('categories')} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            {expandedSections.categories ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
          </button>
        </div>
        {expandedSections.categories && (
          <div className="space-y-3">
            {categories.map((category) => (
              <label key={category} className="flex items-center gap-3 cursor-pointer group py-1">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="w-5 h-5 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  {selectedCategories.includes(category) && (
                    <Check className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
                <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Ranges */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-700">Price Range</h3>
          <button onClick={() => toggleSection('price')} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            {expandedSections.price ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
          </button>
        </div>
        {expandedSections.price && (
          <div className="space-y-3">
            {priceRanges.map((range) => (
              <label key={range.value} className="flex items-center gap-3 cursor-pointer group py-1">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedPriceRanges.includes(range.value)}
                    onChange={() => handlePriceRangeChange(range)}
                    className="w-5 h-5 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  {selectedPriceRanges.includes(range.value) && (
                    <Check className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
                <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{range.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0efef] pt-16 pb-8">
      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
        <Banner10 />

        {/* Top Bar */}
        <div className="py-4">
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
            <div>
              <button
                onClick={() => setShowFilters(true)}
                className="md:hidden flex items-center gap-2 px-5 py-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-200 text-blue-600"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden md:block w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 backdrop-blur-lg bg-opacity-90">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-semibold text-gray-800">Filters</h2>
                {hasActiveFilters && (
                  <button onClick={clearAllFilters} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Clear All
                  </button>
                )}
              </div>
              <FilterPanel />
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-[#e0dede] rounded-2xl shadow-lg overflow-hidden group hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <Link href={`/product/${product.id}`} className="block relative">
                      <div className="relative w-full aspect-square">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transform transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      {product.inStock ? (
                        <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                          In Stock
                        </span>
                      ) : (
                        <span className="absolute top-4 right-4 bg-red-400 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                          Out of Stock
                        </span>
                      )}
                    </Link>
                    <div className="p-6">
                      <p className="font-mono text-gray-600 text-xl font-bold lg:text-[18px] lg:font-semibold">
                        {product.rating}
                      </p>
                      <Link href={`/product/${product.id}`}>
                        <h3 className="text-3xl font-bold lg:text-[25px] lg:font-semibold mb-4 text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      <hr className="card-divider" />
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[#112a46] text-2xl font-bold lg:text-xl lg:font-semibold font-roboto">
                          <del>₹{product.prevprice}</del>&nbsp;₹{product.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => addToCart(product)}
                          disabled={!product.inStock}
                          className={`card-btn px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-all duration-200 ${
                            product.inStock
                              ? 'hover:border-green-700 hover:bg-green-700 shadow-md hover:shadow-lg'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path d="m397.78 316h-205.13a15 15 0 0 1 -14.65-11.67l-34.54-150.48a15 15 0 0 1 14.62-18.36h274.27a15 15 0 0 1 14.65 18.36l-34.6 150.48a15 15 0 0 1 -14.62 11.67zm-193.19-30h181.25l27.67-120.48h-236.6z" />
                            <path d="m222 450a57.48 57.48 0 1 1 57.48-57.48 57.54 57.54 0 0 1 -57.48 57.48zm0-84.95a27.48 27.48 0 1 0 27.48 27.47 27.5 27.5 0 0 0 -27.48-27.47z" />
                            <path d="m368.42 450a57.48 57.48 0 1 1 57.48-57.48 57.54 57.54 0 0 1 -57.48 57.48zm0-84.95a27.48 27.48 0 1 0 27.48 27.47 27.5 27.5 0 0 0 -27.48-27.47z" />
                            <path d="m158.08 165.49a15 15 0 0 1 -14.23-10.26l-25.71-77.23h-47.44a15 15 0 1 1 0-30h58.3a15 15 0 0 1 14.23 10.26l29.13 87.49a15 15 0 0 1 -14.23 19.74z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                <Search className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">No products found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Try adjusting your filters or search term
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 right-36 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
              <FilterPanel />
            </div>
            <div className="border-t p-6">
              <button
                onClick={() => setShowFilters(false)}
                className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-colors font-medium text-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <ContactForm
        isOpen={showContactForm}
        onClose={() => setShowContactForm(!showContactForm)}
      />
    </div>
  );
}
