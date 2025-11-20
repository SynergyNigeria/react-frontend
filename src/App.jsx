import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Layout
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages (we'll create these next)
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ShopList from './pages/Shop/ShopList';
import ShopDetail from './pages/Shop/ShopDetail';
import ProductList from './pages/Product/ProductList';
import ProductDetail from './pages/Product/ProductDetail';
import Cart from './pages/Product/Cart';
import Orders from './pages/Order/Orders';
import Profile from './pages/Profile/Profile';
import Purchase from './pages/Order/Purchase';
import StoreManagement from './pages/Seller/StoreManagement';
import ErrorBoundary from './components/common/ErrorBoundary';

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Shop List - No Layout (handles own header/bottom nav) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ShopList />
              </ProtectedRoute>
            }
          />

          {/* Shop Detail - No Layout (full page design like ShopList) */}
          <Route
            path="/shop/:shopId"
            element={
              <ProtectedRoute>
                <ShopDetail />
              </ProtectedRoute>
            }
          />

          {/* Purchase Page - No Layout (full page checkout design) */}
          <Route
            path="/purchase"
            element={
              <ProtectedRoute>
                <Purchase />
              </ProtectedRoute>
            }
          />

          {/* Store Management - No Layout (full page design) */}
          <Route
            path="/seller/store"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <StoreManagement />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes with Layout */}
          <Route element={<Layout />}>
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <ProductList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/product/:productId"
              element={
                <ProtectedRoute>
                  <ProductDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
