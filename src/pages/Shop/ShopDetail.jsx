import { useParams } from 'react-router-dom';
import { useShop, useShopProducts } from '@hooks/useAPI';
import ProductCard from '@components/common/ProductCard';
import Spinner from '@components/common/Spinner';
import { MapPin, Star, Package, ArrowLeft, ArrowUp } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { humanizeCategory } from '@utils/formatters';

const ShopDetail = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { data: shop, isLoading: shopLoading, error: shopError } = useShop(shopId);
  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isLoading: productsLoading,
    error: productsError,
  } = useShopProducts(shopId);

  const products = productsData?.pages.flatMap((page) => page.results) || [];

  // Handle scroll to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Handle authentication errors
  if (shopError?.response?.status === 401 || productsError?.response?.status === 401) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view shop details</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (shopLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Shop Not Found</h2>
          <p className="text-gray-600">The shop you&apos;re looking for doesn&apos;t exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Mat - Back Button */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-primary transition-all duration-200 hover:bg-gray-50 px-3 py-2 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Exit Shop</span>
          </button>
        </div>
      </div>

      {/* Shop Entrance - Hero Banner */}
      <div className="relative overflow-hidden bg-white">
        {/* Seller Photo Banner */}
        <div
          className="relative h-64 md:h-80 overflow-hidden"
          style={{
            backgroundImage: shop.seller_photo ? `url('${shop.seller_photo}')` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Warm lighting overlay */}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      </div>

      {/* Shop Branding Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {shop?.name || 'Our Shop'}
            </h1>
            {shop?.description && (
              <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                {shop.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Shop Stats - Compact */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap justify-center gap-6 text-center">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900">
                {shop?.average_rating ? parseFloat(shop.average_rating).toFixed(1) : '0.0'}
              </span>
              {shop?.review_count !== undefined && (
                <span className="text-gray-500 text-sm">({shop.review_count})</span>
              )}
            </div>

            {/* Product Count */}
            {shop?.product_count !== undefined && (
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <span className="font-medium text-gray-900">{shop.product_count} Products</span>
              </div>
            )}

            {/* Location */}
            {shop?.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-medium text-gray-900">{shop.location}</span>
              </div>
            )}
          </div>

          {/* Category Tag */}
          {shop?.category && (
            <div className="flex justify-center mt-4">
              <span className="inline-block px-4 py-2 bg-primary text-white font-semibold rounded-full text-sm">
                {humanizeCategory(shop.category)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Product Shelves - Main Shopping Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
            <div className="text-8xl mb-6">🏪</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Shop Under Construction</h3>
            <p className="text-gray-700 text-lg mb-2">We&apos;re still stocking our shelves!</p>
            <p className="text-gray-600">Check back soon for amazing products</p>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={products.length}
            next={fetchNextPage}
            hasMore={hasNextPage}
            loader={
              <div className="flex justify-center py-12">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-700 font-medium">Loading more products...</p>
                </div>
              </div>
            }
            endMessage={
              <div className="text-center py-12">
                <div className="bg-green-50 rounded-2xl p-8 border border-green-200 shadow-lg">
                  <div className="text-6xl mb-4">🎉</div>
                  <p className="text-green-800 font-bold text-lg">
                    You&apos;ve explored our entire collection!
                  </p>
                  <p className="text-green-600 mt-2">Thank you for visiting our shop</p>
                </div>
              </div>
            }
          >
            {/* Product Shelves Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {products
                .filter((product) => product && product.id)
                .map((product) => (
                  <div
                    key={product.id}
                    className="transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                  >
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:border-primary transition-all duration-300">
                      <ProductCard product={product} />
                    </div>
                  </div>
                ))}
            </div>
          </InfiniteScroll>
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-50 animate-bounce-gentle"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default ShopDetail;
