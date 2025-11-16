import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProfile, useFundWallet, useCreateOrder } from '@hooks/useAPI';
import Button from '@components/common/Button';
import Modal from '@components/common/Modal';
import { formatCurrency } from '@utils/formatters';
import {
  ArrowLeft,
  Wallet,
  Info,
  CreditCard,
  Loader,
  CheckCircle,
  MapPin,
  Truck,
  Shield,
  Plus,
  Check,
} from 'lucide-react';

const Purchase = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quantity = parseInt(searchParams.get('quantity') || '1');

  // State management
  const [productData, setProductData] = useState(null);
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [purchaseStep, setPurchaseStep] = useState('loading'); // 'loading', 'success'
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState('');

  // API hooks
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile();
  const walletFundMutation = useFundWallet();
  const createOrderMutation = useCreateOrder();

  // Load product data from localStorage (as per guide)
  useEffect(() => {
    const storedProduct = localStorage.getItem('selectedProduct');
    if (storedProduct) {
      try {
        const product = JSON.parse(storedProduct);
        setProductData(product);
      } catch (error) {
        console.error('Error parsing product data:', error);
        navigate('/products');
      }
    } else {
      // If no product data, redirect to products
      navigate('/products');
    }
  }, [navigate]);

  // Calculate delivery fee based on user and seller location
  const calculateDeliveryFee = () => {
    if (!productData?.store_info || !profile) return 2500; // Default fallback

    const buyerCity = profile.city?.toLowerCase().trim();
    const sellerCity = productData.store_info.city?.toLowerCase().trim();

    if (buyerCity && sellerCity && buyerCity === sellerCity) {
      // Same city/LGA - lower fee
      return parseFloat(productData.store_info.delivery_within_lga || 1500);
    } else {
      // Different city - higher fee
      return parseFloat(productData.store_info.delivery_outside_lga || 2500);
    }
  };

  // Calculations
  const subtotal = productData ? parseFloat(productData.price || 0) * quantity : 0;
  const deliveryFee = calculateDeliveryFee();
  const total = subtotal + deliveryFee;
  const walletBalance = parseFloat(profile?.wallet_balance || 0);
  const hasEnoughBalance = walletBalance >= total;

  // Handle top-up wallet
  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount < 100 || amount > 100000) {
      setError('Please enter a valid amount between ₦100 and ₦100,000');
      return;
    }

    setError('');
    try {
      const response = await walletFundMutation.mutateAsync({ amount });
      if (response.status === 'success') {
        // Redirect to Paystack payment page
        window.location.href = response.data.authorization_url;
      }
    } catch (err) {
      console.error('Top-up error:', err);
      setError('Failed to initiate payment. Please try again.');
    }
  };

  // Handle purchase
  const handlePurchase = async () => {
    // Validation
    if (!deliveryMessage.trim()) {
      setError('Please enter your delivery message with address and instructions.');
      return;
    }

    if (deliveryMessage.length < 10) {
      setError('Please provide detailed delivery instructions (at least 10 characters).');
      return;
    }

    if (total > walletBalance) {
      setError('Insufficient wallet balance. Please top up your wallet first.');
      return;
    }

    setError('');
    // Show purchase modal
    setIsPurchaseModalOpen(true);
    setPurchaseStep('loading');

    try {
      const response = await createOrderMutation.mutateAsync({
        product_id: productData.id,
        delivery_message: deliveryMessage.trim(),
        quantity: quantity,
      });

      setOrderData(response);
      setPurchaseStep('success');

      // Clear product data from localStorage
      localStorage.removeItem('selectedProduct');

      // Refetch profile to update wallet balance
      refetchProfile();
    } catch (err) {
      console.error('Order creation error:', err);
      setError('Failed to create order. Please try again.');
      setIsPurchaseModalOpen(false);
    }
  };

  // Handle purchase modal close
  const handlePurchaseModalClose = () => {
    setIsPurchaseModalOpen(false);
    if (purchaseStep === 'success') {
      navigate('/orders');
    }
  };

  // Loading state
  if (profileLoading || !productData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Loader className="h-8 w-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Preparing your purchase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-all duration-200 hover:scale-105"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <ArrowLeft className="h-4 w-4" />
              </div>
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-500">Secure Checkout</p>
                <p className="text-xs text-gray-400">Protected by SSL</p>
              </div>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Indicator */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Complete Your Purchase</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Step 2 of 2</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-full"></div>
              </div>
            </div>

            {/* Product Information */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={productData.images || '/placeholder-product.jpg'}
                    alt={productData.name}
                    className="w-24 h-24 object-cover rounded-xl border-2 border-white shadow-sm"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />
                  {quantity > 1 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {quantity}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{productData.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {productData.store_name}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(productData.price)}
                      {quantity > 1 && (
                        <span className="text-sm text-gray-500 ml-1">× {quantity}</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Delivery Information</h3>
                  <p className="text-sm text-gray-600">Where should we deliver your order?</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Delivery Address & Instructions *
                  </label>
                  <textarea
                    value={deliveryMessage}
                    onChange={(e) => setDeliveryMessage(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-700 resize-none bg-white/50 backdrop-blur-sm"
                    placeholder="Please provide your complete address, phone number, and any special delivery instructions..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Include landmarks and delivery preferences for faster service
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Wallet Balance Card */}
              <div className="bg-green-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-green-100 text-sm">Wallet Balance</p>
                      <p className="text-2xl font-bold">{formatCurrency(walletBalance)}</p>
                    </div>
                  </div>
                  {!hasEnoughBalance && (
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Plus className="h-4 w-4" />
                    </div>
                  )}
                </div>
                {!hasEnoughBalance && (
                  <button
                    onClick={() => setIsTopUpModalOpen(true)}
                    className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                  >
                    Top Up Wallet
                  </button>
                )}
              </div>

              {/* Payment Summary */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Delivery Fee</span>
                      <div className="group relative">
                        <Info className="h-4 w-4 text-gray-400 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-xs rounded-lg p-2 z-10 whitespace-nowrap">
                          Based on your location
                        </div>
                      </div>
                    </div>
                    <span className="font-medium">{formatCurrency(deliveryFee)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-xl text-primary">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Balance Status */}
                <div
                  className={`mt-4 p-3 rounded-xl text-sm font-medium ${
                    hasEnoughBalance
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {hasEnoughBalance ? (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Sufficient balance available
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Need {formatCurrency(total - walletBalance)} more
                    </div>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Purchase Button */}
              <Button
                onClick={handlePurchase}
                className="w-full py-4 px-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 bg-primary hover:bg-primary/90 border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={createOrderMutation.isLoading || !hasEnoughBalance}
                loading={createOrderMutation.isLoading}
              >
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {hasEnoughBalance ? 'Complete Purchase' : 'Insufficient Balance'}
                </div>
              </Button>

              {/* Security Note */}
              <div className="text-center text-xs text-gray-500">
                <Shield className="h-3 w-3 inline mr-1" />
                Your payment is secured with bank-level encryption
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top-Up Modal */}
      <Modal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        title="Top Up Your Wallet"
        size="md"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Add Funds to Wallet</h3>
            <p className="text-gray-600">Secure payment powered by Paystack</p>
          </div>

          <div>
            <label htmlFor="topUpAmount" className="block text-sm font-semibold text-gray-700 mb-3">
              Amount (₦)
            </label>
            <input
              type="number"
              id="topUpAmount"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              min="100"
              max="100000"
              step="100"
              placeholder="5000"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center text-lg font-semibold bg-white/50 backdrop-blur-sm"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Minimum ₦100 • Maximum ₦100,000
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => setIsTopUpModalOpen(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleTopUp}
              disabled={walletFundMutation.isLoading}
              loading={walletFundMutation.isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Add Funds
            </Button>
          </div>
        </div>
      </Modal>

      {/* Purchase Processing Modal */}
      <Modal
        isOpen={isPurchaseModalOpen}
        onClose={handlePurchaseModalClose}
        size="md"
        showCloseButton={purchaseStep === 'success'}
      >
        {purchaseStep === 'loading' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Loader className="h-10 w-10 text-white animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Processing Your Order</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We&apos;re securing your payment and notifying the seller. This usually takes just a
              few seconds...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-primary h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
            <Button
              onClick={() => setIsPurchaseModalOpen(false)}
              variant="outline"
              className="bg-white/50 backdrop-blur-sm"
            >
              Cancel Order
            </Button>
          </div>
        )}

        {purchaseStep === 'success' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Purchase Successful! 🎉</h3>
            <p className="text-gray-600 mb-2">Your order has been placed successfully.</p>
            <p className="text-sm text-gray-500 mb-6">Order #{orderData?.order_number || 'N/A'}</p>
            <Button
              onClick={() => navigate('/orders')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              View My Orders
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Purchase;
