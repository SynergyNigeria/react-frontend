import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@config/apiConfig';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      // Add item to cart
      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existingItemIndex = items.findIndex(item => item.id === product.id);
        
        if (existingItemIndex > -1) {
          // Update quantity if item already exists
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += quantity;
          set({ items: updatedItems });
        } else {
          // Add new item
          set({ items: [...items, { ...product, quantity }] });
        }
      },
      
      // Remove item from cart
      removeItem: (productId) => {
        set({ items: get().items.filter(item => item.id !== productId) });
      },
      
      // Update item quantity
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        const items = get().items.map(item =>
          item.id === productId ? { ...item, quantity } : item
        );
        set({ items });
      },
      
      // Clear cart
      clearCart: () => set({ items: [] }),
      
      // Get cart total
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + (item.price * item.quantity),
          0
        );
      },
      
      // Get cart count
      getCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
      
      // Check if product is in cart
      isInCart: (productId) => {
        return get().items.some(item => item.id === productId);
      },
      
      // Get item from cart
      getItem: (productId) => {
        return get().items.find(item => item.id === productId);
      },
    }),
    {
      name: STORAGE_KEYS.CART,
    }
  )
);

export default useCartStore;
