import { useAuthStore } from '@store/authStore';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export const useAuth = () => {
  const navigate = useNavigate();
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    login: loginAction, 
    register: registerAction, 
    logout: logoutAction,
    updateProfile,
    refreshUser,
    clearError,
  } = useAuthStore();

  const login = useCallback(async (email, password, redirectTo = '/') => {
    try {
      await loginAction(email, password);
      navigate(redirectTo);
    } catch (error) {
      throw error;
    }
  }, [loginAction, navigate]);

  const register = useCallback(async (userData, redirectTo = '/') => {
    try {
      await registerAction(userData);
      navigate(redirectTo);
    } catch (error) {
      throw error;
    }
  }, [registerAction, navigate]);

  const logout = useCallback(() => {
    logoutAction();
    navigate('/login');
  }, [logoutAction, navigate]);

  const isSeller = useCallback(() => {
    return user?.is_seller || false;
  }, [user]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    clearError,
    isSeller,
  };
};

export default useAuth;
