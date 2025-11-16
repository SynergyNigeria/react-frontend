import { api } from './api';
import { ENDPOINTS, API_CONFIG } from '@config/apiConfig';

export const shopService = {
  // Get all stores with pagination
  getStores: async (page = 1, category = null, search = null) => {
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

    const response = await api.get(ENDPOINTS.STORES, { params });
    return response.data;
  },

  // Get store details
  getStoreById: async (id) => {
    const response = await api.get(ENDPOINTS.STORE_DETAIL(id));
    return response.data;
  },

  // Get store products
  getStoreProducts: async (storeId, page = 1) => {
    const response = await api.get(ENDPOINTS.PRODUCTS, {
      params: {
        store_id: storeId,
        page,
        page_size: API_CONFIG.PAGE_SIZE,
      },
    });
    return response.data;
  },

  // Rate a store
  rateStore: async (storeId, rating, review) => {
    const response = await api.post(ENDPOINTS.RATE_STORE(storeId), {
      rating,
      review,
    });
    return response.data;
  },

  // Create store (become seller)
  createStore: async (storeData) => {
    const response = await api.post(ENDPOINTS.STORES, storeData);
    return response.data;
  },

  // Update store
  updateStore: async (storeId, storeData) => {
    const response = await api.patch(ENDPOINTS.STORE_DETAIL(storeId), storeData);
    return response.data;
  },
};

export default shopService;
