# COVU Marketplace Purchase Page Documentation

## Overview

The Purchase page (`purchase.html`) is the checkout and payment processing interface for the COVU marketplace. It handles the complete purchase flow from product selection to order creation, including wallet balance management, delivery fee calculation, and payment processing through Paystack integration.

## Page Structure and Components

### HTML Structure

The purchase page consists of several key sections:

#### 1. Header Section
```html
<header class="bg-white shadow-sm">
    <div class="max-w-6xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
            <button onclick="history.back()">Back</button>
            <img src="/assets/images/logo/covu-logo.png" alt="Logo">
        </div>
    </div>
</header>
```

**Features:**
- Back navigation button
- COVU logo branding
- Clean, minimal header design

#### 2. Product Information Section
```html
<div class="bg-white rounded-lg shadow-sm p-6 mb-6">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">Product Details</h2>
    <div class="flex items-center gap-4">
        <img id="productImage" src="" alt="Product" class="w-20 h-20 object-cover rounded-lg">
        <div class="flex-1">
            <h3 id="productName" class="font-semibold text-gray-800">Product Name</h3>
            <p id="productStore" class="text-sm text-gray-500">Store Name</p>
            <p id="productPrice" class="text-primary-orange font-bold text-lg">₦0</p>
        </div>
    </div>
</div>
```

**Displays:**
- Product image (20x20 thumbnail)
- Product name
- Store/seller name
- Product price in NGN

#### 3. Wallet Balance Section
```html
<div class="bg-white rounded-lg shadow-sm p-6 mb-6">
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary-green/10 rounded-full flex items-center justify-center">
                <i data-lucide="wallet" class="h-5 w-5 text-primary-green"></i>
            </div>
            <div>
                <p class="text-sm text-gray-500">Wallet Balance</p>
                <p id="walletBalance" class="text-2xl font-bold text-primary-green">₦0</p>
            </div>
        </div>
        <button id="topUpBtn" class="text-primary-orange text-sm font-medium hover:underline">
            Top Up
        </button>
    </div>
</div>
```

**Features:**
- Current wallet balance display
- Top-up wallet button
- Visual wallet icon

#### 4. Payment Summary Section
```html
<div class="bg-white rounded-lg shadow-sm p-6">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h2>
    <div class="space-y-4">
        <div class="flex justify-between items-center">
            <span class="text-gray-600">Subtotal</span>
            <span id="subtotalAmount" class="font-medium">₦0</span>
        </div>
        <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
                <span class="text-gray-600">Delivery Fee</span>
                <div class="group relative">
                    <i data-lucide="info" class="h-4 w-4 text-gray-400 cursor-help"></i>
                    <div class="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-gray-800 text-white text-xs rounded-lg p-2 z-10">
                        Delivery fee varies based on your location relative to the seller's store
                    </div>
                </div>
            </div>
            <span id="deliveryFeeAmount" class="font-medium">₦0</span>
        </div>
        <div class="border-t border-gray-200 pt-4">
            <div class="flex justify-between items-center">
                <span class="font-semibold text-gray-800">Total</span>
                <span id="totalAmount" class="font-bold text-xl text-primary-orange">₦0</span>
            </div>
        </div>
    </div>
</div>
```

**Calculations:**
- Subtotal: Product price
- Delivery Fee: Dynamic based on buyer/seller location
- Total: Subtotal + Delivery Fee

#### 5. Delivery and Payment Inputs
```html
<div class="mt-6">
    <label for="deliveryMessage" class="block text-sm font-medium text-gray-700 mb-2">
        Delivery Message *
    </label>
    <textarea
        id="deliveryMessage"
        rows="3"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange focus:ring-0 text-gray-700"
        placeholder="Enter delivery instructions and your complete address"
        required
    ></textarea>
    <p class="text-xs text-gray-500 mt-1">Include your address, phone number, and any special delivery instructions</p>
</div>

<div class="mt-6">
    <label for="paymentAmount" class="block text-sm font-medium text-gray-700 mb-2">
        Payment Amount
    </label>
    <div class="relative">
        <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
        <input
            type="number"
            id="paymentAmount"
            class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange focus:ring-0 text-gray-700"
            placeholder="Enter amount"
            readonly
        >
    </div>
    <p class="text-xs text-gray-500 mt-1">Amount will be held in escrow until order completion</p>
</div>
```

