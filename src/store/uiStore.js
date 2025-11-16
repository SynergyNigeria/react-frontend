import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // Modal state
  isModalOpen: false,
  modalContent: null,
  modalTitle: '',
  
  // Sidebar state (mobile)
  isSidebarOpen: false,
  
  // Loading states
  isGlobalLoading: false,
  
  // Toast/notification state
  toast: null,
  
  // Actions
  openModal: (title, content) => set({ 
    isModalOpen: true, 
    modalTitle: title, 
    modalContent: content 
  }),
  
  closeModal: () => set({ 
    isModalOpen: false, 
    modalContent: null, 
    modalTitle: '' 
  }),
  
  toggleSidebar: () => set((state) => ({ 
    isSidebarOpen: !state.isSidebarOpen 
  })),
  
  closeSidebar: () => set({ isSidebarOpen: false }),
  
  setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),
  
  showToast: (message, type = 'info', duration = 3000) => {
    set({ toast: { message, type, duration } });
    setTimeout(() => set({ toast: null }), duration);
  },
  
  hideToast: () => set({ toast: null }),
}));

export default useUIStore;
