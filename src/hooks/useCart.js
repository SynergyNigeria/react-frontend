import { useCartStore } from '@store/cartStore';
import { useCallback } from 'react';
import toast from 'react-hot-toast';

export const useCart = () => {
  const {
    items,
    addItem: addItemToStore,
    removeItem: removeItemFromStore,
    updateQuantity: updateQuantityInStore,
    clearCart: clearCartInStore,
    getTotal,
    getCount,
    isInCart: checkIsInCart,
    getItem,
  } = useCartStore();

  const addItem = useCallback((product, quantity = 1) => {
    addItemToStore(product, quantity);
    toast.success(`${product.name} added to cart`);
  }, [addItemToStore]);

  const removeItem = useCallback((productId) => {
    removeItemFromStore(productId);
    toast.success('Item removed from cart');
  }, [removeItemFromStore]);

  const updateQuantity = useCallback((productId, quantity) => {
    updateQuantityInStore(productId, quantity);
  }, [updateQuantityInStore]);

  const clearCart = useCallback(() => {
    clearCartInStore();
    toast.success('Cart cleared');
  }, [clearCartInStore]);

  const incrementQuantity = useCallback((productId) => {
    const item = getItem(productId);
    if (item) {
      updateQuantityInStore(productId, item.quantity + 1);
    }
  }, [getItem, updateQuantityInStore]);

  const decrementQuantity = useCallback((productId) => {
    const item = getItem(productId);
    if (item) {
      if (item.quantity > 1) {
        updateQuantityInStore(productId, item.quantity - 1);
      } else {
        removeItem(productId);
      }
    }
  }, [getItem, updateQuantityInStore, removeItem]);

  const isInCart = useCallback((productId) => {
    return checkIsInCart(productId);
  }, [checkIsInCart]);

  const total = getTotal();
  const count = getCount();
  const isEmpty = items.length === 0;

  return {
    items,
    total,
    count,
    isEmpty,
    addItem,
    removeItem,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    isInCart,
    getItem,
  };
};

export default useCart;
