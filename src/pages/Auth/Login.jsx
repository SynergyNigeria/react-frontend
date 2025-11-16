import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '@utils/validators';
import { useAuth } from '@hooks/useAuth';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import {
  ShoppingCart,
  Store,
  DollarSign,
  Package,
  ShoppingBag,
  Star,
  Truck,
  CreditCard,
  Eye,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      await login(data.email, data.password);
      toast.success('Login successful!');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      toast.error('Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Icons */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-10 left-10 animate-bounce"
          style={{ animationDelay: '0s', animationDuration: '3s' }}
        >
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-white/70" />
          </div>
        </div>
        <div
          className="absolute top-20 right-20 animate-float"
          style={{ animationDelay: '1s', animationDuration: '4s' }}
        >
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
            <Store className="w-6 h-6 text-white/70" />
          </div>
        </div>
        <div
          className="absolute bottom-20 left-20 animate-bounce"
          style={{ animationDelay: '2s', animationDuration: '3.5s' }}
        >
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
            <DollarSign className="w-7 h-7 text-white/70" />
          </div>
        </div>
        <div
          className="absolute bottom-10 right-10 animate-float"
          style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}
        >
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
            <Package className="w-5 h-5 text-white/70" />
          </div>
        </div>
        <div
          className="absolute top-1/2 left-1/4 animate-bounce"
          style={{ animationDelay: '1.5s', animationDuration: '3.2s' }}
        >
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-white/70" />
          </div>
        </div>
        <div
          className="absolute top-1/3 right-1/3 animate-float"
          style={{ animationDelay: '2.5s', animationDuration: '4.2s' }}
        >
          <div className="w-11 h-11 bg-white/10 rounded-full flex items-center justify-center">
            <Star className="w-5 h-5 text-white/70" />
          </div>
        </div>
        <div
          className="absolute top-3/4 left-1/2 animate-bounce"
          style={{ animationDelay: '3s', animationDuration: '3.8s' }}
        >
          <div className="w-13 h-13 bg-white/10 rounded-full flex items-center justify-center">
            <Truck className="w-6 h-6 text-white/70" />
          </div>
        </div>
        <div
          className="absolute top-1/4 left-3/4 animate-float"
          style={{ animationDelay: '1.2s', animationDuration: '5s' }}
        >
          <div className="w-15 h-15 bg-white/10 rounded-full flex items-center justify-center">
            <CreditCard className="w-7 h-7 text-white/70" />
          </div>
        </div>
      </div>

      <div className="max-w-md w-full p-8 relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8 bg-white rounded-2xl py-4 px-6 shadow-md">
          <img src="/src/assets/images/covu.png" alt="COVU Logo" className="h-16 w-auto" />
        </div>

        <h2 className="text-2xl font-bold text-center text-white mb-6">Welcome Back</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50/90 backdrop-blur-sm border border-red-200/50 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          {/* Password Input with Toggle */}
          <div className="w-full">
            <label className="block text-sm font-medium text-white mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full px-4 py-2 pr-12 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent transition-colors bg-white/90 backdrop-blur-sm ${
                  errors.password?.message ? 'ring-1 ring-red-500' : ''
                }`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password?.message && (
              <p className="mt-1 text-sm text-red-300">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded text-primary-600 bg-white/90" />
              <span className="ml-2 text-sm text-white">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-white hover:text-white/80 underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full bg-white text-primary hover:bg-white/90"
            loading={isLoading}
            disabled={isLoading}
          >
            Log In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-white">
            Don't have an account?{' '}
            <Link to="/register" className="text-white hover:text-white/80 font-medium underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
