import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';

const Header = ({ showLogo = true }) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          {showLogo && (
            <Link to="/" className="flex items-center">
              <img src="/src/assets/images/covu.png" alt="COVU Logo" className="h-8 w-auto" />
            </Link>
          )}

          {/* Spacer for centering */}
          {!showLogo && <div className="flex-1" />}

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Profile Link */}
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 p-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <User className="h-6 w-6" />
                  <span className="hidden md:block text-sm font-medium">
                    {user?.first_name || 'User'}
                  </span>
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
