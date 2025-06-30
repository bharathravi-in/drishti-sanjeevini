import React, { useState } from 'react';
import { User, MapPin, Globe, CreditCard, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import { ProfileFormData } from '../../types/auth';
import {
  validateRequired,
  validatePostalCode,
  validateInterests,
  validateEmail,
} from '../../utils/validation';

const INTERESTS = [
  'Education',
  'Healthcare',
  'Employment',
  'Counseling',
  'Donation',
];

export function ProfileForm() {
  const { user, completeProfile, loading } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    interests: [],
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    upi_id: '',
    bank_account: '',
    paypal_email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
    if (errors.interests) {
      setErrors(prev => ({ ...prev, interests: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    const nameError = validateRequired(formData.full_name, 'Full name');
    if (nameError) newErrors.full_name = nameError;
    
    const interestsError = validateInterests(formData.interests);
    if (interestsError) newErrors.interests = interestsError;
    
    if (formData.postal_code) {
      const postalCodeError = validatePostalCode(formData.postal_code);
      if (postalCodeError) newErrors.postal_code = postalCodeError;
    }
    
    if (formData.paypal_email) {
      const paypalEmailError = validateEmail(formData.paypal_email);
      if (paypalEmailError) newErrors.paypal_email = 'Please enter a valid PayPal email';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await completeProfile(formData);
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Complete Your Profile</h2>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Complete your profile to start using the platform and connect with your community
        </p>
        <div className="mt-4 inline-flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Role: {user.role === 'seeker' ? 'I Need Help' : 'I Want to Help'}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                <p className="text-gray-600 text-sm">Tell us about yourself</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                error={errors.full_name}
              />
              <Input
                label="Email Address"
                type="email"
                value={user.email}
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Your Interests *</h3>
                <p className="text-gray-600 text-sm">Select areas where you can help or need support</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                    formData.interests.includes(interest)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{interest}</span>
                    {formData.interests.includes(interest) && (
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {errors.interests && (
              <p className="text-sm text-red-600 mt-2">{errors.interests}</p>
            )}
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
                <p className="text-gray-600 text-sm">Help us connect you with local community members</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your street address"
                error={errors.address}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  error={errors.city}
                />
                <Input
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  error={errors.state}
                />
                <Input
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
                  error={errors.country}
                />
                <Input
                  label="Postal Code"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  placeholder="Postal Code"
                  error={errors.postal_code}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                <p className="text-gray-600 text-sm">Optional - for receiving donations or support</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  💡 <strong>Optional:</strong> Add payment methods to receive donations or support from the community
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="UPI ID"
                  name="upi_id"
                  value={formData.upi_id}
                  onChange={handleChange}
                  placeholder="yourname@upi"
                  error={errors.upi_id}
                />
                <Input
                  label="PayPal Email"
                  name="paypal_email"
                  type="email"
                  value={formData.paypal_email}
                  onChange={handleChange}
                  placeholder="paypal@example.com"
                  error={errors.paypal_email}
                />
              </div>
              <Input
                label="Bank Account"
                name="bank_account"
                value={formData.bank_account}
                onChange={handleChange}
                placeholder="Account number (optional)"
                error={errors.bank_account}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="px-8"
          >
            <CheckCircle className="w-4 h-4" />
            Complete Profile
          </Button>
        </div>
      </form>
    </div>
  );
}