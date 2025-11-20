# Shop Management Page (shop.html) - Design & API Usage Summary

## Overview

The `shop.html` page serves as the central dashboard for sellers to manage their store on the Covu Fashion Marketplace. It provides comprehensive store management capabilities including store configuration, delivery settings, withdrawal management, and real-time statistics display.

## Page Structure & Design

### Layout Components

#### 1. Header Section
- **Back Navigation**: Arrow button to return to previous page
- **Page Title**: "My Shop" prominently displayed
- **Responsive Design**: Centered layout with proper spacing

#### 2. Hero Section (Store Overview)
- **Gradient Background**: Orange-to-orange gradient with pattern overlay
- **Store Logo**: Circular icon with store branding
- **Store Information**: Name and description display
- **Statistics Cards**: 4 key metrics in a responsive grid:
  - Products count
  - Active orders count
  - Total revenue
  - Store rating

#### 3. Wallet Section
- **Withdraw Funds Button**: Primary CTA for fund withdrawal
- **Glassmorphism Design**: Semi-transparent background with blur effect

#### 4. Store Configuration Section
- **Two Main Cards**:
  - **Delivery Settings**: Configure delivery rates by location
  - **Store Details**: Edit store information and branding

#### 5. Modal System
- **Full-Page Modals**: Comprehensive configuration interfaces
- **Form Validation**: Real-time input validation and feedback
- **Image Upload**: Cloudinary integration for store assets

#### 6. Floating Action Button (FAB)
- **Quick Actions Menu**: Expandable menu for common tasks
- **Smooth Animations**: Scale and translate effects

### Design Features

