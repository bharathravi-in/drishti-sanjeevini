import React, { useState, useEffect } from 'react';
import { User, MapPin, CreditCard, CheckCircle, Save, RotateCcw, Edit3, Sparkles, Calendar, TrendingUp, Award } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LanguageSelector } from '../ui/LanguageSelector';
import { ProfilePhotoUpload } from './ProfilePhotoUpload';
import { CoverPhotoUpload } from './CoverPhotoUpload';
import { FollowStats } from '../follows/FollowStats';
import { FollowButton } from '../follows/FollowButton';
import { DonationButton } from '../donations/DonationButton';
import { StartConversationButton } from '../messaging/StartConversationButton';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';
import { ProfileFormData } from '../../types/auth';
import {
  validateRequired,
  validatePostalCode,
  validateInterests,
  validateEmail,
} from '../../utils/validation';
import toast from 'react-hot-toast';

const INTERESTS = [
  { value: 'Education', icon: '📚', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'Healthcare', icon: '🏥', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'Employment', icon: '💼', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'Counseling', icon: '🤝', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'Donation', icon: '💝', color: 'bg-pink-100 text-pink-700 border-pink-200' },
];

interface ExtendedProfileFormData extends ProfileFormData {
  profile_photo_url: string;
  cover_photo_url: string;
  username: string;
}

interface ProfileDetailsProps {
  viewingUserId?: string;
  isPublicView?: boolean;
}

