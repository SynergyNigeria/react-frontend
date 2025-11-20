import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingBag, Store, Sparkles } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import toast from 'react-hot-toast';

const BottomNav = () => {
  const location = useLocation();
  const { user, isAuthenticated, becomeSeller, isLoading } = useAuth();

  console.log('becomeSeller:', becomeSeller);

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
      path: '/seller/store',
      label: user?.is_seller ? 'My Store' : 'Become Seller',
      icon: user?.is_seller ? Store : Sparkles,
      requiresAuth: true,
    },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (item.requiresAuth && !isAuthenticated) return false;
    return true;
  });

  const handleBecomeSeller = async () => {
    try {
      await becomeSeller({});
      toast.success('Welcome to COVU! You are now a seller.');
    } catch (error) {
      console.error('Become seller error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to become a seller. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isBecomeSeller = item.label === 'Become Seller';

          if (isBecomeSeller) {
            return (
              <button
                key={item.path}
                onClick={handleBecomeSeller}
                disabled={isLoading}
                className={`flex flex-col items-center justify-center flex-1 py-2 px-1 transition-colors ${
                  isLoading ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:text-primary'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          }

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