#### Visual Design
- **Color Scheme**: Primary orange (#ff6b35) with green accents
- **Glassmorphism**: Backdrop blur effects and transparency
- **Gradient Backgrounds**: Dynamic color transitions
- **Card-Based Layout**: Organized content in elevated cards
- **Responsive Grid**: Adapts to different screen sizes

#### Interactive Elements
- **Hover Effects**: Scale transforms and shadow changes
- **Loading States**: Spinner animations during API calls
- **Toast Notifications**: Success/error feedback system
- **Form Animations**: Smooth transitions and focus states

#### Accessibility
- **Semantic HTML**: Proper heading hierarchy and ARIA labels
- **Keyboard Navigation**: Focus management and tab order
- **Screen Reader Support**: Descriptive alt texts and labels
- **Touch-Friendly**: Adequate touch targets for mobile

## API Usage & Logic

### Authentication & Initialization

#### Page Load Sequence
```javascript
1. Check API availability
2. Verify user authentication
3. Load user profile
4. Verify seller status
5. Load store data
6. Load statistics
7. Update UI
```

#### Authentication Check
```javascript
if (!api.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
}
```

### Core API Endpoints Used

#### 1. User Profile API
```javascript
GET /auth/profile/
```
- **Purpose**: Load authenticated user information
- **Response**: User object with seller status
- **Usage**: Verify seller permissions

#### 2. Store Management APIs
```javascript
GET /stores/my_stores/          // Get user's stores
GET /stores/{id}/               // Get detailed store info
PATCH /stores/{id}/             // Update store details
```

#### 3. Statistics APIs
```javascript
GET /orders/stats/              // Get order statistics
GET /ratings/store/{id}/stats/  // Get store ratings
```

#### 4. Wallet APIs
```javascript
GET /wallet/                    // Get wallet balance
POST /wallet/withdraw/          // Request withdrawal
GET /wallet/bank-accounts/      // Get bank accounts
POST /wallet/bank-accounts/     // Add bank account
DELETE /wallet/bank-accounts/{id}/ // Delete bank account
GET /wallet/banks/              // Get Nigerian banks list
```

#### 5. Image Upload API
```javascript
POST /stores/upload_image/      // Upload images to Cloudinary
```

### Key Logic Flows

#### Store Loading Logic
```javascript
async function loadUserStore() {
    // Try my_stores endpoint first
    const stores = await api.get('/stores/my_stores/');
    if (stores.length > 0) {
        currentStore = await loadStoreDetails(stores[0].id);
    } else {
        // Fallback to general stores list
        const allStores = await api.get('/stores/');
        currentStore = allStores.find(store =>
            store.seller_id === currentUser.id
        );
    }
}
```

#### Statistics Calculation
```javascript
async function loadStoreStatistics() {
    // Products from store data
    storeStats.totalProducts = currentStore.products?.length || 0;

    // Orders and revenue from backend
    const statsResponse = await api.get('/orders/stats/');
    storeStats.totalOrders = statsResponse.active_orders || 0;
    storeStats.totalRevenue = statsResponse.revenue || 0;

    // Rating from store data
    storeStats.storeRating = currentStore.average_rating || 0;
}
```

#### Delivery Settings Update
```javascript
async function handleDeliverySubmit(e) {
    const updateData = {
        delivery_within_lga: deliveryRateSame,
        delivery_outside_lga: deliveryRateOutside,
        delivery_outside_state: deliveryRateOutsideState
    };

    const updatedStore = await api.patch(
        `/stores/${currentStore.id}/`,
        updateData
    );
}
```

#### Store Details Update with 60-Day Lock
```javascript
async function handleStoreSubmit(e) {
    // Check if text fields changed (subject to 60-day limit)
    const isImageOnlyUpdate = (logoToUpload || photoToUpload) &&
                              name === currentStore.name;

    const updateData = {};
    if (logoToUpload) updateData.logo = logoToUpload;
    if (photoToUpload) updateData.seller_photo = photoToUpload;

    if (!isImageOnlyUpdate) {
        updateData.name = name;
        updateData.description = description;
        updateData.category = category;
    }

    const updatedStore = await api.patch(
        `/stores/${currentStore.id}/`,
        updateData
    );
}
```

### Image Upload System

#### Cloudinary Integration
```javascript
async function uploadImageToCloudinary(file, folder) {
    // Try backend upload first (secure)
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await fetch('/stores/upload_image/', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        return response.data.url;
    } catch (error) {
        // Fallback to direct Cloudinary upload
        const directResponse = await fetch(
            'https://api.cloudinary.com/v1_1/dpmxcjkfl/image/upload',
            { method: 'POST', body: formData }
        );
        return directResponse.data.secure_url;
    }
}
```

### Withdrawal System

#### Bank Account Management
```javascript
async function fetchNigerianBanks() {
    const response = await api.get('/wallet/banks/');
    nigerianBanks = response.data || response;

    // Sort: Popular fintech first, then alphabetical
    nigerianBanks.sort((a, b) => {
        const popularBanks = ['OPay', 'Moniepoint', 'Palmpay'];
        // Sorting logic...
    });
}
```

#### Account Verification
```javascript
async function verifyBankAccount() {
    const response = await api.post('/wallet/bank-accounts/', {
        bank_name: bankName,
        bank_code: bankCode,
        account_number: accountNumber,
        is_default: userBankAccounts.length === 0
    });

    // Name matching validation
    if (!namesMatch(response.account_name, userFullName)) {
        showWarning('Account name doesn\'t match profile');
    }
}
```

#### Withdrawal Processing
```javascript
async function handleWithdrawalSubmit(e) {
    const amount = parseFloat(amountInput.value);
    const bankAccountId = bankSelect.value;

    // Tiered fee calculation
    let fee = 100; // Default < ₦10K
    if (amount >= 200000) fee = 300;
    else if (amount >= 100000) fee = 250;
    else if (amount >= 50000) fee = 200;
    else if (amount >= 10000) fee = 150;

    const response = await api.post('/wallet/withdraw/', {
        amount: amount,
        bank_account_id: bankAccountId
    });
}
```

### Error Handling & Validation

#### API Error Handling
```javascript
try {
    const response = await api.post(endpoint, data);
} catch (error) {
    if (error.status === 403 && error.data.error.includes('60 days')) {
        showToast('Store details locked for 60 days', 'error');
    } else {
        showToast('Operation failed', 'error');
    }
}
```

#### Form Validation
- **Store Name**: Minimum 3 characters
- **Description**: Minimum 10 characters
- **Account Number**: Exactly 10 digits
- **Withdrawal Amount**: Minimum ₦1,000
- **Image Size**: Maximum 5MB

### State Management

#### Global Variables
```javascript
let currentUser = null;
let currentStore = null;
let storeStats = {
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    storeRating: 0.0
};
let pendingLogoUpload = null;
let pendingSellerPhotoUpload = null;
```

#### Session Persistence
```javascript
// Store pending uploads in sessionStorage
sessionStorage.setItem('pendingLogoUpload', uploadedUrl);
pendingLogoUpload = sessionStorage.getItem('pendingLogoUpload');
```

### UI Update Logic

#### Real-time Statistics
```javascript
function updateStoreUI() {
    document.getElementById('storeName').textContent = currentStore.name;
    document.getElementById('totalProducts').textContent = storeStats.totalProducts;
    document.getElementById('totalRevenue').textContent = formatCurrency(storeStats.totalRevenue);
    // ... update all display elements
}
```

#### Loading States
```javascript
function showLoadingState() {
    const elements = ['storeName', 'totalProducts', 'totalRevenue'];
    elements.forEach(id => {
        const el = document.getElementById(id);
        el.textContent = 'Loading...';
        el.classList.add('animate-pulse');
    });
}
```

### Modal Management

#### Modal System Architecture
- **Multiple Modals**: Delivery, Store Details, Withdrawal
- **State Management**: Open/close with body scroll lock
- **Form Handling**: Separate submit handlers for each modal
- **Data Loading**: Load current values when opening

#### Quick Actions Menu
```javascript
quickActionsBtn.addEventListener('click', () => {
    const isHidden = quickActionsMenu.classList.contains('hidden');
    if (isHidden) {
        quickActionsMenu.classList.remove('hidden');
        setTimeout(() => {
            quickActionsMenu.classList.remove('translate-y-full', 'opacity-0');
        }, 10);
    }
});
```

## Performance Optimizations

### API Call Optimization
- **Sequential Loading**: Load user → store → statistics
- **Error Recovery**: Fallback API calls for store loading
- **Caching**: Store data in memory during session

### Image Handling
- **Lazy Loading**: Images load only when needed
- **Compression**: Automatic resizing via Cloudinary
- **Preview System**: Local preview before upload

### UI Performance
- **Debounced Inputs**: Search and form inputs
- **Virtual Scrolling**: For large lists (future enhancement)
- **Progressive Loading**: Load critical data first

## Security Features

### Authentication
- **JWT Token Validation**: All API calls include Bearer token
- **Session Management**: Automatic token refresh
- **Route Protection**: Redirect unauthenticated users

### Data Validation
- **Server-side Validation**: Backend validates all inputs
- **Client-side Checks**: Immediate feedback for users
- **File Upload Security**: Type and size restrictions

### Financial Security
- **Bank Account Verification**: Paystack integration
- **Name Matching**: Account name validation
- **Withdrawal Limits**: Minimum amounts and balance checks

## Mobile Responsiveness

### Responsive Design
- **Breakpoint System**: Mobile-first approach
- **Flexible Grids**: Auto-adjusting layouts
- **Touch Interactions**: Optimized for touch devices
- **Modal Adaptation**: Full-screen on mobile

### Performance on Mobile
- **Lightweight Animations**: Reduced motion for performance
- **Optimized Images**: Smaller sizes for mobile networks
- **Progressive Enhancement**: Core functionality works without JS

## Future Enhancements

### Planned Features
- **Real-time Notifications**: WebSocket integration
- **Analytics Dashboard**: Advanced store metrics
- **Bulk Operations**: Multiple product management
- **Store Templates**: Pre-built store designs

### API Improvements
- **GraphQL Integration**: More efficient data fetching
- **Caching Layer**: Redis for frequently accessed data
- **Webhook System**: Real-time order notifications

This comprehensive shop management system provides sellers with all the tools they need to effectively manage their Covu marketplace presence, from basic store configuration to advanced financial management.</content>
<parameter name="filePath">c:\Users\DELL\Desktop\Covu_Frontend\Shop_Page_Design_API_Summary.md