export function ProfileDetails({ viewingUserId, isPublicView = false }: ProfileDetailsProps) {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [formData, setFormData] = useState<ExtendedProfileFormData>({
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
    profile_photo_url: '',
    cover_photo_url: '',
    username: '',
  });
  const [originalData, setOriginalData] = useState<ExtendedProfileFormData>({
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
    profile_photo_url: '',
    cover_photo_url: '',
    username: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isOwnProfile = !viewingUserId || (user && user.id === viewingUserId);
  const displayUser = isOwnProfile ? user : profileUser;

  useEffect(() => {
    if (viewingUserId && !isOwnProfile) {
      fetchProfileUser();
    }
  }, [viewingUserId, isOwnProfile]);

  const fetchProfileUser = async () => {
    if (!viewingUserId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', viewingUserId)
        .single();

      if (error) throw error;
      setProfileUser(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOwnProfile && user) {
      const userData: ExtendedProfileFormData = {
        full_name: user.full_name || '',
        interests: user.interests || [],
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        postal_code: user.postal_code || '',
        upi_id: user.upi_id || '',
        bank_account: user.bank_account || '',
        paypal_email: user.paypal_email || '',
        profile_photo_url: (user as any).profile_photo_url || '',
        cover_photo_url: (user as any).cover_photo_url || '',
        username: (user as any).username || '',
      };
      setFormData(userData);
      setOriginalData(userData);
    }
  }, [user, isOwnProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    
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
    setTouched(prev => ({ ...prev, interests: true }));
    
    if (errors.interests) {
      setErrors(prev => ({ ...prev, interests: '' }));
    }
  };

  const handlePhotoUpdate = (url: string) => {
    setFormData(prev => ({ ...prev, profile_photo_url: url }));
  };

  const handleCoverUpdate = (url: string) => {
    setFormData(prev => ({ ...prev, cover_photo_url: url }));
  };

  const validateForm = () => {
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

    if (formData.username) {
      if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        newErrors.username = 'Username can only contain letters, numbers, and underscores';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !user) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', user.id);

      if (error) {
        if (error.code === '23505' && error.message.includes('username')) {
          setErrors({ username: 'This username is already taken' });
          return;
        }
        throw error;
      }

      setOriginalData(formData);
      setIsEditing(false);
      setTouched({});
      toast.success('Profile updated successfully!');
      
      window.location.reload();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(originalData);
    setErrors({});
    setTouched({});
    setIsEditing(false);
    toast.success('Changes reset');
  };

  const handleEditToggle = () => {
    if (isEditing && hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        handleReset();
      }
    } else {
      setIsEditing(!isEditing);
    }
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
  const profileCompletion = calculateProfileCompletion();

  function calculateProfileCompletion() {
    const currentData = isOwnProfile ? formData : displayUser;
    if (!currentData) return 0;
    
    const fields = [
      currentData.full_name,
      currentData.interests?.length > 0,
      currentData.city,
      currentData.state,
      currentData.country,
      currentData.profile_photo_url,
      currentData.username,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }

  if (!displayUser) return null;

  const displayData = isOwnProfile ? formData : {
    full_name: displayUser.full_name || '',
    interests: displayUser.interests || [],
    address: displayUser.address || '',
    city: displayUser.city || '',
    state: displayUser.state || '',
    country: displayUser.country || '',
    postal_code: displayUser.postal_code || '',
    upi_id: displayUser.upi_id || '',
    bank_account: displayUser.bank_account || '',
    paypal_email: displayUser.paypal_email || '',
    profile_photo_url: displayUser.profile_photo_url || '',
    cover_photo_url: displayUser.cover_photo_url || '',
    username: displayUser.username || '',
  };

  return (
    <div className={`max-w-5xl mx-auto space-y-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="relative">
        <CoverPhotoUpload
          currentCoverUrl={displayData.cover_photo_url}
          onCoverUpdate={handleCoverUpdate}
          isEditing={isOwnProfile && isEditing}
        />
        
        <div className="absolute -bottom-16 left-0 right-0 px-6">
          <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6 rtl:space-x-reverse">
            <div className="relative z-10">
              <ProfilePhotoUpload
                currentPhotoUrl={displayData.profile_photo_url}
                onPhotoUpdate={handlePhotoUpdate}
                isEditing={isOwnProfile && isEditing}
              />
            </div>
            
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {displayData.full_name || 'Your Profile'}
                  </h1>
                  {displayData.username && (
                    <p className="text-gray-600 dark:text-gray-400 mb-2">@{displayData.username}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      displayUser.role === 'seeker' 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    }`}>
                      <span className="mr-2">{displayUser.role === 'seeker' ? '🤝' : '❤️'}</span>
                      {displayUser.role === 'seeker' ? 'I Need Help' : 'I Want to Help'}
                    </div>
                    
                    {displayData.city && displayData.state && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {displayData.city}, {displayData.state}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-3">
                    <FollowStats userId={displayUser.id} />
                    
                    {!isOwnProfile && (
                      <div className="flex items-center space-x-2">
                        <FollowButton
                          targetUserId={displayUser.id}
                          targetUserName={displayData.full_name}
                          size="sm"
                        />
                        <StartConversationButton
                          targetUserId={displayUser.id}
                          targetUserName={displayData.full_name}
                          onConversationStarted={() => {
                            toast.success('Opening messages...');
                          }}
                        />
                        <DonationButton
                          recipientName={displayData.full_name}
                          recipientId={displayUser.id}
                          upiId={displayData.upi_id}
                          paypalEmail={displayData.paypal_email}
                          bankAccount={displayData.bank_account}
                        />
                      </div>
                    )}
                    
                    {isOwnProfile && (
                      <DonationButton
                        recipientName={displayData.full_name}
                        recipientId={displayUser.id}
                        upiId={displayData.upi_id}
                        paypalEmail={displayData.paypal_email}
                        bankAccount={displayData.bank_account}
                      />
                    )}
                  </div>
                  
                  {isOwnProfile && (
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-xs">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${profileCompletion}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {profileCompletion}% complete
                      </span>
                    </div>
                  )}
                </div>
                
                {isOwnProfile && (
                  <div className="flex space-x-3 rtl:space-x-reverse">
                    {!isEditing ? (
                      <Button
                        onClick={() => setIsEditing(true)}
                        size="lg"
                        className="shadow-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <Button
                          onClick={handleSave}
                          loading={loading}
                          disabled={!hasChanges}
                          size="lg"
                          className="shadow-lg"
                        >
                          <Save className="w-4 h-4" />
                          Save Changes
                        </Button>
                        <Button
                          onClick={handleReset}
                          variant="outline"
                          disabled={loading}
                          size="lg"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reset
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-20"></div>

      {isOwnProfile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Member Since</h3>
              <p className="text-blue-600 dark:text-blue-400 font-medium">
                {new Date(displayUser.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Profile Score</h3>
              <p className="text-green-600 dark:text-green-400 font-medium">
                {profileCompletion}% Complete
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Interests</h3>
              <p className="text-purple-600 dark:text-purple-400 font-medium">
                {displayData.interests.length} Selected
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {!isOwnProfile && displayData.interests.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Interests</h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {displayData.interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {interest}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isOwnProfile && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className={`transition-all duration-200 ${isEditing ? 'ring-2 ring-green-200 dark:ring-green-800' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Your basic account details</p>
                      </div>
                    </div>
                    {isEditing && (
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                        ✏️ Editing
                      </div>
                    )}
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
                      disabled={!isEditing}
                      className={isEditing ? 'ring-1 ring-green-200 dark:ring-green-800' : ''}
                    />
                    <Input
                      label="Username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Choose a unique username"
                      error={errors.username}
                      disabled={!isEditing}
                      className={isEditing ? 'ring-1 ring-green-200 dark:ring-green-800' : ''}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      value={displayUser.email}
                      disabled
                      className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-60 md:col-span-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className={`transition-all duration-200 ${isEditing ? 'ring-2 ring-green-200 dark:ring-green-800' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Interests *</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Areas where you can help or need support</p>
                      </div>
                    </div>
                    {isEditing && (
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                        ✏️ Editing
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {INTERESTS.map((interest) => (
                      <button
                        key={interest.value}
                        type="button"
                        onClick={() => isEditing && handleInterestToggle(interest.value)}
                        disabled={!isEditing}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 text-left group ${
                          formData.interests.includes(interest.value)
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md'
                            : 'border-gray-300 dark:border-gray-600'
                        } ${
                          isEditing 
                            ? 'hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer hover:shadow-md transform hover:scale-[1.02]' 
                            : 'cursor-default'
                        } ${
                          !isEditing && !formData.interests.includes(interest.value) 
                            ? 'opacity-50' 
                            : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <span className="text-2xl">{interest.icon}</span>
                            <span className="font-medium text-gray-900 dark:text-white">{interest.value}</span>
                          </div>
                          {formData.interests.includes(interest.value) && (
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  {errors.interests && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-3 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.interests}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className={`transition-all duration-200 ${isEditing ? 'ring-2 ring-green-200 dark:ring-green-800' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Address Information</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Help us connect you with local community members</p>
                      </div>
                    </div>
                    {isEditing && (
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                        ✏️ Editing
                      </div>
                    )}
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
                      disabled={!isEditing}
                      className={isEditing ? 'ring-1 ring-green-200 dark:ring-green-800' : ''}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <Input
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        error={errors.city}
                        disabled={!isEditing}
                        className={isEditing ? 'ring-1 ring-green-200 dark:ring-green-800' : ''}
                      />
                      <Input
                        label="State"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="State"
                        error={errors.state}
                        disabled={!isEditing}
                        className={isEditing ? 'ring-1 ring-green-200 dark:ring-green-800' : ''}
                      />
                      <Input
                        label="Country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="Country"
                        error={errors.country}
                        disabled={!isEditing}
                        className={isEditing ? 'ring-1 ring-green-200 dark:ring-green-800' : ''}
                      />
                      <Input
                        label="Postal Code"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleChange}
                        placeholder="Postal Code"
                        error={errors.postal_code}
                        disabled={!isEditing}
                        className={isEditing ? 'ring-1 ring-green-200 dark:ring-green-800' : ''}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className={`transition-all duration-200 ${isEditing ? 'ring-2 ring-green-200 dark:ring-green-800' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Info</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Optional payment methods</p>
                      </div>
                    </div>
                    {isEditing && (
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                        ✏️ Editing
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isEditing && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-blue-800 dark:text-blue-300 text-sm">
                          💡 <strong>Optional:</strong> Add payment methods to receive donations or support
                        </p>
                      </div>
                    )}
                    <Input
                      label="UPI ID"
                      name="upi_id"
                      value={formData.upi_id}
                      onChange={handleChange}
                      placeholder="yourname@upi"
                      error={errors.upi_id}
                      disabled={!isEditing}
                      className={isEditing ? 'ring-1 ring-green-200 dark:ring-green-800' : ''}
                    />
                    <Input
                      label="PayPal Email"
                      name="paypal_email"
                      type="email"
                      value={formData.paypal_email}
                      onChange={handleChange}
                      placeholder="paypal@example.com"
                      error={errors.paypal_email}
                      disabled={!isEditing}
                      className={isEditing ? 'ring-1 ring-green-200 dark:ring-green-800' : ''}
                    />
                    <Input
                      label="Bank Account"
                      name="bank_account"
                      value={formData.bank_account}
                      onChange={handleChange}
                      placeholder="Account number (optional)"
                      error={errors.bank_account}
                      disabled={!isEditing}
                      className={isEditing ? 'ring-1 ring-green-200 dark:ring-green-800' : ''}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">App Settings</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Customize your experience</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Theme</span>
                      <ThemeToggle />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Language</span>
                      <LanguageSelector />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-3 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Profile Tips
                  </h4>
                  <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      Add a profile photo to increase trust
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      Complete your address for local connections
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      Select relevant interests to find your community
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      Add payment info to receive support
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {isEditing && hasChanges && (
            <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 z-50">
              <div className="bg-amber-100 dark:bg-amber-900/90 border border-amber-300 dark:border-amber-700 rounded-lg p-4 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    <span className="text-amber-800 dark:text-amber-200 font-medium">
                      You have unsaved changes
                    </span>
                  </div>
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <Button
                      onClick={handleSave}
                      loading={loading}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                    >
                      Discard
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}