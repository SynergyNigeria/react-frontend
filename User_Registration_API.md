# User Registration API Documentation

## Overview

This document describes the user registration process for the Covu Fashion Marketplace frontend application. It covers how the API is used, the JSON data structures exchanged between the frontend (FE) and backend (BE), and the complete registration flow.

## API Configuration

### Base URL
```
https://covu.onrender.com/api # for production
```

### Authentication
The API uses JWT (JSON Web Tokens) for authentication. Registration does not require authentication, but login returns tokens that are stored for subsequent requests.

## Registration Process

### Frontend Implementation

The registration form is implemented as a multi-step wizard with the following steps:

1. **Credentials** - Full name, email, phone number
2. **Location** - State and Local Government Area (LGA)
3. **Security** - Password creation and terms acceptance

#### Form Validation

- **Full Name**: Required, minimum 2 characters
- **Email**: Valid email format, converted to lowercase
- **Phone**: Nigerian phone number format (accepts +234, 234, or 0 prefixes)
- **State**: Required selection from Nigerian states
- **LGA**: Required selection based on chosen state
- **Password**: Minimum 8 characters, must contain uppercase, lowercase, and number
- **Confirm Password**: Must match password
- **Terms**: Must be accepted

### API Call Details

#### Registration Endpoint
```
POST /auth/register/
```

#### Request Headers
```
Content-Type: application/json
```

#### Request JSON Structure

```json
{
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "phone_number": "08012345678",
  "state": "lagos",
  "city": "Ikeja",
  "password": "SecurePass123",
  "password_confirm": "SecurePass123"
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `full_name` | string | Yes | User's full name (2+ characters) |
| `email` | string | Yes | Valid email address (converted to lowercase) |
| `phone_number` | string | Yes | Nigerian phone number in format: 08012345678 |
| `state` | string | Yes | Nigerian state in lowercase with underscores (e.g., "akwa_ibom", "cross_river") |
| `city` | string | Yes | Local Government Area (LGA) name |
| `password` | string | Yes | Password (8+ chars, uppercase, lowercase, number) |
| `password_confirm` | string | Yes | Must match password |

#### State Mapping

The frontend converts user-friendly state names to backend format:

```javascript
const stateMapping = {
  'Abia': 'abia',
  'Adamawa': 'adamawa',
  'Akwa Ibom': 'akwa_ibom',
  'Anambra': 'anambra',
  'Bauchi': 'bauchi',
  'Bayelsa': 'bayelsa',
  'Benue': 'benue',
  'Borno': 'borno',
  'Cross River': 'cross_river',
  'Delta': 'delta',
  'Ebonyi': 'ebonyi',
  'Edo': 'edo',
  'Ekiti': 'ekiti',
  'Enugu': 'enugu',
  'FCT': 'fct',
  'Gombe': 'gombe',
  'Imo': 'imo',
  'Jigawa': 'jigawa',
  'Kaduna': 'kaduna',
  'Kano': 'kano',
  'Katsina': 'katsina',
  'Kebbi': 'kebbi',
  'Kogi': 'kogi',
  'Kwara': 'kwara',
  'Lagos': 'lagos',
  'Nasarawa': 'nasarawa',
  'Niger': 'niger',
  'Ogun': 'ogun',
  'Ondo': 'ondo',
  'Osun': 'osun',
  'Oyo': 'oyo',
  'Plateau': 'plateau',
  'Rivers': 'rivers',
  'Sokoto': 'sokoto',
  'Taraba': 'taraba',
  'Yobe': 'yobe',
  'Zamfara': 'zamfara'
};
```

#### Phone Number Normalization

The frontend normalizes phone numbers to the format expected by the backend:

```javascript
// Convert any format to 0XXXXXXXXXX format
if (normalizedPhone.startsWith('+234')) {
  normalizedPhone = '0' + normalizedPhone.substring(4); // +2348012345678 -> 08012345678
} else if (normalizedPhone.startsWith('234')) {
  normalizedPhone = '0' + normalizedPhone.substring(3); // 2348012345678 -> 08012345678
}
// If it already starts with 0, keep it as is
```

### Backend Response

#### Success Response (201 Created)
```json
{
  "id": 123,
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "phone_number": "08012345678",
  "state": "lagos",
  "city": "Ikeja",
  "is_active": true,
  "is_seller": false,
  "date_joined": "2024-01-15T10:30:00Z"
}
```

#### Error Response (400 Bad Request)
```json
{
  "email": ["This email is already registered."],
  "phone_number": ["This phone number is already in use."],
  "password": ["Password must contain at least one uppercase letter."]
}
```

Common error scenarios:
- Email already exists
- Phone number already registered
- Invalid email format
- Weak password
- Invalid state/city combination
- Phone number format issues

## Auto-Login After Registration

After successful registration, the frontend automatically logs in the user:

### Login Endpoint
```
POST /auth/login/
```

### Login Request
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

### Login Response
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 123,
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "phone_number": "08012345678",
    "state": "lagos",
    "city": "Ikeja",
    "is_active": true,
    "is_seller": false,
    "date_joined": "2024-01-15T10:30:00Z"
  }
}
```

### Token Storage

Tokens are stored in localStorage:
- `access_token`: JWT access token (short-lived)
- `refresh_token`: JWT refresh token (long-lived)
- `current_user`: User data object

## Frontend-Backend Data Flow

### Registration Flow

1. **User fills registration form** (multi-step wizard)
2. **Frontend validation** (client-side checks)
3. **API call to `/auth/register/`** with user data
4. **Backend validation and user creation**
5. **Success response** or **error details**
6. **Auto-login** with credentials
7. **Store tokens and user data**
8. **Redirect to marketplace**

### Error Handling

The frontend handles various error scenarios:

- **Network errors**: Connection issues
- **Validation errors**: Field-specific error messages
- **Server errors**: 500 status codes
- **Duplicate data**: Email/phone already exists

Error messages are displayed using toast notifications with appropriate styling.

## Security Considerations

- Passwords are validated for strength on the frontend
- Phone numbers are normalized and validated
- JWT tokens are stored securely in localStorage
- Auto-token refresh is implemented for expired access tokens
- HTTPS is used for all API communications

## Testing the Registration API

### Using cURL

```bash
curl -X POST https://covu.onrender.com/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "phone_number": "08012345678",
    "state": "lagos",
    "city": "Ikeja",
    "password": "TestPass123",
    "password_confirm": "TestPass123"
  }'
```

### Using JavaScript (Frontend)

```javascript
const response = await api.post(API_CONFIG.ENDPOINTS.REGISTER, {
  full_name: "Test User",
  email: "test@example.com",
  phone_number: "08012345678",
  state: "lagos",
  city: "Ikeja",
  password: "TestPass123",
  password_confirm: "TestPass123"
}, false); // No auth required for registration
```

## Related Endpoints

- `POST /auth/login/` - User authentication
- `POST /auth/token/refresh/` - Refresh access token
- `GET /auth/profile/` - Get user profile (requires auth)
- `POST /auth/become-seller/` - Upgrade account to seller (requires auth)</content>
<parameter name="filePath">c:\Users\DELL\Desktop\Covu_Frontend\User_Registration_API.md