# COVU Marketplace Orders Page Documentation

## Overview

The Orders page (`orders.html`) is the comprehensive order management interface for the COVU marketplace. It provides dual functionality for both buyers and sellers, displaying order history, status tracking, and action management. The page supports real-time order updates, escrow tracking, and integrates with the rating system.

## Page Structure and Components

### HTML Structure

The orders page consists of several key sections:

#### 1. Header Section
```html
<header class="bg-white shadow-sm">
    <div class="max-w-6xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
            <button onclick="history.back()">Back</button>
            <h1 class="text-lg font-semibold text-gray-800">My Orders</h1>
        </div>
    </div>
</header>
```

**Features:**
- Back navigation
- Page title
- Clean header design

#### 2. Orders Tabs
```html
<div id="ordersTabs" class="mb-6 flex gap-2">
    <!-- Dynamically generated tabs -->
</div>
```

**Tab Types:**
- **My Purchases**: Buyer's view of their orders
- **My Sales**: Seller's view (only shown for sellers)

#### 3. Orders Container
```html
<div id="ordersContainer" class="space-y-4">
    <!-- Order cards dynamically inserted here -->
</div>
```

**Displays:**
- List of orders sorted by date (newest first)
- Order cards with product info, status, and actions

#### 4. Empty State
```html
<div id="emptyState" class="hidden text-center py-12">
    <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i data-lucide="clipboard-list" class="h-12 w-12 text-gray-400"></i>
    </div>
    <h3 class="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
    <p class="text-gray-500 mb-6">Your order history will appear here</p>
    <a href="products.html">Start Shopping</a>
</div>
```

**Features:**
- Encourages first-time shopping
- Clear call-to-action

## Order Card Structure

### Order Card Layout
```html
<div class="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow">
    <div class="flex items-center gap-4 mb-4">
        <img src="product-image" alt="Product" class="w-16 h-16 object-cover rounded-lg">
        <div class="flex-1">
            <h3 class="font-semibold text-gray-800 mb-1">Product Name</h3>
            <p class="text-sm text-gray-500 mb-1">Store Name</p>
            <div class="flex items-center justify-between">
                <span class="text-primary-orange font-bold">₦Total Amount</span>
                <span class="status-badge status-class">Status Text</span>
            </div>
        </div>
    </div>

    <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span>Order #OrderNumber</span>
        <span>Formatted Date</span>
    </div>

    <div class="flex items-center justify-between">
        <div class="text-sm text-gray-600">Status Description</div>
        <div>Action Buttons</div>
    </div>
</div>
```

**Card Elements:**
- Product thumbnail (16x16)
- Product and store names
- Total amount in NGN
- Status badge with color coding
- Order number and date
- Status description
- Action buttons (contextual)

## Order Status System

### Status Types and Colors

```css
.status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
}

.status-pending {
    background-color: #fef3c7;
    color: #d97706;
}

.status-confirmed {
    background-color: #dbeafe;
    color: #2563eb;
}

.status-delivered {
    background-color: #d1fae5;
    color: #065f46;
}

.status-cancelled {
    background-color: #fee2e2;
    color: #dc2626;
}
```

### Order Statuses

#### For Buyers (Purchases View):
- **PENDING**: Waiting for seller to accept
  - Action: Cancel Order
- **ACCEPTED**: Seller accepted, preparing delivery
  - Action: None
- **DELIVERED**: Order delivered, awaiting confirmation
  - Action: Confirm Receipt
- **CONFIRMED**: Order completed successfully
  - Action: None
- **CANCELLED**: Order cancelled
  - Action: None

#### For Sellers (Sales View):
- **PENDING**: New order, must accept or cancel
  - Actions: Accept Order, Cancel Order
- **ACCEPTED**: Preparing for delivery
  - Actions: Mark as Delivered, Cancel Order
- **DELIVERED**: Waiting for buyer confirmation
  - Action: None
- **CONFIRMED**: Order completed, payment released
  - Action: None
- **CANCELLED**: Order cancelled
  - Action: None

## Modal Components

### 1. Order Detail Modal
```html
<div id="orderDetailModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal content dynamically inserted -->
    </div>
</div>
```

