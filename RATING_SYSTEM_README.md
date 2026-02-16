# COVU Marketplace - Rating & Review System

## Overview

The COVU Marketplace rating and review system provides a seamless way for buyers to rate sellers and leave feedback after successful order completion. The system triggers an automatic popup modal after buyers confirm delivery of their orders.

## 🎯 How It Works

### Trigger Point
The rating popup is automatically triggered when a buyer **confirms delivery** of an order in the orders management section. This occurs after:

1. Buyer places an order and completes payment
2. Seller fulfills and marks the order as delivered
3. Buyer confirms receipt (releases payment to seller)
4. **Rating popup appears** on the next page load

### User Experience Flow

```
Order Purchase → Seller Delivery → Buyer Confirmation → Rating Popup → Feedback Submission
```

## 🔧 Technical Implementation

### Core Files

- **`assets/js/global-rating.js`** - Main popup logic and UI
- **`assets/js/orders.js`** - Triggers popup after order confirmation
- **`assets/js/api.js`** - Handles API communication
- **`assets/js/config.js`** - API endpoint configuration

### API Integration

#### Rating Submission Endpoint
```
POST https://covu.onrender.com/api/ratings/
```

#### Request Payload
```json
{
  "order_id": 123,
  "rating": 5,
  "review": "Excellent service and fast delivery!"
}
```

#### Response
```json
{
  "id": 456,
  "order": 123,
  "rating": 5,
  "review": "Excellent service and fast delivery!",
  "created_at": "2024-01-15T10:30:00Z",
  "status": "pending_moderation"
}
```

### Code Implementation

#### 1. Trigger Mechanism (orders.js)
```javascript
// After buyer confirms delivery
} else if (actionType === 'confirm') {
    response = await api.post(API_CONFIG.ENDPOINTS.ORDER_CONFIRM(orderId), {});
    showMessage('Order confirmed successfully. Payment released to seller.', 'success');

    // Set pending rating flag for global popup
    if (window.setPendingRatingOrder) {
        window.setPendingRatingOrder(orderId);
    } else {
        localStorage.setItem('pendingRatingOrderId', orderId);
    }
}
```

#### 2. Popup Display (global-rating.js)
```javascript
// Check for pending ratings on page load
document.addEventListener('DOMContentLoaded', function() {
    const orderId = localStorage.getItem('pendingRatingOrderId');
    if (orderId) {
        setTimeout(() => createRatingModal(orderId), 800);
    }
});

// Global function to set rating trigger
window.setPendingRatingOrder = function(orderId) {
    localStorage.setItem('pendingRatingOrderId', orderId);
};
```

#### 3. Modal Creation
```javascript
async function createRatingModal(orderId) {
    // Fetch order details to display store name
    const order = await api.get(`/orders/${orderId}/`);
    const storeName = order.product?.store_name || '';

    // Create modal with star rating interface
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div style="background:#fff;padding:2rem 1.5rem;border-radius:1rem;max-width:95vw;width:370px;text-align:center;">
            <h2 style="font-size:1.2rem;font-weight:600;margin-bottom:0.7rem;">
                You just completed an order purchase${storeName ? ` from <span style='color:#ff6b35'>${storeName}</span>` : ''}!
            </h2>
            <div style="font-size:1rem;color:#444;margin-bottom:1.1rem;">
                Please rate this seller and tell us your experience. Your feedback helps us improve Covu for everyone.
            </div>
            <div id="ratingStars" style="margin-bottom:1rem;font-size:2rem;">
                ${[1,2,3,4,5].map(i => `<span data-star="${i}" style="cursor:pointer;color:#ccc;">&#9733;</span>`).join('')}
            </div>
            <textarea id="ratingReview" rows="3" style="width:100%;border:1px solid #eee;border-radius:0.5rem;padding:0.5rem;margin-bottom:1rem;resize:none;" placeholder="Optional review..."></textarea>
            <button id="submitRatingBtn" style="background:#ff6b35;color:#fff;padding:0.7rem 1.5rem;border:none;border-radius:0.5rem;font-weight:600;cursor:pointer;">Submit</button>
            <button id="dismissRatingBtn" style="margin-left:1rem;background:#eee;color:#333;padding:0.7rem 1.5rem;border:none;border-radius:0.5rem;font-weight:500;cursor:pointer;">Later</button>
            <div id="ratingError" style="color:#d00;font-size:0.95rem;margin-top:0.7rem;display:none;"></div>
        </div>
    `;

    document.body.appendChild(modal);
    // ... star selection and submit logic
}
```

#### 4. Rating Submission
```javascript
// Submit rating to API
const response = await api.post('/ratings/', {
    order_id: orderId,
    rating: selectedRating,
    review: reviewText
});

// Clear pending flag and show success
localStorage.removeItem('pendingRatingOrderId');
modal.innerHTML = `<div style='padding:2rem 1rem;'><h2 style='color:#2d5a3d'>Thank you for your feedback!</h2><p>Your rating has been submitted for moderation.</p></div>`;
setTimeout(() => modal.remove(), 2500);
```

