import { useState } from 'react';
import { Link } from 'react-router-dom';
import covuLogo from '@assets/images/COVU MARKET.png';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '@utils/validators';
import { useAuth } from '@hooks/useAuth';
import Button from '@components/common/Button';
import { Eye, EyeOff, ShoppingBag, Shield, Truck } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">

        {/* Left — Brand Panel */}
        <div className="bg-primary md:w-5/12 flex flex-col items-center justify-center p-10 text-white">
          <img src={covuLogo} alt="COVU Market" className="h-28 w-28 object-contain mb-6 rounded-2xl" />
          <h1 className="text-2xl font-bold mb-2 text-center">COVU Market</h1>
          <p className="text-white/80 text-sm text-center mb-10">
            Nigeria's marketplace for smart shoppers and entrepreneurs
          </p>
          <div className="space-y-4 w-full">
            <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
              <ShoppingBag className="w-5 h-5 shrink-0" />
              <span className="text-sm">Safe and secure marketplace</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
              <Truck className="w-5 h-5 shrink-0" />
              <span className="text-sm">Buy or sell your own way</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
              <Shield className="w-5 h-5 shrink-0" />
              <span className="text-sm">You are in control</span>
            </div>
          </div>
        </div>

        {/* Right — Form Panel */}
        <div className="md:w-7/12 flex flex-col justify-center p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-8">Sign in to continue to your account</p>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition ${
                  errors.email ? 'border-red-400' : 'border-gray-300'
                }`}
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 pr-11 border rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition ${
                    errors.password ? 'border-red-400' : 'border-gray-300'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 text-sm font-semibold"
              loading={isLoading}
              disabled={isLoading}
            >
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
