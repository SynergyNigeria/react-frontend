import { api } from './api';
import { ENDPOINTS } from '@config/apiConfig';

export const walletService = {
  // Get wallet balance
  getBalance: async () => {
    const response = await api.get('/wallet/balance/');
    return response.data;
  },

  // Fund wallet
  fundWallet: async (amount) => {
    const response = await api.post(ENDPOINTS.FUND_WALLET, { amount });
    return response.data;
  },

  // Verify payment
  verifyPayment: async (reference) => {
    const response = await api.post(ENDPOINTS.VERIFY_PAYMENT, { reference });
    return response.data;
  },

  // Get transaction history
  getTransactions: async (page = 1) => {
    const response = await api.get(ENDPOINTS.TRANSACTIONS, {
      params: { page },
    });
    return response.data;
  },

  // Withdraw funds
  withdraw: async (amount, bankDetails) => {
    const response = await api.post(ENDPOINTS.WITHDRAW, {
      amount,
      ...bankDetails,
    });
    return response.data;
  },
};

export default walletService;
