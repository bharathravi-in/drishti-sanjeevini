import React, { useState, useRef } from 'react';
import { Camera, Video, X, Upload, Send, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface CreatePostProps {
  onPostCreated?: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      setErrors({ file: 'Please select an image or video file' });
      return;
    }

    // Validate file size
    const maxSize = isImage ? 5 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB for images, 50MB for videos
    if (file.size > maxSize) {
      setErrors({ 
        file: `File too large. Maximum size is ${isImage ? '5MB' : '50MB'}` 
      });
      return;
    }

    setMediaFile(file);
    setMediaType(isImage ? 'image' : 'video');
    setErrors({});

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
  };

  const removeMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!content.trim()) {
      newErrors.content = 'Please write something to share';
    }

    if (!mediaFile) {
      newErrors.file = 'Please select an image or video to share';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadMedia = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${timestamp}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${authUser.id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user || !mediaFile) return;

    setLoading(true);

    try {
      const mediaUrl = await uploadMedia(mediaFile);

      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
          media_url: mediaUrl,
          media_type: mediaType
        });

      if (postError) throw postError;

      toast.success('Posted successfully!');
      
      // Clear form
      setContent('');
      removeMedia();
      
      // Notify parent component
      onPostCreated?.();

    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error('Upload failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
            <p className="text-sm text-gray-600">
              {user.role === 'seeker' ? '🤝 Seeking Help' : '❤️ Offering Help'}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content Input */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Share your journey, talent, or call for help
            </label>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) setErrors(prev => ({ ...prev, content: '' }));
              }}
              placeholder="What would you like to share?"
              rows={4}
              className={`
                w-full p-3 border border-gray-300 rounded-lg resize-none text-sm
                focus:ring-2 focus:ring-green-500 focus:border-transparent
                transition-all duration-200 bg-white placeholder-gray-400
                ${errors.content ? 'border-red-500 focus:ring-red-500' : ''}
              `}
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content}</p>
            )}
          </div>

          {/* Media Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Add Photo or Video
              </label>
              <div className="text-xs text-gray-500">
                Images: max 5MB • Videos: max 50MB
              </div>
            </div>

            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,.jpg,.jpeg,.png,.mp4,.mov"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Upload Area */}
            {!mediaPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed border-gray-300 rounded-lg p-6
                  hover:border-green-400 hover:bg-green-50 transition-all duration-200
                  cursor-pointer
                  ${errors.file ? 'border-red-300 bg-red-50' : ''}
                `}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">
                    Click to upload photo or video
                  </p>
                  <p className="text-sm text-gray-500">
                    JPG, PNG, MP4, MOV up to 50MB
                  </p>
                </div>
              </div>
            ) : (
              /* Media Preview */
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 z-10 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                
                {mediaType === 'image' ? (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full max-h-64 object-cover"
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    controls
                    className="w-full max-h-64"
                  />
                )}
                
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                  {mediaType === 'image' ? (
                    <ImageIcon className="w-3 h-3" />
                  ) : (
                    <Video className="w-3 h-3" />
                  )}
                  <span>{mediaType === 'image' ? 'Image' : 'Video'}</span>
                </div>
              </div>
            )}

            {errors.file && (
              <p className="text-sm text-red-600">{errors.file}</p>
            )}
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-sm">
              💡 Your post will appear in the community feed and help connect you with others.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              loading={loading}
              disabled={!content.trim() || !mediaFile}
              size="lg"
              className="px-6"
            >
              <Send className="w-4 h-4" />
              Post
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}