# COVU Marketplace Product API Documentation

## Overview

This document provides comprehensive guidance for integrating with the COVU Marketplace Product API in React applications. The API is built with Django REST Framework and uses JWT authentication.

## Base Configuration

```javascript
// API Configuration
const API_CONFIG = {
  BASE_URL: 'https://covu.onrender.com/api',
  ENDPOINTS: {
    PRODUCTS: '/products/',
    PRODUCT_DETAIL: (id) => `/products/${id}/`,
    // ... other endpoints
  }
};
```

## Authentication

All product API calls require JWT authentication. Include the Bearer token in the Authorization header.

### Token Management in React

```javascript
// Auth context or service
class AuthService {
  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  setTokens(accessToken, refreshToken) {
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }
}

const authService = new AuthService();
```

### API Request Wrapper

```javascript
// api.js - HTTP client with JWT handling
class APIClient {
  constructor() {
    this.baseURL = 'https://covu.onrender.com/api';
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

## Product API Endpoints

### 1. Get Products List

**Endpoint:** `GET /api/products/`

**Query Parameters:**
- `page` (integer): Page number for pagination (default: 1)
- `page_size` (integer): Items per page (default: 20, max: 100)
- `search` (string): Search term for product name/description
- `category` (string): Filter by category (see categories below)
- `store_id` (integer): Filter products by specific store

**Categories:**
```
mens_clothes
ladies_clothes
kids_clothes
beauty
body_accessories
clothing_extras
bags
wigs
body_scents
```

**Response:**
```json
{
  "count": 150,
  "next": "https://covu.onrender.com/api/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Classic Cotton T-Shirt",
      "description": "Comfortable cotton t-shirt perfect for everyday wear",
      "price": "2500.00",
      "category": "mens_clothes",
      "images": "https://res.cloudinary.com/.../image.jpg",
      "store_name": "Fashion Hub",
      "store_city": "Lagos",
      "store_state": "Lagos",
      "store_rating": 4.5,
      "is_active": true,
      "premium_quality": true,
      "durable": true,
      "modern_design": false,
      "easy_maintain": true
    }
  ]
}
```

**React Implementation:**

```javascript
// ProductList.jsx
import React, { useState, useEffect } from 'react';
import { apiClient } from './api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    page: 1
  });
  const [hasMore, setHasMore] = useState(true);

  const loadProducts = async (reset = false) => {
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

      const response = await apiClient.get('/products/', params);

      const newProducts = response.results.map(transformProductData);

      if (reset) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }

      setHasMore(!!response.next);
      setFilters(prev => ({ ...prev, page: reset ? 2 : prev.page + 1 }));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const transformProductData = (product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: parseFloat(product.price),
    category: product.category,
    image: product.images?.startsWith('http')
      ? product.images
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    store: {
      name: product.store_name,
      location: `${product.store_city}, ${product.store_state}`,
      rating: product.store_rating
    },
    features: {
      premium: product.premium_quality,
      durable: product.durable,
      modern: product.modern_design,
      easyMaintain: product.easy_maintain
    },
    isActive: product.is_active
  });

  useEffect(() => {
    loadProducts(true);
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
          loadProducts();
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
    <div className="product-list">
      {/* Search and filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          onChange={(e) => handleSearch(e.target.value)}
          value={filters.search}
        />
        <select
          value={filters.category}
          onChange={(e) => handleCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="mens_clothes">Men Clothes</option>
          <option value="ladies_clothes">Ladies Clothes</option>
          {/* ... other categories */}
        </select>
      </div>

      {/* Products grid */}
      <div className="products-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {loading && <div className="loading">Loading...</div>}
    </div>
  );
};