**Required Fields:**
- Delivery Message: Address, phone, special instructions (minimum 10 characters)
- Payment Amount: Auto-calculated, readonly

#### 6. Proceed to Payment Button
```html
<button id="proceedToPaymentBtn" class="w-full bg-primary-orange text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center gap-2 mt-6">
    <i data-lucide="credit-card" class="h-5 w-5"></i>
    Proceed to Payment
</button>
```

**Validations:**
- Delivery message required and minimum length
- Sufficient wallet balance
- Payment amount matches total

## Modal Components

### 1. Top-Up Wallet Modal
```html
<div id="topUpModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
    <div class="bg-white rounded-lg max-w-md w-full">
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 class="text-lg font-bold text-gray-800">Top Up Wallet</h2>
            <button id="closeTopUpModal">✕</button>
        </div>
        <div class="p-6">
            <div class="mb-4">
                <label for="topUpAmount">Enter Amount (₦)</label>
                <input type="number" id="topUpAmount" min="100" step="100" placeholder="5000">
            </div>
            <div class="flex gap-3">
                <button id="cancelTopUp">Cancel</button>
                <button id="confirmTopUp" class="bg-primary-orange text-white">Top Up</button>
            </div>
        </div>
    </div>
</div>
```

**Features:**
- Amount input with ₦100 minimum
- ₦100,000 maximum limit
- Paystack payment integration

### 2. Purchase Processing Modal
```html
<div id="purchaseModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
    <!-- Loading State -->
    <div id="purchaseLoadingState" class="p-6 text-center">
        <div class="w-16 h-16 bg-primary-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i data-lucide="loader" class="h-8 w-8 text-primary-orange animate-spin"></i>
        </div>
        <h3>Processing Your Purchase</h3>
        <p>We will debit your wallet while we inform the seller about this order...</p>
        <button id="cancelPurchaseBtn">Cancel Purchase</button>
    </div>

    <!-- Success State -->
    <div id="purchaseSuccessState" class="p-6 text-center hidden">
        <div id="successMessage">
            <h3>Payment Successful!</h3>
            <p>Order <span id="orderId">COVU-21947723-98</span> has been placed successfully.</p>
        </div>
        <div id="orderManagementMessage" class="hidden">
            <h3>Order Placed Successfully!</h3>
            <button id="viewOrderBtn">Go to Orders</button>
        </div>
    </div>
</div>
```

**States:**
1. **Loading**: Shows processing animation and cancel option
2. **Success**: Shows order confirmation and navigation to orders

## Data Flow and State Management

### Product Data Loading

```javascript
// Load product data from localStorage (set by product-detail.js)
const productData = JSON.parse(localStorage.getItem('selectedProduct') || '{}');

if (productData.name) {
    // Populate UI elements
    document.getElementById('productImage').src = productData.images;
    document.getElementById('productName').textContent = productData.name;
    document.getElementById('productStore').textContent = productData.store_name;
    document.getElementById('productPrice').textContent = formatCurrency(productData.price);
}
```

**Data Source:** `localStorage.selectedProduct` (set by product-detail page)

### Delivery Fee Calculation

