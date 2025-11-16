import { useNavigate } from 'react-router-dom';
import { formatCurrency, humanizeCategory } from '@utils/formatters';
import { MapPin, Store, Heart, Eye } from 'lucide-react';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  // Handle both old and new data formats
  const storeName = product.store_name || product.store_info?.name;
  const storeCity = product.store_city || product.store_info?.city;
  const storeState = product.store_state || product.store_info?.state;
  const productImage = product.images || getProductImage(product.images);

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div
      className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-amber-100 hover:border-amber-300"
      onClick={handleClick}
    >
      {/* Product Image - Like Product Display */}
      <div className="relative overflow-hidden">
        <img
          src={productImage}
          alt={product.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />

        {/* Status Badge - Like Price Tag */}
        {!product.is_active && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">
            Sold Out
          </div>
        )}

        {/* Quick Actions - Like Store Assistant */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex gap-2">
            <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors">
              <Heart className="h-4 w-4 text-red-500" />
            </button>
            <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors">
              <Eye className="h-4 w-4 text-blue-500" />
            </button>
          </div>
        </div>

        {/* Price Tag - Like Real Price Tag */}
        <div className="absolute bottom-3 right-3 bg-primary text-white px-3 py-1 rounded-lg shadow-lg">
          <span className="text-sm font-bold">{formatCurrency(product.price)}</span>
        </div>
      </div>

      {/* Product Details - Like Product Information Card */}
      <div className="p-4 bg-gray-50">
        {/* Category Badge - Like Product Category Label */}
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-semibold text-gray-700 bg-gray-200 px-2 py-1 rounded-full">
            {humanizeCategory(product.category)}
          </span>
        </div>

        {/* Product Name - Like Product Label */}
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Description - Like Product Description Tag */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Store Info - Like Store Information */}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center text-sm text-gray-700 mb-2">
            <Store className="h-4 w-4 mr-2 text-primary" />
            <span className="font-medium line-clamp-1">{storeName}</span>
          </div>

          <div className="flex items-center text-xs text-gray-600">
            <MapPin className="h-3 w-3 mr-1" />
            <span>
              {storeCity && storeState ? `${storeCity}, ${storeState}` : 'Location available'}
            </span>
          </div>
        </div>

        {/* Call to Action - Like "Pick Me Up" */}
        <div className="mt-4 text-center">
          <div className="bg-primary text-white py-2 px-4 rounded-lg font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
            View Details →
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for image handling
function getProductImage(images) {
  if (!images) return '/placeholder-product.jpg';
  if (typeof images === 'string')
    return images.startsWith('http') ? images : '/placeholder-product.jpg';
  if (Array.isArray(images) && images.length > 0) {
    return (
      images.find((i) => typeof i === 'string' && i.startsWith('http')) ||
      '/placeholder-product.jpg'
    );
  }
  return '/placeholder-product.jpg';
}

export default ProductCard;
