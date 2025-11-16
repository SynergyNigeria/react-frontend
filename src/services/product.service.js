import { api } from './api';
import { ENDPOINTS, API_CONFIG } from '@config/apiConfig';

export const productService = {
  // Get all products with pagination
  getProducts: async (page = 1, category = null, search = null, storeId = null) => {
    const params = {
      page,
      page_size: API_CONFIG.PAGE_SIZE,
    };

    if (category && category !== 'all') {
      params.category = category;
    }

    if (search) {
      params.search = search;
    }

    if (storeId) {
      params.store = storeId;
    }

    const response = await api.get(ENDPOINTS.PRODUCTS, { params });
    return response.data;
  },

  // Get product details
  getProductById: async (id) => {
    const response = await api.get(ENDPOINTS.PRODUCT_DETAIL(id));
    return response.data;
  },

  // Rate a product
  rateProduct: async (productId, rating, review) => {
    const response = await api.post(ENDPOINTS.RATE_PRODUCT(productId), {
      rating,
      review,
    });
    return response.data;
  },

  // Get product rating statistics
  getProductRatingStats: async (productId) => {
    const response = await api.get(ENDPOINTS.PRODUCT_RATING_STATS(productId));
    return response.data;
  },

  // Get product reviews
  getProductReviews: async (productId, page = 1, pageSize = 10) => {
    const response = await api.get(ENDPOINTS.RATINGS, {
      params: {
        product: productId,
        page,
        page_size: pageSize,
      },
    });
    return response.data;
  },

  // Create product (seller)
  createProduct: async (productData) => {
    const response = await api.post(ENDPOINTS.PRODUCTS, productData);
    return response.data;
  },

  // Update product (seller)
  updateProduct: async (productId, productData) => {
    const response = await api.patch(ENDPOINTS.PRODUCT_DETAIL(productId), productData);
    return response.data;
  },

  // Delete product (seller)
  deleteProduct: async (productId) => {
    const response = await api.delete(ENDPOINTS.PRODUCT_DETAIL(productId));
    return response.data;
  },
};

export default productService;