```javascript
// Dynamic delivery fee based on buyer/seller location
let deliveryFee = 2500; // Default fallback

if (productData.store_info) {
    const currentUser = JSON.parse(localStorage.getItem(API_CONFIG.TOKEN_KEYS.USER));
    
    if (currentUser.city && productData.store_info.city) {
        const buyerCity = currentUser.city.toLowerCase().trim();
        const sellerCity = productData.store_info.city.toLowerCase().trim();
        
        if (buyerCity === sellerCity) {
            // Same city/LGA - lower fee
            deliveryFee = parseFloat(productData.store_info.delivery_within_lga);
        } else {
            // Different city - higher fee
            deliveryFee = parseFloat(productData.store_info.delivery_outside_lga);
        }
    }
}
```

**Logic:**
- Same city: `delivery_within_lga` (typically lower)
- Different city: `delivery_outside_lga` (typically higher)
- Fallback: ₦2,500

### Wallet Balance Management

```javascript
async function loadWalletBalance() {
    try {
        // Fetch fresh user data from backend
        const response = await api.get(API_CONFIG.ENDPOINTS.PROFILE);
        const balance = parseFloat(user.wallet_balance || 0);
        
        // Update localStorage and UI
        localStorage.setItem(API_CONFIG.TOKEN_KEYS.USER, JSON.stringify(user));
        document.getElementById('walletBalance').textContent = formatCurrency(balance);
        
        return balance;
    } catch (error) {
        // Fallback to cached data
        const currentUser = api.getCurrentUser();
        const balance = currentUser ? parseFloat(currentUser.wallet_balance || 0) : 0;
        return balance;
    }
}
```

**Features:**
- Real-time balance fetching
- Cached data fallback
- Automatic UI updates

## API Integration

### Authentication Check
```javascript
// Check authentication before loading page
if (!api.isAuthenticated()) {
    window.location.href = 'login.html';
}
```

### Session Validation
```javascript
// Validate session on page load
const sessionValid = await api.ensureValidSession(false);
if (!sessionValid) {
    // Redirect to login if invalid
    return;
}
```

### Paystack Payment Processing

#### 1. Top-Up Wallet Flow
```javascript
async function processTopUp(amount) {
    // Validate session
    const sessionValid = await api.ensureValidSession(true);
    
    // Initialize Paystack payment
    const response = await api.post(API_CONFIG.ENDPOINTS.WALLET_FUND, {
        amount: amount
    });
    
    if (response.status === 'success') {
        // Redirect to Paystack payment page
        window.location.href = response.data.authorization_url;
    }
}
```

**API Endpoint:** `POST /api/wallet/fund/`
**Payload:** `{ amount: number }`
**Response:** `{ status: 'success', data: { authorization_url: string } }`

#### 2. Payment Verification (Return Flow)
```javascript
// Check URL parameters for payment return
const urlParams = new URLSearchParams(window.location.search);
const paymentStatus = urlParams.get('payment');
const reference = urlParams.get('ref');

if (paymentStatus === 'success' && reference) {
    // Verify payment with backend
    const verifyResponse = await api.get(`/wallet/verify/${reference}/`);
    
    if (verifyResponse.status === 'success') {
        // Update wallet balance
        const updatedUser = await api.get(API_CONFIG.ENDPOINTS.PROFILE);
        localStorage.setItem(API_CONFIG.TOKEN_KEYS.USER, JSON.stringify(updatedUser));
    }
}
```

**API Endpoint:** `GET /api/wallet/verify/{reference}/`

### Order Creation

```javascript
async function processPurchase(paymentAmount, productData, deliveryMessage) {
    // Create order via API
    const response = await api.post(API_CONFIG.ENDPOINTS.ORDERS, {
        product_id: productData.id,
        delivery_message: deliveryMessage
    });
    
    // Handle success
    console.log('Order created:', response);
    localStorage.removeItem('selectedProduct'); // Clear cart
}
```

**API Endpoint:** `POST /api/orders/`
**Payload:** `{ product_id: number, delivery_message: string }`
**Response:** `{ id: number, order_number: string, ... }`

## Payment Flow

