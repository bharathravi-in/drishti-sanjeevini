import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface CoverPhotoUploadProps {
  currentCoverUrl?: string;
  onCoverUpdate: (url: string) => void;
  isEditing: boolean;
}

export function CoverPhotoUpload({ currentCoverUrl, onCoverUpdate, isEditing }: CoverPhotoUploadProps) {
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

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setUploading(true);

      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `cover.${fileExt}`;
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
        .update({ cover_photo_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      onCoverUpdate(publicUrl);
      toast.success('Cover photo updated!');

    } catch (error: any) {
      console.error('Error uploading cover photo:', error);
      toast.error('Failed to upload cover photo. Please try again.');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveCover = async () => {
    if (!user || !currentCoverUrl) return;

    try {
      setUploading(true);

      // Update user profile to remove cover URL
      const { error } = await supabase
        .from('users')
        .update({ cover_photo_url: '' })
        .eq('id', user.id);

      if (error) throw error;

      onCoverUpdate('');
      setPreviewUrl(null);
      toast.success('Cover photo removed');

    } catch (error: any) {
      console.error('Error removing cover photo:', error);
      toast.error('Failed to remove cover photo');
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = previewUrl || currentCoverUrl;

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

      {/* Cover Photo Display */}
      <div className="relative group">
        <div className="w-full h-48 rounded-lg overflow-hidden bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 border border-gray-200 dark:border-gray-700">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No cover photo</p>
              </div>
            </div>
          )}
          
          {/* Loading overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}

          {/* Upload Button Overlay */}
          {isEditing && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-white/90 text-gray-900 hover:bg-white"
                >
                  <Camera className="w-4 h-4" />
                  {displayUrl ? 'Change Cover' : 'Upload Cover'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="absolute top-3 right-3 flex space-x-2">
            {(currentCoverUrl || previewUrl) && (
              <Button
                onClick={handleRemoveCover}
                variant="outline"
                size="sm"
                disabled={uploading}
                className="bg-white/90 text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-white"
              >
                <X className="w-3 h-3" />
                Remove
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Upload Instructions */}
      {isEditing && !displayUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Cover Photo</span>
            </button>
            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG up to 5MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}