export default ProductList;
```

### 2. Get Product Details

**Endpoint:** `GET /api/products/{id}/`

**Response:**
```json
{
  "id": 1,
  "name": "Classic Cotton T-Shirt",
  "description": "Comfortable cotton t-shirt perfect for everyday wear",
  "price": "2500.00",
  "category": "mens_clothes",
  "images": "https://res.cloudinary.com/.../image.jpg",
  "store_info": {
    "id": 5,
    "name": "Fashion Hub",
    "city": "Lagos",
    "state": "Lagos",
    "average_rating": 4.5,
    "seller_photo": "https://res.cloudinary.com/.../seller.jpg"
  },
  "premium_quality": true,
  "durable": true,
  "modern_design": false,
  "easy_maintain": true,
  "is_active": true
}
```

**React Implementation:**

```javascript
// ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from './api';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    loadProductDetail();
  }, [id]);

  const loadProductDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiClient.get(`/products/${id}/`);
      setProduct(data);

      // Load related products
      if (data.category) {
        loadRelatedProducts(data.category);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async (category) => {
    try {
      const response = await apiClient.get('/products/', {
        category: category.toLowerCase(),
        page_size: 4
      });

      const related = response.results
        .filter(p => p.id !== parseInt(id))
        .slice(0, 4)
        .map(transformProductData);

      setRelatedProducts(related);
    } catch (err) {
      console.error('Error loading related products:', err);
    }
  };

  const transformProductData = (product) => ({
    id: product.id,
    name: product.name,
    price: parseFloat(product.price),
    image: product.images?.startsWith('http')
      ? product.images
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop'
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getCategoryDisplay = (category) => {
    const categoryMap = {
      'mens_clothes': 'Men Clothes',
      'ladies_clothes': 'Ladies Clothes',
      'kids_clothes': 'Kids Clothes',
      'beauty': 'Beauty',
      'body_accessories': 'Body Accessories',
      'clothing_extras': 'Clothing Extras',
      'bags': 'Bags',
      'wigs': 'Wigs',
      'body_scents': 'Body Scents'
    };
    return categoryMap[category] || category;
  };

  if (loading) return <div>Loading product...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="product-detail">
      <div className="product-main">
        <div className="product-image">
          <img
            src={product.images || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'}
            alt={product.name}
          />
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="price">{formatPrice(parseFloat(product.price))}</p>
          <p className="description">{product.description}</p>

          <div className="category">
            <span className="badge">{getCategoryDisplay(product.category)}</span>
          </div>

          {product.store_info && (
            <div className="store-info">
              <h3>Store Information</h3>
              <p>{product.store_info.name}</p>
              <p>{product.store_info.city}, {product.store_info.state}</p>
              <div className="rating">
                Rating: {product.store_info.average_rating || 'N/A'}
              </div>
            </div>
          )}

          <div className="features">
            {product.premium_quality && <span>Premium Quality</span>}
            {product.durable && <span>Durable</span>}
            {product.modern_design && <span>Modern Design</span>}
            {product.easy_maintain && <span>Easy to Maintain</span>}
          </div>

          <button className="buy-now-btn">Buy Now</button>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h2>Related Products</h2>
          <div className="related-grid">
            {relatedProducts.map(related => (
              <div key={related.id} className="related-card">
                <img src={related.image} alt={related.name} />
                <h4>{related.name}</h4>
                <p>{formatPrice(related.price)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
```

## Error Handling

### Common Error Scenarios

1. **401 Unauthorized**: Token expired or invalid
2. **403 Forbidden**: Insufficient permissions
3. **404 Not Found**: Product doesn't exist
4. **429 Too Many Requests**: Rate limited
5. **500 Internal Server Error**: Server error

### React Error Handling

```javascript
// ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Product API Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Custom hook for API calls
const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
};
```

## Image Handling

### Cloudinary Integration

Products use Cloudinary for image storage. Always validate image URLs:

```javascript
const getProductImage = (imageUrl) => {
  // Check if it's a valid Cloudinary URL
  if (imageUrl && imageUrl.startsWith('http') &&
      imageUrl.includes('res.cloudinary.com/') &&
      imageUrl.split('/').length > 5) {
    return imageUrl;
  }

  // Fallback to placeholder
  return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop';
};
```

### Image Optimization

```javascript
// Generate optimized image URLs
const getOptimizedImage = (baseUrl, width = 400, height = 400) => {
  if (baseUrl && baseUrl.includes('res.cloudinary.com/')) {
    // Add Cloudinary transformations
    const transformations = `w_${width},h_${height},c_fill,f_auto,q_auto`;
    return baseUrl.replace('/upload/', `/upload/${transformations}/`);
  }
  return baseUrl;
};
```

## Performance Optimization

### Infinite Scroll Implementation

```javascript
// InfiniteScroll.jsx
import { useEffect, useRef, useCallback } from 'react';

const InfiniteScroll = ({ hasMore, loading, loadMore, children }) => {
  const observer = useRef();

  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMore]);

  return (
    <div>
      {children}
      <div ref={lastElementRef} />
      {loading && <div>Loading more products...</div>}
    </div>
  );
};
```

### Debounced Search

```javascript
// useDebounce.js
import { useState, useEffect } from 'react';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Usage in component
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearchTerm) {
    handleSearch(debouncedSearchTerm);
  }
}, [debouncedSearchTerm]);
```

## State Management

### Context API for Products

```javascript
// ProductContext.jsx
import React, { createContext, useContext, useReducer } from 'react';

const ProductContext = createContext();

const productReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload.reset
          ? action.payload.products
          : [...state.products, ...action.payload.products],
        hasMore: action.payload.hasMore,
        loading: false
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    default:
      return state;
  }
};

