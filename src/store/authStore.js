import { create } from 'zustand';
import { authService } from '@services/auth.service';
import { tokenManager } from '@services/api';

export const useAuthStore = create((set, get) => ({
  user: tokenManager.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  // Login action
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(email, password);
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  // Register action
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.register(userData);
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  // Logout action
  logout: () => {
    authService.logout();
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  // Update profile
  updateProfile: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.updateProfile(userData);
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Update failed',
        isLoading: false,
      });
      throw error;
    }
  },

  // Refresh user data
  refreshUser: async () => {
    try {
      const user = await authService.getProfile();
      set({ user });
      return user;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
