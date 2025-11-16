import { useState } from 'react';
import { useShops } from '@hooks/useAPI';
import { CATEGORIES } from '@config/apiConfig';
import ShopCard from '@components/common/ShopCard';
import Spinner from '@components/common/Spinner';
import Header from '@components/layout/Header';
import BottomNav from '@components/layout/BottomNav';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebounce } from '@hooks/useDebounce';

const ShopList = () => {
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, fetchNextPage, hasNextPage, isLoading, isError } = useShops(
    category === 'all' ? null : category,
    debouncedSearch
  );

  const shops = data?.pages.flatMap((page) => page.results) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Failed to load shops. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header showLogo={true} />

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
                placeholder="Search shops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap transition-all font-medium ${
                    category === cat.id
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Shops Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {shops.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏪</div>
            <p className="text-gray-800 text-xl font-medium">No shops found</p>
            <p className="text-gray-600 mt-2">Try adjusting your search or category filter</p>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={shops.length}
            next={fetchNextPage}
            hasMore={hasNextPage}
            loader={
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            }
            endMessage={
              <p className="text-center text-gray-700 py-8 font-medium">
                🎉 You&apos;ve explored all our amazing shops!
              </p>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {shops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          </InfiniteScroll>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default ShopList;