**Features:**
- Full order information display
- Scrollable content for long details
- Close button and click-outside-to-close
- Keyboard support (Escape key)

### 2. Confirmation Modal
```html
<div id="confirmationModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <!-- Dynamic content based on action -->
    </div>
</div>
```

**Features:**
- Contextual icons and colors
- Action-specific messaging
- Cancel/Confirm button layout
- Warning details for critical actions

## Data Flow and State Management

### Order Data Loading

```javascript
async function loadOrders(view = 'buyer') {
    // Fetch orders from API
    let response;
    if (view === 'seller') {
        response = await api.get(API_CONFIG.ENDPOINTS.ORDERS, { as_seller: 'true' });
    } else {
        response = await api.get(API_CONFIG.ENDPOINTS.ORDERS);
    }
    
    // Process response
    let orders = response.results || response || [];
    
    // Display orders
    displayOrders(orders, view);
}
```

**API Endpoints:**
- **Buyer Orders**: `GET /api/orders/`
- **Seller Orders**: `GET /api/orders/?as_seller=true`

### Order Data Structure

#### Order List Response
```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 123,
      "order_number": "COVU-12345678-90",
      "status": "PENDING",
      "total_amount": "2500.00",
      "created_at": "2024-01-15T10:30:00Z",
      "product_snapshot": {
        "name": "Product Name",
        "images": "image_url",
        "store_name": "Store Name"
      }
    }
  ]
}
```

#### Order Detail Response
```json
{
  "id": 123,
  "order_number": "COVU-12345678-90",
  "status": "ACCEPTED",
  "product_price": "2000.00",
  "delivery_fee": "500.00",
  "total_amount": "2500.00",
  "delivery_message": "Deliver to main gate",
  "escrow_status": "HELD",
  "created_at": "2024-01-15T10:30:00Z",
  "accepted_at": "2024-01-15T11:00:00Z",
  "buyer": {
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone_number": "+2341234567890"
  },
  "seller": {
    "full_name": "Jane Store",
    "email": "jane@store.com",
    "phone_number": "+2340987654321"
  },
  "product_snapshot": {
    "name": "Product Name",
    "images": "image_url",
    "store_name": "Store Name",
    "category": "mens_clothes"
  }
}
```

### Product Data Handling

```javascript
// Handle multiple product data sources
const productName = order.product_snapshot?.name || 
                   order.product_name || 
                   order.product?.name || 
                   'Product';

const productImage = order.product_snapshot?.images || 
                    order.product_images || 
                    order.product?.images || 
                    'https://via.placeholder.com/100';
```

**Data Sources (in priority order):**
1. `product_snapshot` (from OrderDetailSerializer)
2. `product_name` / `product_images` (from OrderListSerializer)
3. `product` object (fallback for old orders)

## API Integration

### Authentication Check
```javascript
if (!api.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
}
```

### Order Actions API

#### 1. Accept Order
```javascript
const response = await api.post(API_CONFIG.ENDPOINTS.ORDER_ACCEPT(orderId), {});
```
**Endpoint:** `POST /api/orders/{id}/accept/`
**Response:** Order status updated to ACCEPTED

#### 2. Cancel Order
```javascript
const response = await api.post(API_CONFIG.ENDPOINTS.ORDER_CANCEL(orderId), {
    reason: 'Changed my mind'
});
```
**Endpoint:** `POST /api/orders/{id}/cancel/`
**Payload:** `{ reason: string }`
**Response:** Order status updated to CANCELLED, escrow refunded

#### 3. Mark as Delivered
```javascript
const response = await api.post(API_CONFIG.ENDPOINTS.ORDER_DELIVER(orderId), {});
```
**Endpoint:** `POST /api/orders/{id}/deliver/`
**Response:** Order status updated to DELIVERED

#### 4. Confirm Receipt
```javascript
const response = await api.post(API_CONFIG.ENDPOINTS.ORDER_CONFIRM(orderId), {});
```
**Endpoint:** `POST /api/orders/{id}/confirm/`
**Response:** Order status updated to CONFIRMED, escrow released

