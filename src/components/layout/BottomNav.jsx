import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingBag, Store } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';

const BottomNav = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    {
      path: '/',
      label: 'Shops',
      icon: Home,
    },
    {
      path: '/products',
      label: 'Products',
      icon: Package,
    },
    {
      path: '/orders',
      label: 'Orders',
      icon: ShoppingBag,
      requiresAuth: true,
    },
    {
      path: '/seller/gallery',
      label: 'My Store',
      icon: Store,
      requiresAuth: true,
      requiresSeller: true,
    },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (item.requiresAuth && !isAuthenticated) return false;
    if (item.requiresSeller && !user?.is_seller) return false;
    return true;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 transition-colors ${
                isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
