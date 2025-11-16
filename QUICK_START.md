# Quick Setup Guide

## Step 1: Install Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

This will install all required packages including:

- React & React DOM
- React Router
- Axios for API calls
- TanStack Query (React Query)
- Zustand for state management
- React Hook Form & Yup for forms
- Tailwind CSS for styling
- And more...

## Step 2: Configure Environment

The `.env` file is already created with default values. Update if needed:

```env
VITE_API_URL=https://covu.onrender.com/api
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key_here
```

## Step 3: Start Development Server

```powershell
npm run dev
```

The app will open at `http://localhost:3000`

## Step 4: Build for Production (Optional)

When ready to deploy:

```powershell
npm run build
```

Output will be in the `dist` folder.

## Project Features Implemented

✅ **Authentication**

- Login page with form validation
- Multi-step registration (3 steps)
- JWT token management with auto-refresh
- Protected routes

✅ **Shop/Store Features**

- Shop list with infinite scroll
- Category filtering
- Search functionality
- Individual shop detail pages
- Shop rating system

✅ **Product Features**

- Product catalog with infinite scroll
- Product detail pages
- Add to cart functionality
- Product search and filtering
- Product ratings and reviews

✅ **Shopping Cart**

- Persistent cart (localStorage)
- Add/remove items
- Update quantities
- Cart count badge in header

✅ **Checkout & Orders**

- Checkout page with delivery info
- Multiple payment methods (Wallet/Card)
- Order placement
- Order history
- Order status tracking

✅ **User Profile**

- View profile information
- Wallet balance display
- Account settings
- Logout functionality

✅ **UI Components**

- Reusable Button component
- Card component
- Modal component
- Input component with validation
- Spinner/Loader
- Rating component
- Product & Shop cards
- Header with navigation
- Footer with links

✅ **State Management**

- Zustand stores (auth, cart, UI)
- React Query for server state
- Persistent cart storage

✅ **Utilities**

- Form validators (Yup schemas)
- Formatters (currency, dates, etc.)
- Nigerian states and LGAs data
- Debounce hook
- Media query hooks

## Folder Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   └── layout/          # Layout components
├── pages/               # Page components
│   ├── Auth/            # Login, Register
│   ├── Shop/            # Shop list, details
│   ├── Product/         # Products, cart
│   ├── Order/           # Checkout, orders
│   └── Profile/         # User profile
├── services/            # API service layers
├── hooks/               # Custom React hooks
├── store/               # Zustand state stores
├── utils/               # Utility functions
├── config/              # Configuration files
└── assets/              # Images, etc.
```

## Common Commands

```powershell
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Next Steps

1. **Customize Branding**: Update logo, colors in `tailwind.config.js`
2. **Add Paystack Key**: Add your Paystack public key to `.env`
3. **Test API Connection**: Ensure backend API is running
4. **Add Features**: Extend with more features as needed
5. **Deploy**: Deploy to Vercel, Netlify, or your hosting provider

## Need Help?

- Check `REACT_README.md` for detailed documentation
- Review individual component files for usage examples
- Check the original `README.md` for API documentation

Happy coding! 🚀