### 1. Wallet Top-Up Process
1. User clicks "Top Up" button
2. Modal opens with amount input
3. User enters amount (₦100-₦100,000)
4. API call to `/api/wallet/fund/` initializes Paystack payment
5. User redirected to Paystack payment page
6. After payment, user returns with success/failure parameters
7. Backend verifies payment and credits wallet
8. Balance updated in UI

### 2. Purchase Process
1. User reviews product details and payment summary
2. User enters delivery message (address, phone, instructions)
3. User clicks "Proceed to Payment"
4. Validations: delivery message, sufficient balance
5. Purchase modal shows processing state
6. API call to `/api/orders/` creates order
7. Wallet debited, funds held in escrow
8. Success modal shows order confirmation
9. User can navigate to orders page

### 3. Escrow System
- Funds are held in escrow until order completion
- User can cancel order before seller confirmation
- After seller confirmation, order cannot be cancelled
- Funds released to seller upon successful delivery

## Error Handling

### Validation Errors
```javascript
// Delivery message validation
if (!deliveryMessage) {
    alert('Please enter your delivery message with address and instructions.');
    return;
}

if (deliveryMessage.length < 10) {
    alert('Please provide detailed delivery instructions (at least 10 characters).');
    return;
}

// Balance validation
if (paymentAmount > currentBalance) {
    alert('Insufficient wallet balance. Please top up your wallet first.');
    return;
}
```

### API Error Handling
```javascript
try {
    const response = await api.post(endpoint, data);
    // Handle success
} catch (error) {
    let errorMessage = 'Failed to process request.';
    
    if (error.message && error.message.includes('Insufficient funds')) {
        errorMessage = 'Insufficient wallet balance.';
    } else if (error.errors && error.errors.error) {
        errorMessage = error.errors.error;
    }
    
    alert(errorMessage);
}
```

### Session Management
```javascript
// Automatic session validation
const sessionValid = await api.ensureValidSession(true);
if (!sessionValid) {
    // User redirected to login
    return;
}
```

## User Experience Features

### Toast Notifications
```javascript
function showToast(message, type = 'info') {
    // Types: success, error, warning, info
    // Auto-hide after 4 seconds
    // Slide-in animation
}
```

### Loading States
- Processing animation during order creation
- Spinner during payment verification
- Disabled buttons during API calls

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Fixed bottom navigation
- Modal overlays for mobile compatibility

### Accessibility
- Proper form labels and ARIA attributes
- Keyboard navigation support
- Screen reader friendly icons (Lucide)

## Technical Implementation

### Dependencies
```html
<!-- External Libraries -->
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
<script src="https://js.paystack.co/v1/inline.js"></script>

<!-- Local Scripts -->
<script src="/assets/js/config.js"></script>
<script src="/assets/js/api.js"></script>
<script src="/assets/js/purchase.js"></script>
```

### CSS Custom Properties
```css
:root {
    --primary-orange: #ff6b35;
    --primary-green: #2d5a3d;
}
```

