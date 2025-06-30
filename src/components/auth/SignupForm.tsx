import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, UserPlus, Heart, HandHeart } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { validateEmail, validatePassword, validateConfirmPassword } from '../../utils/validation';

interface SignupFormProps {
  onToggleMode: () => void;
}

export function SignupForm({ onToggleMode }: SignupFormProps) {
  const { signUp, loading } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as 'seeker' | 'supporter' | '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleSelect = (role: 'seeker' | 'supporter') => {
    setFormData(prev => ({ ...prev, role }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
    
    if (!formData.role) newErrors.role = 'Please select your role';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await signUp(formData.email, formData.password, formData.role);
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('joinCommunity')}</h2>
        <p className="text-gray-600 dark:text-gray-400">Create your account to get started</p>
      </div>

      {/* Role Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Your role helps us personalize your journey
        </label>
        <div className="grid grid-cols-1 gap-3">
          <Card
            className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
              formData.role === 'seeker'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md'
                : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 hover:bg-green-50/30 dark:hover:bg-green-900/10'
            }`}
          >
            <button
              type="button"
              onClick={() => handleRoleSelect('seeker')}
              className="w-full text-left"
            >
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className={`p-3 rounded-full transition-all duration-300 ${
                  formData.role === 'seeker' 
                    ? 'bg-green-500 text-white shadow-lg' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  <Heart className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{t('iNeedHelp')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Looking for support and assistance from the community</p>
                </div>
                {formData.role === 'seeker' && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </button>
          </Card>

          <Card
            className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
              formData.role === 'supporter'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md'
                : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 hover:bg-green-50/30 dark:hover:bg-green-900/10'
            }`}
          >
            <button
              type="button"
              onClick={() => handleRoleSelect('supporter')}
              className="w-full text-left"
            >
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className={`p-3 rounded-full transition-all duration-300 ${
                  formData.role === 'supporter' 
                    ? 'bg-green-500 text-white shadow-lg' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  <HandHeart className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{t('iWantToHelp')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ready to support others and make a difference</p>
                </div>
                {formData.role === 'supporter' && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </button>
          </Card>
        </div>
        {errors.role && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.role}</p>
        )}
      </div>

      <div className="space-y-4">
        <Input
          label={t('email')}
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          icon={<Mail className="w-5 h-5" />}
          error={errors.email}
          autoComplete="email"
        />

        <div className="relative">
          <Input
            label={t('password')}
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password (8+ characters)"
            icon={<Lock className="w-5 h-5" />}
            error={errors.password}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="relative">
          <Input
            label={t('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            icon={<Lock className="w-5 h-5" />}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-9 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        loading={loading}
        className="w-full"
        size="lg"
      >
        <UserPlus className="w-5 h-5" />
        {t('createAccount')}
      </Button>

      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
          >
            Sign in here
          </button>
        </p>
      </div>
    </form>
  );
}