### Order Detail Fetching
```javascript
const orderDetail = await api.get(`${API_CONFIG.ENDPOINTS.ORDERS}${orderId}/`);
```
**Endpoint:** `GET /api/orders/{id}/`
**Response:** Full order details with buyer/seller info

## Order Timeline System

### Timeline Display
```html
<div class="space-y-3">
    <!-- Order Placed -->
    <div class="flex gap-3">
        <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <i data-lucide="check" class="h-4 w-4 text-green-600"></i>
        </div>
        <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">Order Placed</p>
            <p class="text-xs text-gray-500">Jan 15, 2024 at 10:30 AM</p>
        </div>
    </div>
    
    <!-- Additional timeline events -->
</div>
```

### Timeline Events
- **Order Placed**: Always shown (created_at)
- **Order Accepted**: When accepted_at exists
- **Order Delivered**: When delivered_at exists
- **Order Confirmed**: When confirmed_at exists
- **Order Cancelled**: When cancelled_at exists (with cancellation details)

## Escrow System Integration

### Escrow Status Display
```html
<div class="bg-gray-50 rounded-lg p-4">
    <div class="flex justify-between items-center">
        <span class="text-sm text-gray-600">Escrow Status:</span>
        <span class="text-sm font-medium escrow-status-color">HELD</span>
    </div>
    <p class="text-xs text-gray-500 mt-2">💰 Funds are held in escrow...</p>
</div>
```

### Escrow Statuses
- **HELD**: Funds secured, awaiting completion
- **RELEASED**: Payment sent to seller
- **REFUNDED**: Funds returned to buyer

## User Interface Interactions

### Tab Switching
```javascript
function switchOrdersTab(tab) {
    highlightOrdersTab(tab);
    loadOrders(tab);
}
```

**Features:**
- Visual tab highlighting
- Dynamic content loading
- Seller tab conditionally shown

### Order Actions
```javascript
async function handleOrderAction(orderId, action) {
    // Show confirmation modal based on action type
    if (action === 'cancel') {
        showConfirmationModal({
            title: 'Cancel Order',
            message: 'Are you sure you want to cancel this order?',
            // ... modal configuration
        });
    }
}
```

**Action Types:**
- `cancel`: Cancel order with refund
- `confirm`: Confirm receipt, release payment
- `accept`: Accept order as seller
- `deliver`: Mark order as delivered

### Modal Management
```javascript
function showConfirmationModal(options) {
    // Configure modal content dynamically
    modalTitle.textContent = options.title;
    modalMessage.textContent = options.message;
    // ... set icon, buttons, etc.
}
```

**Modal Features:**
- Dynamic icons and colors
- Contextual messaging
- Action confirmation
- Keyboard and click-outside support

## Error Handling

### API Error Handling
```javascript
try {
    const response = await api.post(endpoint, data);
    // Handle success
} catch (error) {
    console.error('Order action error:', error);
    const errorMessage = error.message || 'Failed to perform action.';
    showMessage(errorMessage, 'error');
}
```

### Loading States
```html
<div class="col-span-full text-center py-12">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange mx-auto mb-4"></div>
    <p class="text-gray-600">Loading orders...</p>
</div>
```

### Retry Functionality
```javascript
<button onclick="loadOrders('${view}')" class="bg-primary-orange text-white px-6 py-2 rounded-lg">
    Retry
</button>
```

## Notification System

### Toast Messages
```javascript
function showMessage(message, type) {
    const notification = document.createElement('div');
    // Create styled notification with icon
    // Auto-remove after 4 seconds
}
```

**Message Types:**
- `success`: Green background with check icon
- `error`: Red background with X icon
- `info`: Blue background with info icon
- `warning`: Orange background with alert icon

## Date Formatting

### Relative Date Display
```javascript
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}
```

### Detailed Date Display
```javascript
function formatDetailDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
```

## Rating System Integration

### Post-Confirmation Rating Prompt
```javascript
if (actionType === 'confirm') {
    // Set pending rating flag for global popup
    if (window.setPendingRatingOrder) {
        window.setPendingRatingOrder(orderId);
    } else {
        localStorage.setItem('pendingRatingOrderId', orderId);
    }
}
```