export const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, {
    products: [],
    loading: false,
    error: null,
    hasMore: true,
    filters: { search: '', category: '', page: 1 }
  });

  return (
    <ProductContext.Provider value={{ state, dispatch }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider');
  }
  return context;
};
```

## Testing

### API Testing Utilities

```javascript
// api.test.js
import { apiClient } from './api';

describe('Product API', () => {
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token'),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
  });

  test('should fetch products successfully', async () => {
    const mockResponse = {
      count: 2,
      results: [
        { id: 1, name: 'Test Product 1', price: '1000.00' },
        { id: 2, name: 'Test Product 2', price: '2000.00' }
      ]
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })
    );

    const result = await apiClient.get('/products/');
    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      'https://covu.onrender.com/api/products/',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-token'
        })
      })
    );
  });

  test('should handle authentication errors', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ detail: 'Invalid token' })
      })
    );

    await expect(apiClient.get('/products/')).rejects.toThrow('Invalid token');
  });
});
```

## Migration from Vanilla JS

### Key Differences

1. **State Management**: React uses component state instead of global variables
2. **Rendering**: Declarative JSX instead of DOM manipulation
3. **Events**: Synthetic events instead of addEventListener
4. **Lifecycle**: useEffect instead of DOMContentLoaded

### Migration Example

**Vanilla JS (from products.js):**
```javascript
let allProducts = [];
let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});

async function loadProducts() {
  const response = await api.get('/products/');
  allProducts = response.results;
  displayProducts(allProducts);
}

function displayProducts(products) {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = products.map(p => `<div>${p.name}</div>`).join('');
}
```

**React Equivalent:**
```javascript
const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadProducts = async () => {
    const response = await apiClient.get('/products/', { page });
    setProducts(prev => [...prev, ...response.results]);
  };

  return (
    <div className="product-grid">
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
};
```

## Common Issues and Solutions

### Issue 1: CORS Errors
**Problem:** Browser blocks API requests
**Solution:** Ensure API server has proper CORS headers or use a proxy in development

### Issue 2: Token Expiration
**Problem:** 401 errors after token expires
**Solution:** Implement automatic token refresh as shown in the API client

### Issue 3: Image Loading
**Problem:** Broken image URLs
**Solution:** Always validate and provide fallbacks for image URLs

### Issue 4: Infinite Scroll Performance
**Problem:** Too many DOM elements
**Solution:** Implement virtualization for large lists

### Issue 5: Search Debouncing
**Problem:** Too many API calls during typing
**Solution:** Use debounced search with appropriate delay (500-800ms)

## Best Practices

1. **Error Boundaries**: Wrap components to catch API errors
2. **Loading States**: Always show loading indicators
3. **Optimistic Updates**: Update UI immediately, rollback on error
4. **Caching**: Cache product data to reduce API calls
5. **Pagination**: Use cursor-based pagination for better performance
6. **TypeScript**: Add types for better development experience
7. **Testing**: Write unit tests for API functions
8. **Monitoring**: Log API errors for debugging

## Environment Variables

```javascript
// .env
REACT_APP_API_BASE_URL=https://covu.onrender.com/api
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_DEFAULT_PRODUCT_IMAGE=https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop
```

This documentation should help you successfully integrate the COVU Marketplace Product API into your React application. Remember to handle authentication properly and implement appropriate error handling for a robust user experience.</content>
<parameter name="filePath">PRODUCT_API_GUIDE.md