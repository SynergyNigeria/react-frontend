import { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useFundWallet } from '@hooks/useAPI';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import Modal from '@components/common/Modal';
import { api } from '@services/api';
import { ENDPOINTS } from '@config/apiConfig';
import { User, Mail, Phone, MapPin, LogOut, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout } = useAuth();
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const walletFundMutation = useFundWallet();

  // Fetch wallet balance on component mount
  useEffect(() => {
    const loadWalletBalance = async () => {
      try {
        const walletResponse = await api.get(ENDPOINTS.WALLET_BALANCE);
        setWalletBalance(walletResponse.data.balance || 0);
      } catch (err) {
        console.error('Error loading wallet balance:', err);
        setWalletBalance(0);
      }
    };

    if (user) {
      loadWalletBalance();
    }
  }, [user]);

  // Handle top-up wallet
  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount < 100 || amount > 100000) {
      toast.error('Please enter a valid amount between ₦100 and ₦100,000');
      return;
    }

    try {
      const response = await walletFundMutation.mutateAsync({ amount });
      if (response.status === 'success') {
        // Refresh wallet balance
        const walletResponse = await api.get(ENDPOINTS.WALLET_BALANCE);
        setWalletBalance(walletResponse.data.balance || 0);
        // Redirect to Paystack payment page
        window.location.href = response.data.authorization_url;
      }
    } catch (err) {
      console.error('Top-up error:', err);
      toast.error('Failed to initiate payment. Please try again.');
    }
  };

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
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Wallet</h2>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Balance</span>
                <span className="text-2xl font-bold text-primary-600">
                  ₦{walletBalance.toLocaleString()}
                </span>
              </div>
              <Button 
                variant="primary" 
                className="w-full sm:w-auto"
                onClick={() => setIsTopUpModalOpen(true)}
              >
                Fund Wallet
              </Button>
            </div>
          </Card>

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

      {/* Top-Up Modal */}
      <Modal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        title="Top Up Your Wallet"
        size="md"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Add Funds to Wallet</h3>
            <p className="text-gray-600">Secure payment powered by Paystack</p>
          </div>

          <div>
            <label htmlFor="topUpAmount" className="block text-sm font-semibold text-gray-700 mb-3">
              Amount (₦)
            </label>
            <input
              type="number"
              id="topUpAmount"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              min="100"
              max="100000"
              step="100"
              placeholder="5000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-center text-lg font-semibold bg-white text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Minimum ₦100 • Maximum ₦100,000
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => setIsTopUpModalOpen(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleTopUp}
              disabled={walletFundMutation.isLoading}
              loading={walletFundMutation.isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Add Funds
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
