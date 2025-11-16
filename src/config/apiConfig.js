// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://covu.onrender.com/api',
  PAYSTACK_PUBLIC_KEY: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  PAGE_SIZE: parseInt(import.meta.env.VITE_PAGE_SIZE) || 20,
  SCROLL_THRESHOLD: parseInt(import.meta.env.VITE_SCROLL_THRESHOLD) || 300,
};

// API Endpoints
export const ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login/',
  REGISTER: '/auth/register/',
  TOKEN_REFRESH: '/auth/token/refresh/',
  PROFILE: '/auth/profile/',
  BECOME_SELLER: '/auth/become-seller/',
  CHANGE_PASSWORD: '/auth/change-password/',

  // Stores
  STORES: '/stores/',
  STORE_DETAIL: (id) => `/stores/${id}/`,
  STORE_PRODUCTS: (id) => `/stores/${id}/products/`,
  RATE_STORE: (id) => `/stores/${id}/rate/`,

  // Products
  PRODUCTS: '/products/',
  PRODUCT_DETAIL: (id) => `/products/${id}/`,
  RATE_PRODUCT: (id) => `/products/${id}/rate/`,

  // Orders
  ORDERS: '/orders/',
  ORDER_DETAIL: (id) => `/orders/${id}/`,
  ACCEPT_ORDER: (id) => `/orders/${id}/accept/`,
  DELIVER_ORDER: (id) => `/orders/${id}/deliver/`,
  CONFIRM_ORDER: (id) => `/orders/${id}/confirm/`,
  CANCEL_ORDER: (id) => `/orders/${id}/cancel/`,

  // Wallet
  FUND_WALLET: '/wallet/fund/',
  VERIFY_PAYMENT: '/wallet/verify-payment/',
  TRANSACTIONS: '/wallet/transactions/',
  WITHDRAW: '/wallet/withdraw/',

  // Ratings and Reviews
  RATINGS: '/ratings/',
  STORE_RATING_STATS: (id) => `/ratings/store/${id}/stats/`,
  PRODUCT_RATING_STATS: (id) => `/ratings/stats/?product=${id}`,
  MY_RATINGS: '/ratings/my-ratings/',
};

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'covu_access_token',
  REFRESH_TOKEN: 'covu_refresh_token',
  CURRENT_USER: 'covu_current_user',
  CART: 'covu_cart',
};

// App Constants
export const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'Grid' },
  { id: 'mens_clothes', name: 'Men Clothes', icon: 'Shirt' },
  { id: 'ladies_clothes', name: 'Ladies Clothes', icon: 'Shirt' },
  { id: 'kids_clothes', name: 'Kids Clothes', icon: 'Shirt' },
  { id: 'beauty', name: 'Beauty', icon: 'Sparkles' },
  { id: 'body_accessories', name: 'Body Accessories', icon: 'Watch' },
  { id: 'clothing_extras', name: 'Clothing Extras', icon: 'Package' },
  { id: 'bags', name: 'Bags', icon: 'Briefcase' },
  { id: 'wigs', name: 'Wigs', icon: 'Crown' },
  { id: 'body_scents', name: 'Body Scents', icon: 'SprayCan' },
];

export const ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DELIVERED: 'delivered',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
};

export const PAYMENT_METHODS = {
  WALLET: 'wallet',
  CARD: 'card',
};

export default API_CONFIG;