## 🎨 UI Features

### Star Rating Interface
- **5-star rating system** with clickable stars
- **Hover effects** for better UX
- **Visual feedback** with color changes (#ffb400 for selected)
- **Required field** - must select at least 1 star

### Review Text
- **Optional textarea** for detailed feedback
- **Character limit** handled by textarea constraints
- **Placeholder text** guides user input

### Modal Design
- **Responsive design** (max-width: 95vw, width: 370px)
- **Centered overlay** with dark background
- **Rounded corners** and shadow for modern look
- **Orange accent color** (#ff6b35) matching brand

### Error Handling
- **API error display** in red text
- **Loading states** during submission
- **Fallback behavior** if API unavailable

## 🔄 Data Flow

### 1. Order Confirmation
```
Buyer clicks "Confirm Delivery" → POST /orders/{id}/confirm/ → Success
```

### 2. Rating Trigger
```
Order confirmation success → setPendingRatingOrder(orderId) → localStorage flag set
```

### 3. Popup Display
```
Page load → check localStorage → createRatingModal(orderId) → Show popup
```

### 4. Rating Submission
```
User selects rating + review → POST /ratings/ → Clear localStorage → Show success
```

## 🔐 Security & Validation

### Authentication
- **JWT token required** for all API calls
- **Automatic token refresh** if expired
- **Session validation** before submission

### Input Validation
- **Rating required** (1-5 stars)
- **Review optional** but sanitized
- **Order ID validation** from localStorage

### Error Handling
- **Network failures** gracefully handled
- **Invalid responses** show user-friendly messages
- **Token expiration** triggers refresh or logout

## 📱 Cross-Platform Compatibility

### Browser Support
- **Modern browsers** (Chrome, Firefox, Safari, Edge)
- **Mobile responsive** design
- **Touch-friendly** star selection

### Device Compatibility
- **Desktop** - Mouse hover effects
- **Mobile** - Touch interactions
- **Tablet** - Optimized sizing

## 🔧 Configuration

### Timing
- **Popup delay**: 800ms after page load
- **Success display**: 2500ms before auto-close

### Styling
- **Brand colors**: Orange (#ff6b35), Gold (#ffb400)
- **Modal size**: 370px width, responsive
- **Font sizes**: Responsive scaling

### API Settings
- **Base URL**: https://covu.onrender.com/api
- **Timeout**: 30 seconds
- **Retry logic**: Automatic token refresh

## 🧪 Testing Scenarios

### Happy Path
1. Complete order purchase
2. Seller marks as delivered
3. Buyer confirms delivery
4. Rating popup appears
5. Select 5 stars + review
6. Submit successfully
7. Success message shown
8. Popup closes automatically

### Edge Cases
- **No internet**: Error message displayed
- **Token expired**: Automatic refresh attempted
- **Invalid order ID**: API returns error
- **No rating selected**: Validation prevents submission
- **Popup dismissed**: Can be triggered again later

## 🚀 Future Enhancements

### Potential Improvements
- **Photo uploads** with ratings
- **Rating categories** (delivery, product quality, service)
- **Seller responses** to reviews
- **Rating analytics** dashboard
- **Review moderation** interface

### React Migration
```javascript
// Planned component structure
<RatingModal
  orderId={orderId}
  storeName={storeName}
  onSubmit={handleRatingSubmit}
  onDismiss={handleRatingDismiss}
/>
```

## 📊 Metrics & Analytics

### Tracking Points
- **Popup display rate** after order confirmation
- **Completion rate** (submitted vs dismissed)
- **Average rating** distribution
- **Review length** statistics
- **API success/failure** rates

## 🐛 Troubleshooting

### Common Issues
1. **Popup not showing**: Check localStorage for 'pendingRatingOrderId'
2. **API errors**: Verify JWT token validity
3. **Styling issues**: Check Tailwind CSS loading
4. **Mobile display**: Test responsive breakpoints

### Debug Logs
```javascript
// Enable debug logging
console.log('[GlobalRating] Pending rating orderId found:', orderId);
console.log('[GlobalRating] Submitting rating:', {order_id: orderId, rating: selected, review});
```

## 📚 Related Documentation

- [COVU API Documentation](../api/README.md)
- [Orders Management System](../orders/README.md)
- [Authentication Flow](../auth/README.md)
- [UI Components Library](../components/README.md)

---

**Last Updated**: February 15, 2026
**Version**: 1.0.0
**Maintainer**: COVU Development Team</content>
<parameter name="filePath">c:\Users\hp\Desktop\Covu_Frontend\RATING_SYSTEM_README.md