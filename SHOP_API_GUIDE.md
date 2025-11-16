# COVU Marketplace Shop API Documentation

## Overview

This document provides comprehensive guidance for integrating with the COVU Marketplace Shop API in React applications. The API handles store listings, store details, ratings, and reviews.

## Base Configuration

```javascript
// API Configuration
const API_CONFIG = {
  BASE_URL: 'https://covu.onrender.com/api',
  ENDPOINTS: {
    STORES: '/stores/',
    STORE_DETAIL: (id) => `/stores/${id}/`,
    STORE_PRODUCTS: (id) => `/stores/${id}/products/`,
    MY_STORES: '/stores/my_stores/',
    STORE_RATING_STATS: (id) => `/ratings/store/${id}/stats/`,
    STORE_RATINGS: '/ratings/',
    MY_RATINGS: '/ratings/my-ratings/'
  }
};
```

## Authentication

All shop API calls require JWT authentication. Include the Bearer token in the Authorization header.

### Token Management in React

```javascript
// AuthService.jsx
class AuthService {
  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  setTokens(accessToken, refreshToken) {
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();
```

### API Request Wrapper

```javascript
// apiClient.js
class APIClient {
  constructor() {
    this.baseURL = 'https://covu.onrender.com/api';
  }

  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      data = null,
      params = null,
      requiresAuth = true
    } = options;

    let url = `${this.baseURL}${endpoint}`;
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }

    const headers = { 'Content-Type': 'application/json' };

    if (requiresAuth) {
      const token = authService.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const config = { method, headers };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      config.body = JSON.stringify(data);
    }

    let response = await fetch(url, config);

    // Handle token refresh on 401
    if (response.status === 401 && requiresAuth) {
      try {
        await this.refreshAccessToken();
        // Retry with new token
        const newToken = authService.getAccessToken();
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, { ...config, headers });
      } catch (refreshError) {
        authService.logout();
        window.location.href = '/login';
        throw refreshError;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Request failed');
    }

    return response.json();
  }

  async refreshAccessToken() {
    const refreshToken = authService.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');

    const response = await fetch(`${this.baseURL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken })
    });

    if (!response.ok) throw new Error('Token refresh failed');

    const data = await response.json();
    authService.setTokens(data.access);
    return data.access;
  }

  // Convenience methods
  get(endpoint, params = null, requiresAuth = true) {
    return this.request(endpoint, { method: 'GET', params, requiresAuth });
  }

  post(endpoint, data, requiresAuth = true) {
    return this.request(endpoint, { method: 'POST', data, requiresAuth });
  }

  put(endpoint, data, requiresAuth = true) {
    return this.request(endpoint, { method: 'PUT', data, requiresAuth });
  }

  patch(endpoint, data, requiresAuth = true) {
    return this.request(endpoint, { method: 'PATCH', data, requiresAuth });
  }

  delete(endpoint, requiresAuth = true) {
    return this.request(endpoint, { method: 'DELETE', requiresAuth });
  }
}

export const apiClient = new APIClient();
```

## Shop API Endpoints

### 1. Get Stores List

**Endpoint:** `GET /api/stores/`

**Query Parameters:**
- `page` (integer): Page number for pagination (default: 1)
- `page_size` (integer): Items per page (default: 20, max: 100)
- `search` (string): Search term for store name/description
- `category` (string): Filter by store category

**Response:**
```json
{
  "count": 50,
  "next": "https://covu.onrender.com/api/stores/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Fashion Hub",
      "description": "Premium fashion for everyone",
      "logo": "https://res.cloudinary.com/.../store-logo.jpg",
      "seller_photo": "https://res.cloudinary.com/.../seller.jpg",
      "city": "Lagos",
      "state": "Lagos",
      "average_rating": 4.5,
      "total_ratings": 25,
      "product_count": 15,
      "delivery_within_lga": 1500.00,
      "delivery_outside_lga": 2500.00,
      "delivery_outside_state": 3500.00
    }
  ]
}
```

**React Implementation:**

```javascript
// ShopList.jsx
import React, { useState, useEffect } from 'react';
import { apiClient } from './apiClient';

