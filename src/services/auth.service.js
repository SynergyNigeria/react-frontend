import { api, tokenManager } from './api';
import { ENDPOINTS } from '@config/apiConfig';

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post(ENDPOINTS.LOGIN, { email, password });
    const { access, refresh, user } = response.data;
    
    tokenManager.setTokens(access, refresh);
    tokenManager.setCurrentUser(user);
    
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await api.post(ENDPOINTS.REGISTER, userData);
    const { access, refresh, user } = response.data;
    
    tokenManager.setTokens(access, refresh);
    tokenManager.setCurrentUser(user);
    
    return response.data;
  },

  // Logout
  logout: () => {
    tokenManager.clearTokens();
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get(ENDPOINTS.PROFILE);
    tokenManager.setCurrentUser(response.data);
    return response.data;
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await api.patch(ENDPOINTS.PROFILE, userData);
    tokenManager.setCurrentUser(response.data);
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.post(ENDPOINTS.CHANGE_PASSWORD, {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  // Become seller
  becomeSeller: async (storeData) => {
    const response = await api.post(ENDPOINTS.BECOME_SELLER, storeData);
    tokenManager.setCurrentUser(response.data.user);
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!tokenManager.getAccessToken();
  },

  // Get current user from storage
  getCurrentUser: () => {
    return tokenManager.getCurrentUser();
  },
};

export default authService;
