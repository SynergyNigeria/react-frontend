# Become a Seller API Documentation

## Overview

This document describes the "Become a Seller" functionality for the Covu Fashion Marketplace frontend application. It covers how the API is used to convert a regular user account to a seller account, the JSON data structures exchanged between the frontend (FE) and backend (BE), and the complete seller activation flow.

## API Configuration

### Base URL
```
https://covu.onrender.com/api
```

### Authentication
The API uses JWT (JSON Web Tokens) for authentication. This endpoint requires a valid authentication token since only logged-in users can become sellers.

## Become Seller Process

### Frontend Implementation

The "Become a Seller" feature is accessible from the user profile page. The process includes:

1. **User clicks "Become a Seller" button** in their profile
2. **Confirmation modal** appears with benefits and information
3. **User confirms** their decision to become a seller
4. **API call** to convert account to seller status
5. **Success modal** shows congratulations and next steps
6. **UI updates** to reflect seller status and show store information

#### User Interface Flow

- **Trigger**: "Become a Seller" button in profile section
- **Confirmation Modal**: Shows benefits (create store, list products, receive payments, get notifications)
- **Success Modal**: Congratulations with next steps (add products, view store)
- **UI Updates**: Profile shows seller badge, store information appears

### API Call Details

#### Become Seller Endpoint
```
POST /auth/become-seller/
```

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer <jwt_access_token>
```

#### Request JSON Structure

The request body is empty - no additional data is required:

```json
{}
```

#### Field Descriptions

No request fields are required. The backend uses the authenticated user's JWT token to identify which user account to convert to seller status.

### Backend Response

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Successfully upgraded to seller account",
  "user": {
    "id": 123,
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "phone_number": "08012345678",
    "state": "lagos",
    "city": "Ikeja",
    "is_active": true,
    "is_seller": true,
    "date_joined": "2024-01-15T10:30:00Z"
  },
  "store": {
    "id": 456,
    "name": "John Doe's Store",
    "description": "",
    "owner": 123,
    "location": "Ikeja, Lagos",
    "is_active": true,
    "created_at": "2024-01-20T14:30:00Z",
    "total_products": 0,
    "total_orders": 0,
    "rating": 0.0
  }
}
```

#### Error Response (400 Bad Request or 403 Forbidden)
```json
{
  "error": "User is already a seller"
}
```

Common error scenarios:
- User is already a seller
- Invalid authentication token
- User account is deactivated
- Server/database errors

## Frontend-Backend Data Flow

### Become Seller Flow

1. **User initiates request** from profile page
2. **Confirmation modal** displays benefits and requirements
3. **User confirms action** by clicking "Yes, Become a Seller!"
4. **API call to `/auth/become-seller/`** with empty body and auth token
5. **Backend validation** and account conversion
6. **Store creation** automatically for the new seller
7. **Success response** with updated user and store data
8. **UI updates** to reflect seller status
9. **Success modal** shows next steps

### Data Updates

After successful conversion:

- **User object**: `is_seller` field changes from `false` to `true`
- **Store creation**: New store automatically created with default name and location
- **Local storage**: Updated user data stored locally
- **UI elements**: Seller badge appears, store management options become available

## Store Creation Details

When a user becomes a seller, the backend automatically creates a store with:

- **Store Name**: "{User's Full Name}'s Store"
- **Location**: Based on user's city and state
- **Owner**: Links to the user account
- **Status**: Active and ready for product listings
- **Initial Stats**: 0 products, 0 orders, 0.0 rating

## Security Considerations

- **Authentication Required**: Only authenticated users can become sellers
- **One-time Action**: Users cannot "unbecome" sellers after conversion
- **Account Validation**: Backend validates user account status before conversion
- **Atomic Operation**: Store creation and user update happen together or not at all

## User Experience Features

### Confirmation Modal Benefits
- ✅ Create your own store
- ✅ List unlimited products
- ✅ Receive payments securely
- ✅ Get instant order notifications

### Success Modal Next Steps
- ✅ Store Created - Your COVU store is live and ready for customers
- Add Your Products - Start listing products to attract customers
- Start Selling - We'll help your products reach the right buyers

### Free to Join
- No setup fees or monthly charges
- Commission-based revenue model
- Full seller dashboard access

## Testing the Become Seller API

### Using cURL

```bash
curl -X POST https://covu.onrender.com/api/auth/become-seller/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_ACCESS_TOKEN" \
  -d '{}'
```

### Using JavaScript (Frontend)

```javascript
const response = await api.post(API_CONFIG.ENDPOINTS.BECOME_SELLER, {});
```

## Related Endpoints

- `GET /auth/profile/` - Get user profile (shows seller status)
- `GET /stores/my_stores/` - Get seller's stores (after becoming seller)
- `POST /products/` - Create products (available to sellers)
- `GET /orders/` - View orders (available to sellers)

## Error Handling

The frontend handles various error scenarios:

- **Network errors**: Connection issues, timeout
- **Authentication errors**: Invalid/expired token
- **Validation errors**: User already a seller
- **Server errors**: 500 status codes, database issues

Error messages are displayed using toast notifications with appropriate styling and user-friendly messages.

## Post-Conversion Features

After becoming a seller, users gain access to:

- **Store Management**: Edit store details, branding
- **Product Management**: Add, edit, delete products
- **Order Management**: View and manage customer orders
- **Analytics**: Sales reports, customer insights
- **Seller Dashboard**: Comprehensive seller tools

The conversion is permanent and provides immediate access to all seller features.</content>
<parameter name="filePath">c:\Users\DELL\Desktop\Covu_Frontend\Become_Seller_API.md