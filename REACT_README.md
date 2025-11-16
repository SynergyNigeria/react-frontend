# COVU Marketplace - React Frontend

A modern, feature-rich React e-commerce marketplace for Nigerian entrepreneurs and shoppers. Built with React, Vite, Tailwind CSS, React Query, and Zustand.

## 🚀 Features

- **Authentication System**: Login and multi-step registration with validation
- **Shop Management**: Browse stores with infinite scroll, category filtering, and search
- **Product Catalog**: View products with detailed information, ratings, and reviews
- **Shopping Cart**: Add items, manage quantities, and persist cart data
- **Order Management**: Place orders, track status, and view order history
- **Wallet Integration**: Manage wallet balance and transactions
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **State Management**: Zustand for global state, React Query for server state
- **Form Validation**: React Hook Form with Yup schemas
- **Toast Notifications**: Real-time feedback with react-hot-toast

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running at `https://covu.onrender.com/api` (or your own instance)

## 🛠️ Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd react_front-end
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Update the values as needed:
     ```env
     VITE_API_URL=https://covu.onrender.com/api
     VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key_here
     VITE_APP_NAME=COVU Marketplace
     VITE_PAGE_SIZE=20
     VITE_SCROLL_THRESHOLD=300
     ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Common components (Button, Card, Modal, etc.)
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Spinner.jsx
│   │   ├── Rating.jsx
│   │   ├── ProductCard.jsx
│   │   └── ShopCard.jsx
│   └── layout/          # Layout components
│       ├── Header.jsx
│       ├── Footer.jsx
│       ├── Layout.jsx
│       └── ProtectedRoute.jsx
├── pages/               # Page components
│   ├── Auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── Shop/
│   │   ├── ShopList.jsx
│   │   └── ShopDetail.jsx
│   ├── Product/
│   │   ├── ProductList.jsx
│   │   ├── ProductDetail.jsx
│   │   └── Cart.jsx
│   ├── Order/
│   │   ├── Checkout.jsx
│   │   └── Orders.jsx
│   └── Profile/
│       └── Profile.jsx
├── services/            # API services
│   ├── api.js          # Axios instance with interceptors
│   ├── auth.service.js # Authentication API calls
│   ├── shop.service.js # Shop/Store API calls
│   ├── product.service.js # Product API calls
│   ├── order.service.js   # Order API calls
│   └── wallet.service.js  # Wallet API calls
├── hooks/               # Custom React hooks
│   ├── useAPI.js       # React Query hooks for all API calls
│   ├── useAuth.js      # Authentication hook
│   ├── useCart.js      # Shopping cart hook
│   ├── useDebounce.js  # Debounce hook
│   └── useMediaQuery.js # Responsive design hook
├── store/               # Zustand state management
│   ├── authStore.js    # Authentication state
│   ├── cartStore.js    # Shopping cart state (persisted)
│   └── uiStore.js      # UI state (modals, toasts, etc.)
├── utils/               # Utility functions
│   ├── validators.js   # Yup validation schemas
│   ├── formatters.js   # Formatting utilities
│   ├── cn.js          # Tailwind class merge utility
│   └── nigerianStates.js # Nigerian states and LGAs data
├── config/              # Configuration
│   └── apiConfig.js    # API endpoints and constants
├── assets/              # Static assets
│   └── images/
├── App.jsx              # Main App component with routing
├── main.jsx            # Application entry point
└── index.css           # Global styles with Tailwind directives
```

## 🔑 Key Technologies

### Core

- **React 18**: Latest React with hooks and concurrent features
- **Vite**: Fast build tool and dev server
- **React Router v6**: Client-side routing

### State Management

- **Zustand**: Lightweight state management for global state
- **React Query (TanStack Query)**: Server state management, caching, and data fetching
- **React Hook Form**: Performant form handling
- **Yup**: Schema validation

### UI/Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **react-hot-toast**: Toast notifications
- **react-infinite-scroll-component**: Infinite scroll implementation

### HTTP Client

