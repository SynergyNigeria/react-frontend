import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useOrders,
  useSellerOrders,
  useProfile,
  useOrder,
  useAcceptOrder,
  useDeliverOrder,
  useConfirmOrder,
  useCancelOrder,
} from '@hooks/useAPI';
import Card from '@components/common/Card';
import Spinner from '@components/common/Spinner';
import Button from '@components/common/Button';
import Modal from '@components/common/Modal';
import { formatCurrency, formatDate, formatDateTime, getOrderStatusColor } from '@utils/formatters';
import {
  ArrowLeft,
  Package,
  ShoppingBag,
  Store,
  CheckCircle,
  XCircle,
  Truck,
  Clock,
  Info,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  Check,
  X,
  Loader,
} from 'lucide-react';

const Orders = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('purchases'); // 'purchases' or 'sales'
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // API hooks
  const { data: profile } = useProfile();
  const {
    data: purchasesData,
    isLoading: purchasesLoading,
    refetch: refetchPurchases,
  } = useOrders(statusFilter);
  const {
    data: salesData,
    isLoading: salesLoading,
    refetch: refetchSales,
  } = useSellerOrders(statusFilter);
  const { data: orderDetail, isLoading: orderDetailLoading } = useOrder(selectedOrder?.id);

  // Mutations
  const acceptOrderMutation = useAcceptOrder();
  const deliverOrderMutation = useDeliverOrder();
  const confirmOrderMutation = useConfirmOrder();
  const cancelOrderMutation = useCancelOrder();

  // Handle data structures
  const purchases = Array.isArray(purchasesData) ? purchasesData : purchasesData?.results || [];
  const sales = Array.isArray(salesData) ? salesData : salesData?.results || [];

  // Current orders based on active tab
  const currentOrders = activeTab === 'purchases' ? purchases : sales;
  const isLoading = activeTab === 'purchases' ? purchasesLoading : salesLoading;

  // Check if user is a seller
  const isSeller = profile?.is_seller || false;

  // Status options
  const statuses = [
    { value: null, label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // Handle order click
  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  // Handle order actions
  const handleOrderAction = (orderId, action) => {
    setConfirmAction({ orderId, action });
    setIsConfirmModalOpen(true);
  };

  // Execute order action
  const executeOrderAction = async () => {
    if (!confirmAction) return;

    const { orderId, action } = confirmAction;

    try {
      switch (action) {
        case 'accept':
          await acceptOrderMutation.mutateAsync(orderId);
          break;
        case 'deliver':
          await deliverOrderMutation.mutateAsync(orderId);
          break;
        case 'confirm':
          await confirmOrderMutation.mutateAsync(orderId);
          break;
        case 'cancel':
          await cancelOrderMutation.mutateAsync({
            orderId,
            reason: cancelReason || 'Cancelled by user',
          });
          break;
        default:
          return;
      }

      // Refresh data
      if (activeTab === 'purchases') {
        refetchPurchases();
      } else {
        refetchSales();
      }

      setIsConfirmModalOpen(false);
      setConfirmAction(null);
      setCancelReason('');
      setIsOrderModalOpen(false);
    } catch (error) {
      console.error('Order action error:', error);
    }
  };

  // Get action buttons based on order status and user role
  const getOrderActions = (order) => {
    const actions = [];
    const isBuyerView = activeTab === 'purchases';
    const status = order.status?.toLowerCase(); // Normalize status to lowercase

    // Debug: Log order status and view
    console.log(
      'Order status:',
      order.status,
      'Normalized status:',
      status,
      'Is buyer view:',
      isBuyerView,
      'Order ID:',
      order.id
    );

    if (isBuyerView) {
      // Buyer actions
      switch (status) {
        case 'pending':
          console.log('Adding cancel button for pending order');
          actions.push(
            <Button
              key="cancel"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleOrderAction(order.id, 'cancel');
              }}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancel Order
            </Button>
          );
          break;
        case 'delivered':
          actions.push(
            <Button
              key="confirm"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleOrderAction(order.id, 'confirm');
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Confirm Receipt
            </Button>
          );
          break;
        default:
          console.log('No actions for status:', status);
      }
    } else {
      // Seller actions
      switch (status) {
        case 'pending':
          actions.push(
            <Button
              key="accept"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleOrderAction(order.id, 'accept');
              }}
              className="bg-green-600 hover:bg-green-700 mr-2"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Accept Order
            </Button>,
            <Button
              key="cancel"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleOrderAction(order.id, 'cancel');
              }}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancel Order
            </Button>
          );
          break;
        case 'accepted':
          actions.push(
            <Button
              key="deliver"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleOrderAction(order.id, 'deliver');
              }}
              className="bg-blue-600 hover:bg-blue-700 mr-2"
            >
              <Truck className="h-4 w-4 mr-1" />
              Mark Delivered
            </Button>,
            <Button
              key="cancel"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleOrderAction(order.id, 'cancel');
              }}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancel Order
            </Button>
          );
          break;
      }
    }

    return actions;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'delivered':
        return <Truck className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'all':
      case null:
        return <Package className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  // Get product info from order
  const getProductInfo = (order) => {
    // Handle different data structures
    const productName =
      order.product_snapshot?.name || order.product_name || order.product?.name || 'Product';

    const productImage =
      order.product_snapshot?.images ||
      order.product_images ||
      order.product?.images ||
      '/placeholder-product.jpg';

    const storeName =
      order.product_snapshot?.store_name ||
      order.store_name ||
      order.product?.store_name ||
      'Store';

    return { productName, productImage, storeName };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Package className="h-8 w-8 text-primary animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-800">My Orders</h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Modern Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          {/* Orders Tabs - Modern Design */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">View Orders</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab('purchases')}
                className={`flex items-center justify-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === 'purchases'
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 transform scale-[1.02]'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${activeTab === 'purchases' ? 'bg-white/20' : 'bg-primary/10'}`}
                >
                  <ShoppingBag
                    className={`h-5 w-5 ${activeTab === 'purchases' ? 'text-white' : 'text-primary'}`}
                  />
                </div>
                <div className="text-left">
                  <div className="font-semibold">My Purchases</div>
                  <div
                    className={`text-sm ${activeTab === 'purchases' ? 'text-white/80' : 'text-gray-500'}`}
                  >
                    Orders I&apos;ve placed
                  </div>
                </div>
              </button>
              {isSeller && (
                <button
                  onClick={() => setActiveTab('sales')}
                  className={`flex items-center justify-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'sales'
                      ? 'bg-primary text-white shadow-lg shadow-primary/25 transform scale-[1.02]'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${activeTab === 'sales' ? 'bg-white/20' : 'bg-primary/10'}`}
                  >
                    <Store
                      className={`h-5 w-5 ${activeTab === 'sales' ? 'text-white' : 'text-primary'}`}
                    />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">My Sales</div>
                    <div
                      className={`text-sm ${activeTab === 'sales' ? 'text-white/80' : 'text-gray-500'}`}
                    >
                      Orders from customers
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Status Filter - Modern Grid Layout */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">Filter by Status</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {statuses.map((status) => (
                <button
                  key={status.value || 'all'}
                  onClick={() => setStatusFilter(status.value)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                    statusFilter === status.value
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25 transform scale-[1.02]'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-primary hover:bg-primary/5 hover:shadow-md'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg mb-2 ${
                      statusFilter === status.value ? 'bg-white/20' : 'bg-gray-100'
                    }`}
                  >
                    {getStatusIcon(status.value || 'all')}
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">
                    {status.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {!currentOrders || currentOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {statusFilter ? 'No orders found' : 'No orders yet'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {statusFilter
                ? `You don't have any ${statusFilter} orders ${activeTab === 'purchases' ? 'yet' : 'from customers yet'}.`
                : activeTab === 'purchases'
                  ? 'Your order history will appear here once you start shopping.'
                  : 'Orders from your customers will appear here once they place orders.'}
            </p>
            {activeTab === 'purchases' && !statusFilter && (
              <Button
                onClick={() => navigate('/products')}
                className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Start Shopping
              </Button>
            )}
            {statusFilter && (
              <Button
                variant="outline"
                onClick={() => setStatusFilter(null)}
                className="border-primary text-primary hover:bg-primary hover:text-white"
              >
                View All Orders
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {currentOrders.map((order) => {
              // Debug: Log order data
              console.log('Rendering order:', order);

              const { productName, productImage, storeName } = getProductInfo(order);
              const actions = getOrderActions(order);
              const status = order.status?.toLowerCase(); // Normalize status for display

              return (
                <Card
                  key={order.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white hover:bg-gray-50/50"
                  onClick={() => handleOrderClick(order)}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <img
                          src={productImage}
                          alt={productName}
                          className="w-16 h-16 object-cover rounded-xl border border-gray-100 shadow-sm"
                          onError={(e) => {
                            e.target.src = '/placeholder-product.jpg';
                          }}
                        />
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200">
                          {getStatusIcon(order.status)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {productName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{storeName}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(order.total_amount)}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(order.status)}`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        Order #{order.order_number || order.id}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(order.created_at)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-end">
                        <div className="flex gap-2">{actions}</div>
                      </div>
                      <div className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                        {activeTab === 'purchases' ? (
                          status === 'pending' ? (
                            <>
                              <Clock className="h-4 w-4 inline mr-1" /> Waiting for seller to accept
                            </>
                          ) : status === 'accepted' ? (
                            <>
                              <Package className="h-4 w-4 inline mr-1" /> Seller is preparing your
                              order
                            </>
                          ) : status === 'delivered' ? (
                            <>
                              <CheckCircle className="h-4 w-4 inline mr-1" /> Order delivered -
                              confirm receipt
                            </>
                          ) : status === 'confirmed' ? (
                            <>
                              <CheckCircle className="h-4 w-4 inline mr-1" /> Order completed
                              successfully
                            </>
                          ) : status === 'cancelled' ? (
                            <>
                              <XCircle className="h-4 w-4 inline mr-1" /> Order cancelled
                            </>
                          ) : (
                            'Unknown status'
                          )
                        ) : status === 'pending' ? (
                          <>
                            <AlertCircle className="h-4 w-4 inline mr-1" /> New order - accept or
                            cancel
                          </>
                        ) : status === 'accepted' ? (
                          <>
                            <Truck className="h-4 w-4 inline mr-1" /> Preparing for delivery
                          </>
                        ) : status === 'delivered' ? (
                          <>
                            <Clock className="h-4 w-4 inline mr-1" /> Waiting for buyer confirmation
                          </>
                        ) : status === 'confirmed' ? (
                          <>
                            <CheckCircle className="h-4 w-4 inline mr-1" /> Order completed -
                            payment released
                          </>
                        ) : status === 'cancelled' ? (
                          <>
                            <XCircle className="h-4 w-4 inline mr-1" /> Order cancelled
                          </>
                        ) : (
                          'Unknown status'
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        title={`Order Details - #${selectedOrder?.order_number || selectedOrder?.id}`}
        size="lg"
      >
        {orderDetailLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : orderDetail ? (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-medium">
                      {orderDetail.order_number || orderDetail.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(orderDetail.status)}`}
                    >
                      {orderDetail.status.charAt(0).toUpperCase() + orderDetail.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-medium">{formatDateTime(orderDetail.created_at)}</span>
                  </div>
                  {orderDetail.accepted_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Accepted:</span>
                      <span className="font-medium">{formatDateTime(orderDetail.accepted_at)}</span>
                    </div>
                  )}
                  {orderDetail.delivered_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivered:</span>
                      <span className="font-medium">
                        {formatDateTime(orderDetail.delivered_at)}
                      </span>
                    </div>
                  )}
                  {orderDetail.confirmed_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confirmed:</span>
                      <span className="font-medium">
                        {formatDateTime(orderDetail.confirmed_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(orderDetail.product_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee:</span>
                    <span className="font-medium">{formatCurrency(orderDetail.delivery_fee)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-bold text-primary">
                        {formatCurrency(orderDetail.total_amount)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Escrow Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        orderDetail.escrow_status === 'HELD'
                          ? 'bg-yellow-100 text-yellow-800'
                          : orderDetail.escrow_status === 'RELEASED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {orderDetail.escrow_status || 'HELD'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Product Information</h3>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={orderDetail.product_snapshot?.images || '/placeholder-product.jpg'}
                  alt={orderDetail.product_snapshot?.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-medium text-gray-900">
                    {orderDetail.product_snapshot?.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {orderDetail.product_snapshot?.store_name}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            {orderDetail.delivery_message && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Delivery Information</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-700">{orderDetail.delivery_message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Buyer Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{orderDetail.buyer?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{orderDetail.buyer?.phone_number}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Seller Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{orderDetail.seller?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{orderDetail.seller?.phone_number}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              {getOrderActions(orderDetail)}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Failed to load order details</p>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Action"
        size="md"
      >
        <div className="space-y-4">
          {confirmAction?.action === 'cancel' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                placeholder="Please provide a reason for cancellation..."
              />
            </div>
          )}

          {confirmAction?.action === 'accept' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Important Note</h4>
                  <p className="text-sm text-blue-700">
                    By accepting this order, you confirm that you are ready to prepare and deliver
                    the product to the buyer. The buyer&apos;s payment will be held until you mark
                    the order as delivered.
                  </p>
                </div>
              </div>
            </div>
          )}

          {confirmAction?.action === 'deliver' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-green-900 mb-1">Delivery Confirmation</h4>
                  <p className="text-sm text-green-700">
                    By marking this order as delivered, you confirm that the product has been
                    successfully delivered to the buyer. The buyer will then have the opportunity to
                    confirm receipt, after which the payment will be released from to you in full.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={executeOrderAction}
              disabled={
                acceptOrderMutation.isLoading ||
                deliverOrderMutation.isLoading ||
                confirmOrderMutation.isLoading ||
                cancelOrderMutation.isLoading
              }
              loading={
                acceptOrderMutation.isLoading ||
                deliverOrderMutation.isLoading ||
                confirmOrderMutation.isLoading ||
                cancelOrderMutation.isLoading
              }
              className={
                confirmAction?.action === 'cancel'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-primary hover:bg-primary/90'
              }
            >
              {confirmAction?.action === 'accept' && 'Accept Order'}
              {confirmAction?.action === 'deliver' && 'Mark as Delivered'}
              {confirmAction?.action === 'confirm' && 'Confirm Receipt'}
              {confirmAction?.action === 'cancel' && 'Cancel Order'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Orders;
