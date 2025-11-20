import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { api } from '@services/api';
import { ENDPOINTS, CATEGORIES } from '@config/apiConfig';
import { productService } from '@services/product.service';
import Button from '@components/common/Button';
import Modal from '@components/common/Modal';
import Input from '@components/common/Input';
import Spinner from '@components/common/Spinner';
import {
  ArrowLeft,
  Store,
  Package,
  ShoppingCart,
  Star,
  Wallet,
  Truck,
  Settings,
  Edit,
  Banknote,
  Plus,
  Eye,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const StoreManagement = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [store, setStore] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    storeRating: 0.0,
  });
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Form states
  const [deliveryRates, setDeliveryRates] = useState({
    withinLga: '',
    outsideLga: '',
    outsideState: '',
  });
  const [storeDetails, setStoreDetails] = useState({
    name: '',
    description: '',
    category: '',
  });

  // Withdrawal states
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState('');

  // Product action modal states
  const [showProductActionModal, setShowProductActionModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Product management states
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    images: [],
    is_active: true,
    premium_quality: false,
    durable: false,
    modern_design: false,
    easy_maintain: false
  });
  const [productImages, setProductImages] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Product detail/edit modal states
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const loadStoreData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user stores
      const storesResponse = await api.get(ENDPOINTS.MY_STORES);
      console.log('MY_STORES response:', storesResponse.data);
      console.log('user.id:', user.id);
      if (storesResponse.data.results && storesResponse.data.results.length > 0) {
        console.log('Store in results:', storesResponse.data.results[0]);
      }
      let userStores = [];
      if (Array.isArray(storesResponse.data)) {
        userStores = storesResponse.data; // Assume it's already filtered
      } else if (storesResponse.data.results) {
        userStores = storesResponse.data.results; // Paginated, but should be user's stores
      } else {
        userStores = [storesResponse.data];
      }

      if (userStores.length === 0) {
        // Fallback to general stores list
        const allStoresResponse = await api.get(ENDPOINTS.STORES);
        console.log('STORES fallback response:', allStoresResponse.data);
        let allStores = [];
        if (Array.isArray(allStoresResponse.data)) {
          allStores = allStoresResponse.data;
        } else if (allStoresResponse.data.results) {
          allStores = allStoresResponse.data.results;
        }
        const fallbackStore = allStores.find(store => store.seller_id === user.id);
        if (fallbackStore) {
          userStores.push(fallbackStore);
        }
      }

      console.log('Final userStores:', userStores);

      const currentStore = userStores[0];
      setStore(currentStore);

      // Load store details
      const storeDetailResponse = await api.get(ENDPOINTS.STORE_DETAIL(currentStore.id));
      const detailedStore = storeDetailResponse.data;
      setStore(detailedStore);

      // Load statistics
      await loadStatistics(detailedStore);

      // Load wallet balance
      const walletResponse = await api.get(ENDPOINTS.WALLET_BALANCE);
      setWalletBalance(walletResponse.data.balance || 0);

      // Load bank accounts (handle different response shapes)
      const bankResponse = await api.get(ENDPOINTS.BANK_ACCOUNTS);
      let accounts = bankResponse.data || [];
      if (!Array.isArray(accounts)) {
        if (bankResponse.data?.results) accounts = bankResponse.data.results;
        else if (bankResponse.data?.data) accounts = bankResponse.data.data;
        else accounts = [];
      }
      setBankAccounts(accounts);

      // Default the selected bank account if available and not yet selected
      if (accounts.length > 0 && !selectedBankAccount) {
        setSelectedBankAccount(accounts[0].id);
      }

      // Set form defaults
      setDeliveryRates({
        withinLga: detailedStore.delivery_within_lga || '',
        outsideLga: detailedStore.delivery_outside_lga || '',
        outsideState: detailedStore.delivery_outside_state || '',
      });
      setStoreDetails({
        name: detailedStore.name || '',
        description: detailedStore.description || '',
        category: detailedStore.category || '',
      });

    } catch (err) {
      console.error('Error loading store data:', err);
      setError('Failed to load store data. Please try again.');
      toast.error('Failed to load store data');
    } finally {
      setLoading(false);
    }
  }, [user, selectedBankAccount]);

  useEffect(() => {
    if (!isAuthenticated || !user?.is_seller) {
      navigate('/');
      return;
    }
    loadStoreData();
  }, [isAuthenticated, user, navigate, loadStoreData]);

  const loadStatistics = async (storeData) => {
    try {
      // Products count from store data
      setStats(prev => ({
        ...prev,
        totalProducts: storeData.products?.length || 0,
      }));

      // Orders and revenue
      const ordersStatsResponse = await api.get(ENDPOINTS.ORDERS_STATS);
      setStats(prev => ({
        ...prev,
        totalOrders: ordersStatsResponse.data.active_orders || 0,
        totalRevenue: parseFloat(ordersStatsResponse.data.revenue) || 0,
      }));

      // Rating
      if (storeData.id) {
        try {
          const ratingResponse = await api.get(ENDPOINTS.STORE_RATING_STATS(storeData.id));
          setStats(prev => ({
            ...prev,
            storeRating: parseFloat(ratingResponse.data.average_rating) || 0,
          }));
        } catch (ratingErr) {
          console.error('Error loading rating:', ratingErr);
        }
      }
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  const loadWalletBalance = async () => {
    try {
      const walletResponse = await api.get(ENDPOINTS.WALLET_BALANCE);
      setWalletBalance(walletResponse.data.balance || 0);
    } catch (err) {
      console.error('Error loading wallet balance:', err);
    }
  };

  // Product management functions
  const loadProducts = useCallback(async () => {
    if (!store?.id) return;
    try {
      setLoadingProducts(true);
      const response = await productService.getProducts(1, null, null, store.id);
      setProducts(response.results || []);
    } catch (err) {
      console.error('Error loading products:', err);
      toast.error('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  }, [store]);

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!productForm.name.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    if (!productForm.description.trim()) {
      toast.error('Please enter a product description');
      return;
    }

    if (!productForm.price || parseFloat(productForm.price) < 1) {
      toast.error('Please enter a valid price');
      return;
    }

    if (!productForm.category) {
      toast.error('Please select a category');
      return;
    }

    if (!editingProduct && productImages.length === 0) {
      toast.error('Please upload a product photo');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', productForm.name.trim());
      formData.append('description', productForm.description.trim());
      formData.append('price', parseFloat(productForm.price));

      // Map frontend categories to backend categories
      const categoryMapping = {
        'Men Clothes': 'mens_clothes',
        'Ladies Clothes': 'ladies_clothes',
        'Kids Clothes': 'kids_clothes',
        'Beauty': 'beauty',
        'Body Accessories': 'body_accessories',
        'Clothing Extras': 'clothing_extras',
        'Bags': 'bags',
        'Wigs': 'wigs',
        'Body Scents': 'body_scents'
      };

      formData.append('category', categoryMapping[productForm.category] || productForm.category.toLowerCase().replace(' ', '_'));
      formData.append('store', store.id);
      formData.append('is_active', productForm.is_active);

      // Key feature flags
      formData.append('premium_quality', productForm.premium_quality);
      formData.append('durable', productForm.durable);
      formData.append('modern_design', productForm.modern_design);
      formData.append('easy_maintain', productForm.easy_maintain);

      // Add images
      if (productImages.length > 0) {
        productImages.forEach((image) => {
          formData.append('images', image);
        });
      }

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, formData);
        toast.success('Product updated successfully');
      } else {
        await productService.createProduct(formData);
        toast.success('Product created successfully');
      }

      setShowProductModal(false);
      resetProductForm();
      loadProducts();
      loadStoreData(); // Refresh stats
    } catch (err) {
      console.error('Error saving product:', err);
      let errorMessage = 'Failed to save product. Please try again.';

      if (err.response?.data) {
        const errors = err.response.data;
        if (errors.name) {
          errorMessage = 'Name validation error: ' + (Array.isArray(errors.name) ? errors.name[0] : errors.name);
        } else if (errors.category) {
          errorMessage = 'Category validation error: ' + (Array.isArray(errors.category) ? errors.category[0] : errors.category);
        } else if (errors.images) {
          errorMessage = 'Image validation error: ' + (Array.isArray(errors.images) ? errors.images[0] : errors.images);
        } else if (errors.price) {
          errorMessage = 'Price validation error: ' + (Array.isArray(errors.price) ? errors.price[0] : errors.price);
        } else if (errors.detail) {
          errorMessage = errorMessage = errors.detail;
        }
      }

      toast.error(errorMessage);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      is_active: product.is_active !== false,
      premium_quality: product.premium_quality || false,
      durable: product.durable || false,
      modern_design: product.modern_design || false,
      easy_maintain: product.easy_maintain || false
    });
    setProductImages([]);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await productService.deleteProduct(productId);
      toast.success('Product deleted successfully');
      loadProducts();
      loadStoreData(); // Refresh stats
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product');
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: '',
      images: [],
      is_active: true,
      premium_quality: false,
      durable: false,
      modern_design: false,
      easy_maintain: false
    });
    setProductImages([]);
    setEditingProduct(null);
  };

  const removeImage = (index) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  // Product detail/edit modal functions
  const handleEditProductDetail = () => {
    setIsEditing(true);
    // Populate form with product data
    setProductForm({
      name: selectedProduct.name || '',
      description: selectedProduct.description || '',
      price: selectedProduct.price || '',
      category: selectedProduct.category || '',
      is_active: selectedProduct.is_active !== false,
      premium_quality: selectedProduct.premium_quality || false,
      durable: selectedProduct.durable || false,
      modern_design: selectedProduct.modern_design || false,
      easy_maintain: selectedProduct.easy_maintain || false
    });
    setProductImages([]);
  };

  const handleSaveProductEdit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('category', productForm.category);
      formData.append('is_active', productForm.is_active);

      // Add new images if any
      productImages.forEach((image) => {
        formData.append('images', image);
      });

      await productService.updateProduct(selectedProduct.id, formData);
      toast.success('Product updated successfully');

      setIsEditing(false);
      loadProducts();
      loadStoreData(); // Refresh stats
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error('Failed to update product');
    }
  };

  const handleDeleteProductDetail = async () => {
    try {
      await productService.deleteProduct(selectedProduct.id);
      toast.success('Product deleted successfully');

      setShowProductDetailModal(false);
      setSelectedProduct(null);
      loadProducts();
      loadStoreData(); // Refresh stats
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: '',
      images: [],
      is_active: true,
      premium_quality: false,
      durable: false,
      modern_design: false,
      easy_maintain: false
    });
    setProductImages([]);
  };

  useEffect(() => {
    if (store?.id) {
      loadProducts();
    }
  }, [store, loadProducts]);

  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        delivery_within_lga: parseFloat(deliveryRates.withinLga),
        delivery_outside_lga: parseFloat(deliveryRates.outsideLga),
        delivery_outside_state: parseFloat(deliveryRates.outsideState),
      };

      await api.patch(ENDPOINTS.STORE_DETAIL(store.id), updateData);
      toast.success('Delivery settings updated successfully');
      setShowDeliveryModal(false);
      loadStoreData(); // Refresh data
    } catch (err) {
      console.error('Error updating delivery settings:', err);
      toast.error('Failed to update delivery settings');
    }
  };

  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        name: storeDetails.name,
        description: storeDetails.description,
        category: storeDetails.category,
      };

      await api.patch(ENDPOINTS.STORE_DETAIL(store.id), updateData);
      toast.success('Store details updated successfully');
      setShowStoreModal(false);
      loadStoreData(); // Refresh data
    } catch (err) {
      console.error('Error updating store details:', err);
      if (err.response?.data?.error?.includes('60 days')) {
        toast.error('Store details can only be changed once every 60 days');
      } else {
        toast.error('Failed to update store details');
      }
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    try {
      const amount = parseFloat(withdrawAmount);
      if (amount < 1000) {
        toast.error('Minimum withdrawal amount is ₦1,000');
        return;
      }

      if (amount > walletBalance) {
        toast.error('Insufficient balance');
        return;
      }

      await api.post(ENDPOINTS.WITHDRAW, {
        amount,
        bank_account_id: selectedBankAccount,
      });

      toast.success('Withdrawal request submitted successfully');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      loadWalletBalance(); // Refresh balance
    } catch (err) {
      console.error('Error processing withdrawal:', err);
      toast.error('Failed to process withdrawal');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  // Product image helper functions
  const getProductImageUrl = (product) => {
    if (product.images) {
      // Handle different image data structures
      if (typeof product.images === 'string') {
        return product.images;
      }
      if (product.images.url) {
        return product.images.url;
      }
      if (Array.isArray(product.images) && product.images.length > 0) {
        return product.images[0];
      }
    }
    return getFallbackImage(product.id);
  };

  const getFallbackImage = (productId) => {
    // Use a consistent fallback based on product ID for better UX
    const fallbackImages = [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400&h=400&fit=crop&crop=center'
    ];

    // Use product ID to consistently get the same fallback image for the same product
    const hash = productId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    return fallbackImages[Math.abs(hash) % fallbackImages.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading your store...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-4xl sm:text-6xl mb-4">🏪</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Store Not Found</h2>
          <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">{error}</p>
          <Button onClick={() => navigate('/')}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-500 hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base font-medium">Back</span>
            </button>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block w-2 h-2 bg-green-400 rounded-full"></div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-700">Store Dashboard</h1>
            </div>
            <div className="w-12 sm:w-16"></div> {/* Spacer */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6 sm:p-8 mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-medium text-gray-700 mb-1">Welcome back, {(() => {
                const firstName = user?.first_name || user?.firstName || user?.name?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'Admin';
                console.log('User object:', user, 'First name:', firstName);
                return firstName;
              })()}</h2>
              <p className="text-sm text-gray-500">Manage your store performance and settings</p>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500 font-medium">Live</span>
            </div>
          </div>
        </div>
        {/* Metrics Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Products</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-700 mt-1">{stats.totalProducts}</p>
              </div>
              <Package className="w-6 h-6 sm:w-7 sm:h-7 text-primary/60" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Orders</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-700 mt-1">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 text-primary/60" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Revenue</p>
                <p className="text-lg sm:text-xl font-semibold text-gray-700 mt-1">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <Banknote className="w-6 h-6 sm:w-7 sm:h-7 text-primary/60" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Rating</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-700 mt-1">{stats.storeRating.toFixed(1)}</p>
              </div>
              <Star className="w-6 h-6 sm:w-7 sm:h-7 text-primary/60" />
            </div>
          </div>
        </div>

        {/* Management Section */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Wallet Management */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center mb-4">
                <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-primary/60 mr-3" />
                <h3 className="text-base sm:text-lg font-medium text-gray-700">Wallet</h3>
              </div>
              <div className="mb-6">
                <p className="text-2xl sm:text-3xl font-semibold text-primary mb-1">{formatCurrency(walletBalance)}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Available Balance</p>
              </div>
              <Button
                onClick={() => setShowWithdrawModal(true)}
                className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base font-medium py-2.5"
              >
                Withdraw Funds
              </Button>
            </div>
          </div>

          {/* Store Settings */}
          <div className="lg:col-span-2">
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/20" onClick={() => setShowDeliveryModal(true)}>
                <div className="flex items-center justify-between mb-4">
                  <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-primary/60" />
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2">Delivery Settings</h3>
                <p className="text-sm text-gray-500">Configure delivery rates and options</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/20" onClick={() => setShowStoreModal(true)}>
                <div className="flex items-center justify-between mb-4">
                  <Store className="w-6 h-6 sm:w-7 sm:h-7 text-primary/60" />
                  <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2">Store Details</h3>
                <p className="text-sm text-gray-500">Update store information and settings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Management Section */}
        <div className="mt-8 sm:mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-700">Product Management</h2>
              <p className="text-sm text-gray-500 mt-1">Manage your store&apos;s products</p>
            </div>
            <Button
              onClick={() => {
                resetProductForm();
                setShowProductModal(true);
              }}
              className="bg-primary hover:bg-primary/90 text-xs sm:text-sm font-medium px-4 py-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Product Gallery */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {loadingProducts ? (
              <div className="p-8 text-center">
                <Spinner size="md" />
                <p className="mt-2 text-gray-500">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No products yet</h3>
                <p className="text-gray-500 mb-4">Start by adding your first product</p>
                <Button
                  onClick={() => {
                    resetProductForm();
                    setShowProductModal(true);
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Product
                </Button>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100 hover:shadow-lg transition-shadow duration-200"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowProductActionModal(true);
                      }}
                    >
                      {/* Product Image */}
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={getProductImageUrl(product)}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = getFallbackImage(product.id);
                          }}
                        />

                        {/* Status indicator */}
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            product.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                          }`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        {/* Price overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                          <div className="text-white font-semibold text-sm">
                            {formatCurrency(product.price)}
                          </div>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-3 bg-white">
                        <h3 className="text-sm font-medium text-gray-900 truncate" title={product.name}>
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 capitalize">
                          {product.category?.replace('_', ' ') || 'Uncategorized'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Settings Modal */}
      <Modal
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        title="Configure Delivery Settings"
        size="md"
      >
        <form onSubmit={handleDeliverySubmit} className="space-y-4 sm:space-y-6">
          <Input
            label="Delivery within LGA (₦)"
            type="number"
            value={deliveryRates.withinLga}
            onChange={(e) => setDeliveryRates(prev => ({ ...prev, withinLga: e.target.value }))}
            placeholder="500"
            required
          />
          <Input
            label="Delivery outside LGA (₦)"
            type="number"
            value={deliveryRates.outsideLga}
            onChange={(e) => setDeliveryRates(prev => ({ ...prev, outsideLga: e.target.value }))}
            placeholder="1000"
            required
          />
          <Input
            label="Delivery outside State (₦)"
            type="number"
            value={deliveryRates.outsideState}
            onChange={(e) => setDeliveryRates(prev => ({ ...prev, outsideState: e.target.value }))}
            placeholder="2000"
            required
          />
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowDeliveryModal(false)} className="flex-1 order-2 sm:order-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 order-1 sm:order-2">
              Update Settings
            </Button>
          </div>
        </form>
      </Modal>

      {/* Store Details Modal */}
      <Modal
        isOpen={showStoreModal}
        onClose={() => setShowStoreModal(false)}
        title="Edit Store Information"
        size="md"
      >
        <form onSubmit={handleStoreSubmit} className="space-y-4 sm:space-y-6">
          <Input
            label="Store Name"
            value={storeDetails.name}
            onChange={(e) => setStoreDetails(prev => ({ ...prev, name: e.target.value }))}
            placeholder="My Awesome Store"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={storeDetails.description}
              onChange={(e) => setStoreDetails(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
              rows={4}
              placeholder="Tell customers about your store..."
              required
            />
          </div>
          <Input
            label="Category"
            value={storeDetails.category}
            onChange={(e) => setStoreDetails(prev => ({ ...prev, category: e.target.value }))}
            placeholder="Fashion, Electronics, etc."
            required
          />
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowStoreModal(false)} className="flex-1 order-2 sm:order-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 order-1 sm:order-2">
              Update Store
            </Button>
          </div>
        </form>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="Process Withdrawal"
        size="md"
      >
        <form onSubmit={handleWithdrawSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Available Balance: {formatCurrency(walletBalance)}</p>
            <Input
              label="Amount to Withdraw (₦)"
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="1000"
              min="1000"
              max={walletBalance}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Bank Account</label>
            <select
              value={selectedBankAccount}
              onChange={(e) => setSelectedBankAccount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
              required
            >
              <option value="">Select bank account</option>
              {Array.isArray(bankAccounts) && bankAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.bank_name} - {account.account_number}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowWithdrawModal(false)} className="flex-1 order-2 sm:order-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 order-1 sm:order-2">
              Process Withdrawal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Product Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        size="lg"
      >
        <form onSubmit={handleProductSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Product Name *"
              value={productForm.name}
              onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter product name"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₦</span>
                <input
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm transition-all duration-200 text-lg"
                  placeholder="25000"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select
              value={productForm.category}
              onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm transition-all duration-200 text-lg"
              required
            >
              <option value="">Select a category</option>
              <option value="Men Clothes">Men Clothes</option>
              <option value="Ladies Clothes">Ladies Clothes</option>
              <option value="Kids Clothes">Kids Clothes</option>
              <option value="Beauty">Beauty</option>
              <option value="Body Accessories">Body Accessories</option>
              <option value="Clothing Extras">Clothing Extras</option>
              <option value="Bags">Bags</option>
              <option value="Wigs">Wigs</option>
              <option value="Body Scents">Body Scents</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              value={productForm.description}
              onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm transition-all duration-200 text-lg resize-none"
              rows={4}
              placeholder="Describe your product in detail..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Key Features (Optional)</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200">
                <input
                  type="checkbox"
                  checked={productForm.premium_quality}
                  onChange={(e) => setProductForm(prev => ({ ...prev, premium_quality: e.target.checked }))}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary cursor-pointer"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-800">Premium Quality</span>
                  <p className="text-xs text-gray-500">Premium quality materials</p>
                </div>
                <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200">
                <input
                  type="checkbox"
                  checked={productForm.durable}
                  onChange={(e) => setProductForm(prev => ({ ...prev, durable: e.target.checked }))}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary cursor-pointer"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-800">Durable</span>
                  <p className="text-xs text-gray-500">Durable and long-lasting</p>
                </div>
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200">
                <input
                  type="checkbox"
                  checked={productForm.modern_design}
                  onChange={(e) => setProductForm(prev => ({ ...prev, modern_design: e.target.checked }))}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary cursor-pointer"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-800">Modern Design</span>
                  <p className="text-xs text-gray-500">Modern and stylish design</p>
                </div>
                <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200">
                <input
                  type="checkbox"
                  checked={productForm.easy_maintain}
                  onChange={(e) => setProductForm(prev => ({ ...prev, easy_maintain: e.target.checked }))}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary cursor-pointer"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-800">Easy to Maintain</span>
                  <p className="text-xs text-gray-500">Easy to maintain and clean</p>
                </div>
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Photo</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-48 h-48 bg-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-primary transition-all duration-200 cursor-pointer overflow-hidden">
                    {productImages.length > 0 ? (
                      <img
                        src={URL.createObjectURL(productImages[0])}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload photo</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (!file.type.startsWith('image/')) {
                          toast.error('Please select a valid image file');
                          return;
                        }
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error('Image size must be less than 5MB');
                          return;
                        }
                        setProductImages([file]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
              {productImages.length > 0 && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setProductImages([])}
                    className="text-sm text-primary hover:text-orange-600 font-medium"
                  >
                    Change Photo
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={productForm.is_active}
              onChange={(e) => setProductForm(prev => ({ ...prev, is_active: e.target.checked }))}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              Product is active and available for purchase
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowProductModal(false)} className="flex-1 order-2 sm:order-1">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 order-1 sm:order-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl shadow-sm transition-all duration-200"
            >
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Product Detail/Edit Modal */}
      <Modal
        isOpen={showProductDetailModal}
        onClose={() => {
          setShowProductDetailModal(false);
          setSelectedProduct(null);
          setIsEditing(false);
        }}
        title={isEditing ? "Edit Product" : "Product Details"}
        size="lg"
      >
        {selectedProduct && (
          <div className="space-y-6">
            {!isEditing ? (
              // View Mode
              <>
                {/* Product Images */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(() => {
                    // Handle different image data structures
                    let imagesToShow = [];
                    if (selectedProduct.images) {
                      if (typeof selectedProduct.images === 'string') {
                        imagesToShow = [selectedProduct.images];
                      } else if (selectedProduct.images.url) {
                        imagesToShow = [selectedProduct.images.url];
                      } else if (Array.isArray(selectedProduct.images)) {
                        imagesToShow = selectedProduct.images;
                      }
                    }

                    return imagesToShow.length > 0 ? (
                      imagesToShow.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${selectedProduct.name} ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))
                    ) : (
                      <img
                        src={getFallbackImage(selectedProduct.id)}
                        alt={selectedProduct.name}
                        className="w-full h-32 object-cover rounded-lg col-span-full"
                      />
                    );
                  })()}
                </div>

                {/* Product Information */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="text-sm text-gray-900">{selectedProduct.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Category</label>
                        <p className="text-sm text-gray-900 capitalize">{selectedProduct.category?.replace('_', ' ') || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Price</label>
                        <p className="text-sm text-gray-900 font-semibold">{formatCurrency(selectedProduct.price)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedProduct.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedProduct.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedProduct.description}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleEditProductDetail}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Product
                  </Button>
                  <Button
                    onClick={handleDeleteProductDetail}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Product
                  </Button>
                  <Button
                    onClick={() => {
                      setShowProductDetailModal(false);
                      setSelectedProduct(null);
                      setIsEditing(false);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </>
            ) : (
              // Edit Mode
              <form onSubmit={handleSaveProductEdit} className="space-y-4 sm:space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Product Name"
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                    required
                  />
                  <Input
                    label="Price (₦)"
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                    required
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                    rows={4}
                    placeholder="Describe your product..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (!file.type.startsWith('image/')) {
                            toast.error('Please select a valid image file');
                            return;
                          }
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error('Image size must be less than 5MB');
                            return;
                          }
                          setProductImages([file]);
                        }
                      }}
                      className="hidden"
                      id="edit-product-images"
                    />
                    <label htmlFor="edit-product-images" className="cursor-pointer">
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload new images</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB each</p>
                      </div>
                    </label>
                  </div>

                  {productImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">New Images:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {productImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`New ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProduct.images && (() => {
                    // Handle different image data structures
                    let imagesToShow = [];
                    if (selectedProduct.images) {
                      if (typeof selectedProduct.images === 'string') {
                        imagesToShow = [selectedProduct.images];
                      } else if (selectedProduct.images.url) {
                        imagesToShow = [selectedProduct.images.url];
                      } else if (Array.isArray(selectedProduct.images)) {
                        imagesToShow = selectedProduct.images;
                      }
                    }

                    return imagesToShow.length > 0 ? (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Current Images:</p>
                        <div className="grid grid-cols-4 gap-2">
                          {imagesToShow.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Current ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Key Features (Optional)</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200">
                      <input
                        type="checkbox"
                        checked={productForm.premium_quality}
                        onChange={(e) => setProductForm(prev => ({ ...prev, premium_quality: e.target.checked }))}
                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary cursor-pointer"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">Premium Quality</span>
                        <p className="text-xs text-gray-500">Premium quality materials</p>
                      </div>
                      <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200">
                      <input
                        type="checkbox"
                        checked={productForm.durable}
                        onChange={(e) => setProductForm(prev => ({ ...prev, durable: e.target.checked }))}
                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary cursor-pointer"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">Durable</span>
                        <p className="text-xs text-gray-500">Durable and long-lasting</p>
                      </div>
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200">
                      <input
                        type="checkbox"
                        checked={productForm.modern_design}
                        onChange={(e) => setProductForm(prev => ({ ...prev, modern_design: e.target.checked }))}
                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary cursor-pointer"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">Modern Design</span>
                        <p className="text-xs text-gray-500">Modern and stylish design</p>
                      </div>
                      <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200">
                      <input
                        type="checkbox"
                        checked={productForm.easy_maintain}
                        onChange={(e) => setProductForm(prev => ({ ...prev, easy_maintain: e.target.checked }))}
                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary cursor-pointer"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">Easy to Maintain</span>
                        <p className="text-xs text-gray-500">Easy to maintain and clean</p>
                      </div>
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-is_active"
                    checked={productForm.is_active}
                    onChange={(e) => setProductForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="edit-is_active" className="ml-2 text-sm text-gray-700">
                    Product is active and available for purchase
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                    Update Product
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>

      {/* Product Action Modal */}
      <Modal
        isOpen={showProductActionModal}
        onClose={() => {
          setShowProductActionModal(false);
          setSelectedProduct(null);
        }}
        title="Product Actions"
        size="sm"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="text-center">
              <img
                src={getProductImageUrl(selectedProduct)}
                alt={selectedProduct.name}
                className="w-24 h-24 object-cover rounded-lg mx-auto mb-4"
                onError={(e) => {
                  e.target.src = getFallbackImage(selectedProduct.id);
                }}
              />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedProduct.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{formatCurrency(selectedProduct.price)}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  setShowProductActionModal(false);
                  handleEditProduct(selectedProduct);
                }}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Product
              </Button>

              <Button
                onClick={() => {
                  setShowProductActionModal(false);
                  handleDeleteProduct(selectedProduct.id);
                }}
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Product
              </Button>

              <Button
                onClick={() => {
                  setShowProductActionModal(false);
                  setSelectedProduct(null);
                }}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StoreManagement;