- **Axios**: Promise-based HTTP client with interceptors

## 🔐 Authentication Flow

1. User enters credentials on Login/Register page
2. API returns JWT access token (15 min) and refresh token (7 days)
3. Tokens stored in localStorage via Zustand store
4. Access token sent with every API request via Axios interceptor
5. On 401 error, automatically refresh token and retry request
6. On refresh failure, redirect to login

## 🛒 Shopping Cart

- **Persistent Storage**: Cart data persisted to localStorage via Zustand persist middleware
- **Add to Cart**: Add products with customizable quantity
- **Update Quantity**: Increase/decrease item quantities
- **Remove Items**: Remove individual items from cart
- **Total Calculation**: Real-time cart total calculation
- **Cart Badge**: Display cart item count in header

## 📡 API Integration

All API calls are centralized in service files with React Query hooks for:

- **Automatic Caching**: Reduce unnecessary API calls
- **Background Refetching**: Keep data fresh
- **Optimistic Updates**: Instant UI updates
- **Error Handling**: Consistent error management
- **Loading States**: Built-in loading indicators

### Example API Hook Usage

```javascript
import { useShops } from '@hooks/useAPI';

function ShopList() {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
  } = useShops(category, searchTerm);

  // data.pages contains paginated results
  const shops = data?.pages.flatMap(page => page.results) || [];

  return (
    <InfiniteScroll
      dataLength={shops.length}
      next={fetchNextPage}
      hasMore={hasNextPage}
    >
      {shops.map(shop => <ShopCard key={shop.id} shop={shop} />)}
    </InfiniteScroll>
  );
}
```

## 🎨 Component Guidelines

### Common Components

- **Button**: Variants (primary, secondary, outline, ghost, danger, success)
- **Card**: Container with shadow and hover effects
- **Input**: Form input with label and error display
- **Modal**: Overlay modal with configurable sizes
- **Spinner**: Loading indicator with size variants
- **Rating**: Star rating display and input

### Best Practices

1. Use TypeScript-style JSDoc comments for prop documentation
2. Implement prop validation with PropTypes or TypeScript
3. Keep components small and focused (Single Responsibility)
4. Extract reusable logic into custom hooks
5. Use Tailwind's @apply sparingly, prefer utility classes
6. Handle loading and error states consistently

## 🧪 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Code Style

- Use functional components with hooks
- Prefer arrow functions for component definitions
- Use destructuring for props and state
- Keep JSX clean and readable
- Use semantic HTML elements

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### Deployment Options

1. **Vercel** (Recommended):
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**:
   - Connect GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Traditional Hosting**:
   - Upload `dist` folder contents
   - Configure server for SPA routing (all routes → index.html)

## 🔧 Configuration

### Vite Config (`vite.config.js`)

- Path aliases configured for cleaner imports
- React plugin for Fast Refresh
- Build optimizations

### Tailwind Config (`tailwind.config.js`)

- Custom color palette (primary, secondary)
- Extended utilities (shadows, animations)
- Configured content paths for purging

### Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the app:

```javascript
// Access in code
const apiUrl = import.meta.env.VITE_API_URL;
```

## 🐛 Troubleshooting

### Common Issues

1. **Port 3000 already in use**:
   - Change port in `vite.config.js` or use `--port` flag
   - Kill process using port 3000

2. **CORS errors**:
   - Ensure backend API allows your origin
   - Check `Access-Control-Allow-Origin` headers

3. **Token expiration**:
   - Check token refresh logic in `api.js`
   - Verify refresh token is valid

4. **Build errors**:
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Clear Vite cache: `rm -rf node_modules/.vite`

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Router](https://reactrouter.com)
- [TanStack Query (React Query)](https://tanstack.com/query)
- [Zustand](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com)
- [React Hook Form](https://react-hook-form.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT

## 👨‍💻 Support

For questions or issues:
- Email: support@covu.com
- GitHub Issues: [repository-url]

---

**Built with ❤️ for Nigerian entrepreneurs**