### Font and Styling
- **Font:** Montserrat (Google Fonts)
- **Framework:** Tailwind CSS
- **Icons:** Lucide (modern icon library)
- **Colors:** Orange (#ff6b35) and Green (#2d5a3d) theme

## Usage Instructions

### For Users

#### 1. Accessing the Purchase Page
- Navigate from product detail page
- Product data automatically loaded from localStorage
- Authentication required

#### 2. Reviewing Purchase Details
- Verify product information and pricing
- Check current wallet balance
- Review delivery fee calculation

#### 3. Topping Up Wallet (if needed)
- Click "Top Up" button
- Enter amount (₦100 minimum)
- Complete Paystack payment
- Balance updates automatically

#### 4. Completing Purchase
- Enter detailed delivery instructions
- Include complete address and phone number
- Click "Proceed to Payment"
- Confirm in processing modal
- View order confirmation

#### 5. Managing Orders
- Navigate to Orders page after purchase
- Track order status
- Cancel orders before seller confirmation
- Rate seller after delivery

### For Developers

#### 1. Integration Points
```javascript
// Set product data before navigation
const productData = {
    id: 123,
    name: "Product Name",
    price: 2500,
    images: "image_url",
    store_name: "Store Name",
    store_info: {
        delivery_within_lga: 1500,
        delivery_outside_lga: 2500,
        city: "Lagos"
    }
};
localStorage.setItem('selectedProduct', JSON.stringify(productData));
window.location.href = 'purchase.html';
```

#### 2. Customizing Delivery Fees
- Modify calculation logic in `loadProductData()`
- Update store_info structure if needed
- Add new location-based rules

#### 3. Adding Payment Methods
- Extend top-up modal for new payment options
- Update API endpoints in config.js
- Modify payment verification flow

#### 4. Error Handling Customization
- Add custom error messages
- Implement retry logic for failed requests
- Add offline support

## Security Considerations

### 1. Authentication
- JWT token validation on page load
- Session timeout handling
- Automatic logout on invalid sessions

### 2. Payment Security
- Paystack secure payment processing
- Escrow system prevents fraud
- Amount validation on client and server

### 3. Data Validation
- Input sanitization
- Minimum/maximum amount limits
- Required field validation

### 4. API Security
- HTTPS-only requests
- Token refresh handling
- Error message sanitization

## Performance Optimization

### 1. Lazy Loading
- Icons loaded via Lucide library
- Modal content loaded on demand

### 2. Caching
- User profile cached in localStorage
- Product data cached during navigation

### 3. Efficient API Calls
- Single profile fetch for balance updates
- Parallel loading where possible
- Error fallbacks to cached data

### 4. UI Optimization
- Minimal DOM manipulation
- CSS animations for smooth transitions
- Responsive images and layouts

## Testing Scenarios

### 1. Happy Path Testing
- Complete purchase flow with sufficient balance
- Wallet top-up and balance update
- Order creation and confirmation

### 2. Error Scenarios
- Insufficient balance
- Invalid delivery message
- Network failures
- Session timeouts

### 3. Edge Cases
- Very long delivery messages
- Special characters in addresses
- Rapid button clicking
- Browser back/forward navigation

### 4. Payment Testing
- Paystack success/failure callbacks
- Webhook verification
- Balance update accuracy
- Concurrent payment attempts

## Troubleshooting

### Common Issues

#### 1. "No product selected" Error
**Cause:** Missing or invalid product data in localStorage
**Solution:** Ensure navigation from product detail page with proper data structure

#### 2. Balance Not Updating
**Cause:** Failed API call or caching issue
**Solution:** Check network connection, refresh page, or clear localStorage

#### 3. Payment Verification Failed
**Cause:** Paystack webhook issues or reference mismatch
**Solution:** Manual balance check, contact support if needed

#### 4. Order Creation Failed
**Cause:** Invalid product ID or insufficient funds
**Solution:** Verify product availability and wallet balance

### Debug Information
```javascript
// Enable debug logging
console.log('Product data:', productData);
console.log('User data:', currentUser);
console.log('API response:', response);
```

## Future Enhancements

### 1. Multiple Payment Methods
- Bank transfer integration
- Card saving for future purchases
- Digital wallet integrations

### 2. Advanced Delivery Options
- Multiple delivery addresses
- Scheduled delivery
- Express delivery options

### 3. Purchase Analytics
- Conversion tracking
- Purchase funnel analysis
- Customer behavior insights

### 4. Mobile App Integration
- React Native purchase flow
- Mobile payment optimizations
- Push notifications for order updates

This comprehensive documentation covers all aspects of the COVU marketplace purchase page, from UI components to API integrations, ensuring developers can effectively maintain and extend the checkout functionality.</content>
<parameter name="filePath">c:\Users\DELL\Desktop\frontend\PURCHASE_PAGE_GUIDE.md