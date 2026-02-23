import { useState } from 'react';
import { Link } from 'react-router-dom';
import covuLogo from '@assets/images/COVU MARKET.png';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerSchema } from '@utils/validators';
import { useAuth } from '@hooks/useAuth';
import { getStates, getLGAsByState } from '@utils/nigerianStates';
import Button from '@components/common/Button';
import { ChevronRight, ChevronLeft, Eye, EyeOff, ShoppingBag, Shield, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const { register: registerUser, isLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedState, setSelectedState] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
  });

  const states = getStates();
  const lgas = selectedState ? getLGAsByState(selectedState) : [];
  const watchState = watch('state');

  const handleStateChange = (e) => setSelectedState(e.target.value);

  const nextStep = async () => {
    let fieldsToValidate = [];
    if (step === 1) fieldsToValidate = ['full_name', 'email', 'phone'];
    else if (step === 2) fieldsToValidate = ['state', 'lga'];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const stateMapping = {
    Abia:'abia',Adamawa:'adamawa','Akwa Ibom':'akwa_ibom',Anambra:'anambra',
    Bauchi:'bauchi',Bayelsa:'bayelsa',Benue:'benue',Borno:'borno',
    'Cross River':'cross_river',Delta:'delta',Ebonyi:'ebonyi',Edo:'edo',
    Ekiti:'ekiti',Enugu:'enugu',FCT:'fct',Gombe:'gombe',Imo:'imo',
    Jigawa:'jigawa',Kaduna:'kaduna',Kano:'kano',Katsina:'katsina',
    Kebbi:'kebbi',Kogi:'kogi',Kwara:'kwara',Lagos:'lagos',
    Nasarawa:'nasarawa',Niger:'niger',Ogun:'ogun',Ondo:'ondo',
    Osun:'osun',Oyo:'oyo',Plateau:'plateau',Rivers:'rivers',
    Sokoto:'sokoto',Taraba:'taraba',Yobe:'yobe',Zamfara:'zamfara',
  };

  const normalizePhone = (phone) => {
    let p = phone.trim();
    if (p.startsWith('+234')) p = '0' + p.substring(4);
    else if (p.startsWith('234')) p = '0' + p.substring(3);
    return p;
  };

  const onSubmit = async (data) => {
    try {
      setError('');
      const payload = {
        full_name: data.full_name,
        email: data.email.toLowerCase(),
        phone_number: normalizePhone(data.phone),
        state: stateMapping[data.state] || data.state.toLowerCase().replace(/ /g, '_'),
        city: data.lga,
        password: data.password,
        password_confirm: data.confirm_password,
      };
      await registerUser(payload);
      toast.success('Registration successful!');
    } catch (err) {
      const apiErrors = err.response?.data;
      if (apiErrors && typeof apiErrors === 'object') {
        setError(Object.values(apiErrors).flat().join(' '));
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
      toast.error('Registration failed');
    }
  };

  const inputClass = (hasError) =>
    `w-full px-4 py-2.5 border rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition ${hasError ? 'border-red-400' : 'border-gray-300'}`;

  const stepLabels = ['Personal Info', 'Location', 'Password'];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">

        <div className="bg-primary md:w-5/12 flex flex-col items-center justify-center p-10 text-white">
          <img src={covuLogo} alt="COVU Market" className="h-28 w-28 object-contain mb-6 rounded-2xl" />
          <h1 className="text-2xl font-bold mb-2 text-center">COVU Market</h1>
          <p className="text-white/80 text-sm text-center mb-10">
            Nigeria&apos;s marketplace for smart shoppers and entrepreneurs
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

        <div className="md:w-7/12 flex flex-col justify-center p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
          <p className="text-gray-500 text-sm mb-5">Step {step} of 3 &mdash; {stepLabels[step - 1]}</p>

          <div className="flex gap-1.5 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-primary' : 'bg-gray-200'}`} />
            ))}
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input placeholder="John Doe" className={inputClass(errors.full_name)} {...register('full_name')} />
                  {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <input type="email" placeholder="you@example.com" className={inputClass(errors.email)} {...register('email')} />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input placeholder="08012345678" className={inputClass(errors.phone)} {...register('phone')} />
                  {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select {...register('state')} onChange={(e) => { register('state').onChange(e); handleStateChange(e); }} className={inputClass(errors.state)}>
                    <option value="">Select State</option>
                    {states.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Local Government Area</label>
                  <select {...register('lga')} disabled={!selectedState && !watchState} className={`${inputClass(errors.lga)} disabled:bg-gray-100 disabled:text-gray-400`}>
                    <option value="">Select LGA</option>
                    {lgas.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                  {errors.lga && <p className="mt-1 text-xs text-red-500">{errors.lga.message}</p>}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} placeholder="........" className={inputClass(errors.password)} style={{paddingRight:'2.75rem'}} {...register('password')} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? 'text' : 'password'} placeholder="........" className={inputClass(errors.confirm_password)} style={{paddingRight:'2.75rem'}} {...register('confirm_password')} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirm_password && <p className="mt-1 text-xs text-red-500">{errors.confirm_password.message}</p>}
                </div>
                <label className="flex items-start gap-2">
                  <input type="checkbox" {...register('terms')} className="mt-0.5 rounded accent-primary" />
                  <span className="text-sm text-gray-600">
                    I agree to the <Link to="/terms" className="text-primary hover:underline">Terms and Conditions</Link>
                  </span>
                </label>
                {errors.terms && <p className="text-xs text-red-500">{errors.terms.message}</p>}
              </>
            )}

            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1 text-sm">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" variant="primary" onClick={nextStep} className="flex-1 text-sm">
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" variant="primary" className="flex-1 text-sm" loading={isLoading} disabled={isLoading}>
                  Create Account
                </Button>
              )}
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
