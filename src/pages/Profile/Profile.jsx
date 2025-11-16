import { useAuth } from '@hooks/useAuth';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import { User, Mail, Phone, MapPin, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Profile Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-900">
                      {user.first_name} {user.last_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{user.email}</p>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                )}

                {user.location && (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold text-gray-900">{user.location}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Button variant="outline" className="w-full sm:w-auto">
                  Edit Profile
                </Button>
              </div>
            </div>
          </Card>

          {/* Wallet */}
          {user.wallet_balance !== undefined && (
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Wallet</h2>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Balance</span>
                  <span className="text-2xl font-bold text-primary-600">
                    ₦{user.wallet_balance.toLocaleString()}
                  </span>
                </div>
                <Button variant="primary" className="w-full sm:w-auto">
                  Fund Wallet
                </Button>
              </div>
            </Card>
          )}

          {/* Account Actions */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Account Settings
              </h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                {!user.is_seller && (
                  <Button variant="outline" className="w-full justify-start">
                    Become a Seller
                  </Button>
                )}
                <Button
                  variant="danger"
                  className="w-full justify-start"
                  onClick={logout}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
