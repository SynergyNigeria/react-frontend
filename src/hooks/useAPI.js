import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopService } from '@services/shop.service';
import { productService } from '@services/product.service';
import { orderService } from '@services/order.service';
import { walletService } from '@services/wallet.service';
import { authService } from '@services/auth.service';

// Shops hooks
export const useShops = (category = null, search = null) => {
  return useInfiniteQuery({
    queryKey: ['shops', category, search],
    queryFn: ({ pageParam = 1 }) => shopService.getStores(pageParam, category, search),
    getNextPageParam: (lastPage) => (lastPage.next ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
  });
};

export const useShop = (shopId) => {
  return useQuery({
    queryKey: ['shop', shopId],
    queryFn: () => shopService.getStoreById(shopId),
    enabled: !!shopId,
  });
};

export const useShopProducts = (shopId) => {
  return useInfiniteQuery({
    queryKey: ['shop-products', shopId],
    queryFn: ({ pageParam = 1 }) => shopService.getStoreProducts(shopId, pageParam),
    getNextPageParam: (lastPage) => (lastPage.next ? lastPage.page + 1 : undefined),
    enabled: !!shopId,
    initialPageParam: 1,
  });
};

export const useRateShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shopId, rating, review }) => shopService.rateStore(shopId, rating, review),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shop', variables.shopId] });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });
};

// Products hooks
export const useProducts = (category = null, search = null, storeId = null) => {
  return useInfiniteQuery({
    queryKey: ['products', category, search, storeId],
    queryFn: ({ pageParam = 1 }) =>
      productService.getProducts(pageParam, category, search, storeId),
    getNextPageParam: (lastPage) => (lastPage.next ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
  });
};

export const useProduct = (productId) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => productService.getProductById(productId),
    enabled: !!productId,
  });
};

export const useRateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, rating, review }) =>
      productService.rateProduct(productId, rating, review),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['product-reviews', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['product-rating-stats', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Product reviews and rating stats hooks
// export const useProductRatingStats = (productId) => { // Temporarily disabled - endpoint not available
//   return useQuery({
//     queryKey: ['product-rating-stats', productId],
//     queryFn: () => productService.getProductRatingStats(productId),
//     enabled: !!productId,
//   });
// };

export const useProductReviews = (productId) => {
  return useInfiniteQuery({
    queryKey: ['product-reviews', productId],
    queryFn: ({ pageParam = 1 }) => productService.getProductReviews(productId, pageParam),
    getNextPageParam: (lastPage) => (lastPage.next ? lastPage.page + 1 : undefined),
    enabled: !!productId,
    initialPageParam: 1,
  });
};

// Orders hooks
export const useOrders = (status = null) => {
  return useQuery({
    queryKey: ['orders', status],
    queryFn: () => orderService.getOrders(status),
  });
};

export const useSellerOrders = (status = null) => {
  return useQuery({
    queryKey: ['seller-orders', status],
    queryFn: () => orderService.getSellerOrders(status),
  });
};

export const useOrder = (orderId) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData) => orderService.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useAcceptOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) => orderService.acceptOrder(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useDeliverOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) => orderService.deliverOrder(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useConfirmOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) => orderService.confirmOrder(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }) => orderService.cancelOrder(orderId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

// Wallet hooks
export const useWalletBalance = () => {
  return useQuery({
    queryKey: ['wallet-balance'],
    queryFn: () => walletService.getBalance(),
  });
};

export const useFundWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ amount }) => walletService.fundWallet(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reference) => walletService.verifyPayment(reference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useTransactions = () => {
  return useInfiniteQuery({
    queryKey: ['transactions'],
    queryFn: ({ pageParam = 1 }) => walletService.getTransactions(pageParam),
    getNextPageParam: (lastPage) => (lastPage.next ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
  });
};

// Profile hook
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => authService.getProfile(),
  });
};
export const useRelatedProducts = (category, excludeProductId, pageSize = 8) => {
  return useQuery({
    queryKey: ['related-products', category, excludeProductId],
    queryFn: () => productService.getProducts(1, category, null, null),
    enabled: !!category,
    select: (data) => {
      const results = data.results || data;
      return results
        .filter((product) => String(product.id) !== String(excludeProductId))
        .slice(0, pageSize);
    },
  });
};

export default {
  useShops,
  useShop,
  useShopProducts,
  useRateShop,
  useProducts,
  useProduct,
  useRateProduct,
  // useProductRatingStats, // Temporarily disabled - endpoint not available
  useProductReviews,
  useOrders,
  useSellerOrders,
  useOrder,
  useCreateOrder,
  useAcceptOrder,
  useDeliverOrder,
  useConfirmOrder,
  useCancelOrder,
  useWalletBalance,
  useFundWallet,
  useVerifyPayment,
  useTransactions,
  useRelatedProducts,
};