const ShopList = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    page: 1
  });
  const [hasMore, setHasMore] = useState(true);

  const loadShops = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: reset ? 1 : filters.page,
        page_size: 20,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await apiClient.get('/stores/', params);

      const newShops = response.results.map(transformShopData);

      if (reset) {
        setShops(newShops);
      } else {
        setShops(prev => [...prev, ...newShops]);
      }

      setHasMore(!!response.next);
      setFilters(prev => ({ ...prev, page: reset ? 2 : prev.page + 1 }));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const transformShopData = (shop) => ({
    id: shop.id,
    name: shop.name,
    description: shop.description,
    logo: shop.logo?.startsWith('http')
      ? shop.logo
      : 'https://res.cloudinary.com/dpmxcjkfl/image/upload/v1762101365/SELLER_z35tl4.png',
    sellerPhoto: shop.seller_photo?.startsWith('http')
      ? shop.seller_photo
      : 'https://res.cloudinary.com/dpmxcjkfl/image/upload/v1762102095/covu-flyer_hotir6.png',
    location: `${shop.city}, ${shop.state}`,
    rating: parseFloat(shop.average_rating) || 0,
    totalRatings: shop.total_ratings || 0,
    productCount: shop.product_count || 0,
    delivery: {
      withinLGA: shop.delivery_within_lga,
      outsideLGA: shop.delivery_outside_lga,
      outsideState: shop.delivery_outside_state
    }
  });

  useEffect(() => {
    loadShops(true);
  }, [filters.search, filters.category]);

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleCategoryFilter = (category) => {
    setFilters(prev => ({ ...prev, category, page: 1 }));
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        if (!loading && hasMore) {
          loadShops();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="shop-list">
      {/* Search and filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search shops..."
          onChange={(e) => handleSearch(e.target.value)}
          value={filters.search}
        />
        <select
          value={filters.category}
          onChange={(e) => handleCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="fashion">Fashion</option>
          <option value="beauty">Beauty</option>
          {/* ... other categories */}
        </select>
      </div>

      {/* Shops grid */}
      <div className="shops-grid">
        {shops.map(shop => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>

      {loading && <div className="loading">Loading...</div>}
    </div>
  );
};

export default ShopList;
```

### 2. Get Shop Details

**Endpoint:** `GET /api/stores/{id}/`

**Response:**
```json
{
  "id": 1,
  "name": "Fashion Hub",
  "description": "Premium fashion for everyone",
  "logo": "https://res.cloudinary.com/.../store-logo.jpg",
  "seller_photo": "https://res.cloudinary.com/.../seller.jpg",
  "city": "Lagos",
  "state": "Lagos",
  "average_rating": 4.5,
  "total_ratings": 25,
  "product_count": 15,
  "delivery_within_lga": 1500.00,
  "delivery_outside_lga": 2500.00,
  "delivery_outside_state": 3500.00,
  "products": [
    {
      "id": 1,
      "name": "Classic T-Shirt",
      "price": "2500.00",
      "images": "https://res.cloudinary.com/.../product.jpg",
      "category": "mens_clothes",
      "is_active": true
    }
  ]
}
```

### 3. Get Shop Rating Statistics

**Endpoint:** `GET /api/ratings/store/{store_id}/stats/`

**Response:**
```json
{
  "store_id": 1,
  "average_rating": 4.5,
  "total_ratings": 25,
  "rating_distribution": {
    "5": 15,
    "4": 6,
    "3": 3,
    "2": 1,
    "1": 0
  }
}
```

### 4. Get Shop Reviews

**Endpoint:** `GET /api/ratings/?store={store_id}`

**Query Parameters:**
- `store` (integer): Store ID to filter reviews
- `page` (integer): Page number for pagination
- `page_size` (integer): Items per page

**Response:**
```json
{
  "count": 25,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "store_id": 1,
      "buyer_name": "John Doe",
      "rating": 5,
      "review": "Excellent products and fast delivery!",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**React Shop Detail Modal Implementation:**

```javascript
// ShopDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { apiClient } from './apiClient';

const ShopDetailModal = ({ shopId, isOpen, onClose }) => {
  const [shop, setShop] = useState(null);
  const [ratingStats, setRatingStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && shopId) {
      loadShopDetails();
    }
  }, [isOpen, shopId]);

  const loadShopDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load shop details, rating stats, and reviews in parallel
      const [shopData, statsData, reviewsData] = await Promise.all([
        apiClient.get(`/stores/${shopId}/`),
        apiClient.get(`/ratings/store/${shopId}/stats/`),
        apiClient.get('/ratings/', { store: shopId, page_size: 2 })
      ]);

      setShop(transformShopData(shopData));
      setRatingStats(statsData);
      setReviews(reviewsData.results || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const transformShopData = (shop) => ({
    id: shop.id,
    name: shop.name,
    description: shop.description,
    logo: shop.logo?.startsWith('http')
      ? shop.logo
      : 'https://res.cloudinary.com/dpmxcjkfl/image/upload/v1762101365/SELLER_z35tl4.png',
    sellerPhoto: shop.seller_photo?.startsWith('http')
      ? shop.seller_photo
      : 'https://res.cloudinary.com/dpmxcjkfl/image/upload/v1762102095/covu-flyer_hotir6.png',
    location: `${shop.city}, ${shop.state}`,
    products: shop.products || [],
    delivery: {
      withinLGA: shop.delivery_within_lga,
      outsideLGA: shop.delivery_outside_lga,
      outsideState: shop.delivery_outside_state
    }
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const createStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400 opacity-50">★</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
    }

    return stars;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-600 hover:text-gray-800 transition-all rounded-full p-2 shadow-lg"
        >
          ✕
        </button>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">
            Error: {error}
          </div>
        ) : shop ? (
          <>
            {/* Shop Banner with Seller Photo */}
            <div
              className="relative h-64 bg-gradient-to-br from-orange-400 to-orange-500 overflow-hidden"
              style={{
                backgroundImage: shop.logo ? `url('${shop.logo}')` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Background pattern overlay */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16"></div>
              </div>
              {/* Dark overlay for readability */}
              <div className="absolute inset-0 bg-black opacity-40"></div>

              {/* Seller Profile Picture - Centered */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={shop.sellerPhoto}
                  alt={shop.name}
                  className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-2xl z-10"
                />
              </div>
            </div>

            {/* Shop Info */}
            <div className="p-6 border-b border-gray-200">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{shop.name}</h3>
                <p className="text-gray-600 mb-4 max-w-2xl mx-auto">{shop.description}</p>

                {/* Rating */}
                <div className="flex items-center justify-center mb-2">
                  <div className="flex text-yellow-400 mr-2">
                    {ratingStats ? createStars(parseFloat(ratingStats.average_rating)) : createStars(0)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {ratingStats ?
                      `${parseFloat(ratingStats.average_rating).toFixed(1)} (${ratingStats.total_ratings} reviews)` :
                      'No ratings yet'
                    }
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center justify-center text-sm text-gray-500">
                  📍 {shop.location}
                </div>
              </div>

              {/* Rating Section */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Store Ratings</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>ℹ️</span>
                  <span>You can rate this store after completing a purchase</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Ratings can be submitted from your confirmed orders</p>
              </div>

              {/* Recent Reviews */}
              {reviews.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Reviews</h4>
                  {reviews.map(review => (
                    <div key={review.id} className="mb-3 p-3 bg-gray-100 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800 text-xs">
                          {review.buyer_name || 'User'}
                        </span>
                        <span className="text-yellow-400 text-xs">
                          {'★'.repeat(review.rating)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-700">{review.review}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Products Section */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Products</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {shop.products.length > 0 ? (
                  shop.products.map(product => (
                    <div
                      key={product.id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
                      onClick={() => window.location.href = `/product-detail.html?id=${product.id}`}
                    >
                      <img
                        src={product.images?.startsWith('http') ? product.images :
                             'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop'}
                        alt={product.name}
                        className="w-full h-32 object-cover"
                        loading="lazy"
                      />
                      <div className="p-3">
                        <h4 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-orange-600 font-semibold">
                          {formatPrice(parseFloat(product.price))}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📦</div>
                    <p>No products available yet</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ShopDetailModal;
```

## Shop Card Component

```javascript
// ShopCard.jsx
import React from 'react';

const ShopCard = ({ shop, onClick }) => {
  const createStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400 opacity-50">★</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
    }

    return stars;
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => onClick(shop.id)}
    >
      <img
        src={shop.logo}
        alt={shop.name}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{shop.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{shop.description}</p>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400 mr-2">
            {createStars(shop.rating)}
          </div>
          <span className="text-sm text-gray-600">
            {shop.rating > 0 ? `${shop.rating.toFixed(1)} (${shop.totalRatings})` : 'No ratings yet'}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          📍 {shop.location}
        </div>

        {/* Product count */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          📦 {shop.productCount} products
        </div>

        <button className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors">
          View Store
        </button>
      </div>
    </div>
  );
};

export default ShopCard;
```

## Image Handling

### Shop Images

Shops have two types of images:
1. **Store Logo**: Used as banner background in the modal
2. **Seller Photo**: Profile picture displayed centered on the banner

```javascript
const getShopImages = (shop) => {
  return {
    logo: shop.logo?.startsWith('http')
      ? shop.logo
      : 'https://res.cloudinary.com/dpmxcjkfl/image/upload/v1762101365/SELLER_z35tl4.png',
    sellerPhoto: shop.seller_photo?.startsWith('http')
      ? shop.seller_photo
      : 'https://res.cloudinary.com/dpmxcjkfl/image/upload/v1762102095/covu-flyer_hotir6.png'
  };
};
```

## Error Handling

### Shop API Error Scenarios

1. **404 Not Found**: Shop doesn't exist
2. **403 Forbidden**: Shop is inactive or blocked
3. **401 Unauthorized**: Authentication required

```javascript
// ShopErrorBoundary.jsx
import React from 'react';

class ShopErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Shop API Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="shop-error">
          <h2>Unable to load shop</h2>
          <p>{this.state.error?.message || 'Something went wrong'}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ShopErrorBoundary;
```

## Performance Optimization

### Infinite Scroll for Shop List

```javascript
// useInfiniteScroll.js
import { useEffect, useRef } from 'react';

const useInfiniteScroll = (callback, hasMore) => {
  const observer = useRef();

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        if (hasMore && !loading) {
          callback();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [callback, hasMore]);

  return observer;
};
```

### Shop Data Caching

```javascript
// shopCache.js
class ShopCache {
  constructor() {
    this.cache = new Map();
    this.maxAge = 5 * 60 * 1000; // 5 minutes
  }

  set(shopId, data) {
    this.cache.set(shopId, {
      data,
      timestamp: Date.now()
    });
  }

  get(shopId) {
    const cached = this.cache.get(shopId);
    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      return cached.data;
    }
    this.cache.delete(shopId);
    return null;
  }

  clear() {
    this.cache.clear();
  }
}

export const shopCache = new ShopCache();
```

## Summary of Shop Detail Popup

The shop detail popup from the shop-list page displays comprehensive information about a seller's store:

### Visual Layout:
1. **Banner Section**: Store logo as background with gradient overlay
2. **Profile Picture**: Seller's photo centered on the banner
3. **Store Information**: Name, description, rating, location
4. **Rating Section**: Current rating stats and user rating status
5. **Recent Reviews**: 2 random reviews from customers
6. **Products Grid**: All products from the store

### API Calls Made:
1. `GET /api/stores/{id}/` - Fetches store details and products
2. `GET /api/ratings/store/{id}/stats/` - Gets rating statistics
3. `GET /api/ratings/?store={id}&page_size=2` - Gets recent reviews
4. `GET /api/ratings/my-ratings/` - Checks if user has rated this store

### Key Features:
- **Responsive Design**: Works on mobile and desktop
- **Image Optimization**: Cloudinary URLs with fallbacks
- **Rating Display**: Star ratings with review counts
- **Product Integration**: Direct links to product detail pages
- **User Rating Status**: Shows if user can/has rated the store
- **Review Display**: Shows recent customer feedback

### Technical Implementation:
- Modal overlay with backdrop
- Lazy loading for images
- Error handling for failed API calls
- Loading states during data fetch
- Close button and click-outside-to-close functionality

This popup provides a complete view of the seller's store, helping customers make informed purchasing decisions by showing the seller's reputation, product offerings, and customer feedback.</content>
<parameter name="filePath">SHOP_API_GUIDE.md