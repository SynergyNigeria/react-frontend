# Project Directory Structure

```
react_front-end/
│
├── public/                          # Static public assets
│   └── favicon.ico
│
├── src/                            # Source code
│   │
│   ├── assets/                     # Static assets (images, fonts, etc.)
│   │   └── images/
│   │
│   ├── components/                 # React components
│   │   ├── common/                 # Reusable UI components
│   │   │   ├── Button.jsx          # Button component with variants
│   │   │   ├── Card.jsx            # Card container component
│   │   │   ├── Input.jsx           # Form input with validation
│   │   │   ├── Modal.jsx           # Modal/dialog component
│   │   │   ├── ProductCard.jsx     # Product display card
│   │   │   ├── Rating.jsx          # Star rating component
│   │   │   ├── ShopCard.jsx        # Shop/store display card
│   │   │   └── Spinner.jsx         # Loading spinner
│   │   │
│   │   └── layout/                 # Layout components
│   │       ├── Footer.jsx          # Page footer with links
│   │       ├── Header.jsx          # Navigation header
│   │       ├── Layout.jsx          # Main layout wrapper
│   │       └── ProtectedRoute.jsx  # Route authentication wrapper
│   │
│   ├── pages/                      # Page components (routes)
│   │   ├── Auth/                   # Authentication pages
│   │   │   ├── Login.jsx           # Login page
│   │   │   └── Register.jsx        # Multi-step registration
│   │   │
│   │   ├── Shop/                   # Shop/store pages
│   │   │   ├── ShopList.jsx        # All shops with infinite scroll
│   │   │   └── ShopDetail.jsx      # Individual shop page
│   │   │
│   │   ├── Product/                # Product pages
│   │   │   ├── Cart.jsx            # Shopping cart page
│   │   │   ├── ProductDetail.jsx   # Individual product page
│   │   │   └── ProductList.jsx     # All products with filters
│   │   │
│   │   ├── Order/                  # Order pages
│   │   │   ├── Checkout.jsx        # Checkout process
│   │   │   └── Orders.jsx          # Order history
│   │   │
│   │   └── Profile/                # User profile pages
│   │       └── Profile.jsx         # User profile & settings
│   │
│   ├── services/                   # API service layer
│   │   ├── api.js                  # Axios instance & interceptors
│   │   ├── auth.service.js         # Authentication APIs
│   │   ├── order.service.js        # Order management APIs
│   │   ├── product.service.js      # Product APIs
│   │   ├── shop.service.js         # Shop/store APIs
│   │   └── wallet.service.js       # Wallet & payment APIs
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAPI.js               # React Query API hooks
│   │   ├── useAuth.js              # Authentication hook
│   │   ├── useCart.js              # Shopping cart hook
│   │   ├── useDebounce.js          # Debounce utility hook
│   │   └── useMediaQuery.js        # Responsive breakpoint hooks
│   │
│   ├── store/                      # Zustand state stores
│   │   ├── authStore.js            # Auth state (user, tokens)
│   │   ├── cartStore.js            # Cart state (persisted)
│   │   └── uiStore.js              # UI state (modals, toasts)
│   │
│   ├── utils/                      # Utility functions
│   │   ├── cn.js                   # Tailwind class merge utility
│   │   ├── formatters.js           # Format currency, dates, etc.
│   │   ├── nigerianStates.js       # Nigerian states & LGAs data
│   │   └── validators.js           # Yup validation schemas
│   │
│   ├── config/                     # Configuration
│   │   └── apiConfig.js            # API endpoints & constants
│   │
│   ├── App.jsx                     # Main app with routing
│   ├── main.jsx                    # Application entry point
│   └── index.css                   # Global styles (Tailwind)
│
├── .env                            # Environment variables
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
├── eslint.config.js                # ESLint configuration
├── index.html                      # HTML entry point
├── jsconfig.json                   # JavaScript configuration
├── package.json                    # Dependencies & scripts
├── postcss.config.js               # PostCSS configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── vite.config.js                  # Vite build configuration
│
├── README.md                       # Original vanilla JS docs
├── REACT_README.md                 # React implementation docs
└── QUICK_START.md                  # Quick setup guide
```

## Key Files Explained

### Configuration Files

- **vite.config.js**: Build tool configuration, path aliases
- **tailwind.config.js**: Custom colors, themes, utilities
- **package.json**: Dependencies and npm scripts
- **.env**: Environment variables (API URL, keys, etc.)
- **jsconfig.json**: IDE path resolution

### Core Application Files

- **main.jsx**: Renders React app into DOM
- **App.jsx**: Routing configuration & providers
- **index.css**: Global styles with Tailwind directives
- **index.html**: HTML shell for the SPA

### Component Organization

- **common/**: Reusable UI components used across pages
- **layout/**: Page structure components (Header, Footer)
- **pages/**: Route-based page components

### Business Logic

- **services/**: API communication layer
- **hooks/**: Reusable React hooks for data & logic
- **store/**: Global state management (Zustand)
- **utils/**: Pure utility functions

## Import Aliases

The project uses path aliases for cleaner imports:

```javascript
import Button from "@components/common/Button";
import { useAuth } from "@hooks/useAuth";
import { formatCurrency } from "@utils/formatters";
import { API_CONFIG } from "@config/apiConfig";
```

Available aliases:

- `@/` → `src/`
- `@components/` → `src/components/`
- `@pages/` → `src/pages/`
- `@services/` → `src/services/`
- `@hooks/` → `src/hooks/`
- `@store/` → `src/store/`
- `@utils/` → `src/utils/`
- `@config/` → `src/config/`
- `@assets/` → `src/assets/`

## File Naming Conventions

- **Components**: PascalCase with `.jsx` extension (e.g., `Button.jsx`)
- **Hooks**: camelCase starting with `use` (e.g., `useAuth.js`)
- **Services**: camelCase with `.service.js` suffix (e.g., `auth.service.js`)
- **Stores**: camelCase with `Store` suffix (e.g., `authStore.js`)
- **Utils**: camelCase (e.g., `formatters.js`)

## Getting Started

1. Install dependencies: `npm install`
2. Configure `.env` file
3. Start dev server: `npm run dev`
4. Open browser: `http://localhost:3000`

See `QUICK_START.md` for detailed instructions!
