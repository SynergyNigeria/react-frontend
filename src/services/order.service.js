import { api } from './api';
import { ENDPOINTS } from '@config/apiConfig';

export const orderService = {
  // Get user's orders
  getOrders: async (status = null) => {
    const params = {};
    if (status) {
      params.status = status;
    }

    const response = await api.get(ENDPOINTS.ORDERS, { params });
    return response.data;
  },

  // Get seller's orders
  getSellerOrders: async (status = null) => {
    const params = { as_seller: 'true' };
    if (status) {
      params.status = status;
    }

    const response = await api.get(ENDPOINTS.ORDERS, { params });
    return response.data;
  },

  // Get order details
  getOrderById: async (id) => {
    const response = await api.get(ENDPOINTS.ORDER_DETAIL(id));
    return response.data;
  },

  // Create new order
  createOrder: async (orderData) => {
    const response = await api.post(ENDPOINTS.ORDERS, orderData);
    return response.data;
  },

  // Accept order (seller)
  acceptOrder: async (orderId) => {
    const response = await api.post(ENDPOINTS.ACCEPT_ORDER(orderId));
    return response.data;
  },

  // Mark order as delivered (seller)
  deliverOrder: async (orderId) => {
    const response = await api.post(ENDPOINTS.DELIVER_ORDER(orderId));
    return response.data;
  },

  // Confirm order delivery (buyer)
  confirmOrder: async (orderId) => {
    const response = await api.post(ENDPOINTS.CONFIRM_ORDER(orderId));
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    const response = await api.post(ENDPOINTS.CANCEL_ORDER(orderId), { reason });
    return response.data;
  },
};

export default orderService;