**Integration Points:**
- Automatic rating prompt after order confirmation
- Global rating modal triggered
- Rating data collection for seller feedback

## Technical Implementation

### Dependencies
```html
<!-- External Libraries -->
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

<!-- Local Scripts -->
<script src="/assets/js/config.js"></script>
<script src="/assets/js/api.js"></script>
<script src="/assets/js/orders.js"></script>
<script src="/assets/js/global-rating.js" defer></script>
```

### CSS Custom Properties
```css
:root {
    --primary-orange: #ff6b35;
    --primary-green: #2d5a3d;
}
```

### JavaScript Architecture
- **Event-driven**: DOM event listeners for user interactions
- **Async/await**: Modern JavaScript for API calls
- **Modular functions**: Separated concerns for maintainability
- **Global functions**: Window-scoped functions for modal access

## User Experience Features

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Touch-friendly buttons and interactions
- Adaptive modal sizing

### Accessibility
- Keyboard navigation support
- Screen reader friendly elements
- Proper ARIA labels and roles

### Performance Optimizations
- Lazy loading of order details
- Efficient DOM manipulation
- Minimal re-renders

## Security Considerations

### Authentication
- JWT token validation on page load
- Session timeout handling
- Protected API endpoints

### Data Validation
- Server-side validation for all actions
- Input sanitization
- CSRF protection via JWT

### Escrow Security
- Funds held securely until order completion
- Automatic refunds on cancellation
- Audit trail for all transactions

## Usage Instructions

### For Buyers

#### 1. Viewing Purchase History
- Access "My Purchases" tab
- View all orders sorted by date
- Click any order for detailed view

#### 2. Managing Orders
- **Pending Orders**: Cancel if seller hasn't accepted
- **Accepted Orders**: Track delivery progress
- **Delivered Orders**: Confirm receipt to release payment
- **Completed Orders**: View order history

#### 3. Order Details
- View complete order information
- Track order timeline
- See escrow status
- Access seller contact information

### For Sellers

#### 1. Managing Sales
- Access "My Sales" tab (if seller account)
- View all customer orders
- Accept or reject new orders

#### 2. Order Fulfillment
- Accept orders to start processing
- Mark orders as delivered when shipped
- Monitor buyer confirmations
- Track payment releases

#### 3. Customer Communication
- View delivery instructions
- Access buyer contact information
- Handle order modifications

## Testing Scenarios

### Happy Path Testing
- Complete order lifecycle from acceptance to confirmation
- Successful payment release
- Rating prompt after confirmation

### Error Scenarios
- Network failures during actions
- Invalid order states
- Authentication timeouts

### Edge Cases
- Orders with missing product data
- Multiple concurrent actions
- Browser refresh during operations

## Troubleshooting

### Common Issues

#### 1. Orders Not Loading
**Cause:** API authentication or network issues
**Solution:** Check authentication status, retry loading

#### 2. Actions Not Working
**Cause:** Invalid order state or permissions
**Solution:** Refresh page, check order status

#### 3. Modal Not Closing
**Cause:** JavaScript errors or event conflicts
**Solution:** Use Escape key or manual refresh

#### 4. Rating Not Triggering
**Cause:** Global rating script not loaded
**Solution:** Check script loading order

### Debug Information
```javascript
console.log('Order data:', order);
console.log('API response:', response);
console.log('User permissions:', user.is_seller);
```

## Future Enhancements

### 1. Real-time Updates
- WebSocket integration for live order updates
- Push notifications for status changes
- Real-time chat between buyers and sellers

### 2. Advanced Filtering
- Date range filters
- Status-based filtering
- Search by order number or product

### 3. Bulk Actions
- Bulk order acceptance for sellers
- Multiple order management
- Batch status updates

### 4. Analytics Dashboard
- Sales performance metrics
- Order conversion tracking
- Customer satisfaction analytics

This comprehensive documentation covers all aspects of the COVU marketplace orders page, from UI components to API integrations, ensuring developers can effectively maintain and extend the order management functionality.</content>
<parameter name="filePath">c:\Users\DELL\Desktop\frontend\ORDERS_PAGE_GUIDE.md