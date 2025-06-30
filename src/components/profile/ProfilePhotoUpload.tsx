import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoUpdate: (url: string) => void;
  isEditing: boolean;
}

export function ProfilePhotoUpload({ currentPhotoUrl, onPhotoUpdate, isEditing }: ProfilePhotoUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    try {
      setUploading(true);

      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${user.auth_id}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('profile-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Replace existing file
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-assets')
        .getPublicUrl(data.path);

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_photo_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      onPhotoUpdate(publicUrl);
      toast.success('Profile photo updated!');

    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo. Please try again.');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!user || !currentPhotoUrl) return;

    try {
      setUploading(true);

      // Update user profile to remove photo URL
      const { error } = await supabase
        .from('users')
        .update({ profile_photo_url: '' })
        .eq('id', user.id);

      if (error) throw error;

      onPhotoUpdate('');
      setPreviewUrl(null);
      toast.success('Profile photo removed');

    } catch (error: any) {
      console.error('Error removing photo:', error);
      toast.error('Failed to remove photo');
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = previewUrl || currentPhotoUrl;

  return (
    <div className="relative">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.jpg,.jpeg,.png"
        onChange={handleFileSelect}
        className="hidden"
        disabled={!isEditing || uploading}
      />

      {/* Profile Photo Display */}
      <div className="relative group">
        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-white" />
          )}
          
          {/* Loading overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Upload/Edit Button */}
        {isEditing && (
          <div className="absolute -bottom-2 -right-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              size="sm"
              className="w-8 h-8 p-0 rounded-full shadow-lg"
              title="Change profile photo"
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {isEditing && (currentPhotoUrl || previewUrl) && (
        <div className="mt-2 flex justify-center">
          <Button
            onClick={handleRemovePhoto}
            variant="outline"
            size="sm"
            disabled={uploading}
            className="text-red-600 hover:text-red-700 hover:border-red-300"
          >
            <X className="w-3 h-3" />
            Remove
          </Button>
        </div>
      )}

      {/* Upload Instructions */}
      {isEditing && !currentPhotoUrl && !previewUrl && (
        <div className="mt-2 text-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            <Upload className="w-4 h-4 inline mr-1" />
            Add Photo
          </button>
          <p className="text-xs text-gray-500 mt-1">
            JPG, PNG up to 2MB
          </p>
        </div>
      )}
    </div>
  );
}