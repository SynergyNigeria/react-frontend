import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CATEGORIES } from '@config/apiConfig';
import ProductCard from '@components/common/ProductCard';
import Spinner from '@components/common/Spinner';
import BottomNav from '@components/layout/BottomNav';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useDebounce } from '@hooks/useDebounce';
import { useProducts } from '@hooks/useAPI';

const ProductList = () => {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);

  const debouncedSearch = useDebounce(searchTerm, 800);
  const debouncedCategory = useDebounce(activeCategory, 300);

  // Get store_id from URL params if present
  const storeId = searchParams.get('store_id');

  // Category mapping functions
  const categoryDisplayToBackend = (displayName) => {
    const categoryMap = {
      All: null,
      'Men Clothes': 'mens_clothes',
      'Ladies Clothes': 'ladies_clothes',
      'Kids Clothes': 'kids_clothes',
      Beauty: 'beauty',
      'Body Accessories': 'body_accessories',
      'Clothing Extras': 'clothing_extras',
      Bags: 'bags',
      Wigs: 'wigs',
      'Body Scents': 'body_scents',
    };
    return categoryMap[displayName] || null;
  };

  // Use React Query hook for products
  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isLoading,
    error,
  } = useProducts(
    debouncedCategory && debouncedCategory !== 'all'
      ? categoryDisplayToBackend(debouncedCategory)
      : null,
    debouncedSearch && debouncedSearch.length >= 2 ? debouncedSearch : null,
    storeId
  );

  // Flatten products from all pages
  const allProducts = productsData?.pages.flatMap((page) => page.results || []) || [];

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || !hasNextPage) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 300) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, hasNextPage, fetchNextPage]);

  // Handle search input
  const handleSearchChange = (e) => {
    const value = e.target.value.trim();
    setSearchTerm(value);
  };

  // Toggle category filter
  const toggleCategoryFilter = (categoryName) => {
    if (activeCategory === categoryName) {
      // Deactivate - show all
      setActiveCategory('all');
    } else {
      // Activate
      setActiveCategory(categoryName);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Search and Filter Section */}
      <div className="bg-gray-50 border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Toggle Button */}
          <div className="flex justify-center py-3">
            <button
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 transition-all"
            >
              <span className="text-sm font-medium">
                {isSearchExpanded ? 'Hide Search & Filters' : 'Show Search & Filters'}
              </span>
              {isSearchExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Expandable Content */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isSearchExpanded ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'
            }`}
          >
            {/* Search Bar */}
            <div className="relative mb-6 max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategoryFilter(category.name)}
                  className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap transition-all font-medium ${
                    activeCategory === category.name
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-800">
                  {error?.message || 'Failed to load products. Please try again.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {allProducts.length === 0 && !isLoading ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛍️</div>
            <p className="text-gray-800 text-xl font-medium">
              {debouncedSearch ? 'No products found' : 'No products available'}
            </p>
            <p className="text-gray-600 mt-2">
              {debouncedSearch
                ? 'Try adjusting your search terms or browse all products.'
                : 'Check back later for new products.'}
            </p>
            {debouncedSearch && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-colors"
              >
                View All Products
              </button>
            )}
          </div>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            id="productGrid"
          >
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 text-gray-600 justify-center py-8">
            <div className="animate-spin h-6 w-6">
              <Spinner size="md" />
            </div>
            <span className="font-medium">Loading products...</span>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default ProductList;
