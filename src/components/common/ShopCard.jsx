import { Star, MapPin, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { humanizeCategory } from '@utils/formatters';

const ShopCard = ({ shop }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/shop/${shop.id}`);
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
      onClick={handleClick}
    >
      {/* Shop Banner - Full Width, Reduced Height */}
      <div className="h-36 w-full overflow-hidden bg-gradient-to-r from-gray-100 to-gray-50">
        {shop.logo ? (
          <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary">
            {shop.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Shop Details - Compact Layout */}
      <div className="px-4 py-3">
        <h3 className="font-bold text-base text-gray-900 mb-1 truncate">{shop.name}</h3>

        {shop.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-1">{shop.description}</p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{shop.average_rating ? parseFloat(shop.average_rating).toFixed(1) : '0.0'}</span>
          </div>

          {shop.product_count !== undefined && (
            <div className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              <span>{shop.product_count}</span>
            </div>
          )}
        </div>

        {shop.location && (
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="truncate">{shop.location}</span>
          </div>
        )}

        {shop.category && (
          <div className="mt-1">
            <span className="inline-block px-2 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full border border-primary/20">
              {humanizeCategory(shop.category)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopCard;
