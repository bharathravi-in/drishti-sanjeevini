/*
  # Add Profile Photo and Cover Photo Support

  1. New Columns
    - `profile_photo_url` (text) - URL to user's profile photo
    - `cover_photo_url` (text) - URL to user's cover photo

  2. Storage
    - Create storage bucket for profile assets
    - Set up RLS policies for profile photos

  3. Changes
    - Add optional photo URL columns to users table
*/

-- Add profile photo columns to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'profile_photo_url'
  ) THEN
    ALTER TABLE users ADD COLUMN profile_photo_url text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'cover_photo_url'
  ) THEN
    ALTER TABLE users ADD COLUMN cover_photo_url text DEFAULT '';
  END IF;
END $$;

-- Create storage bucket for profile assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-assets', 'profile-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for profile assets
CREATE POLICY "Users can upload their own profile assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'profile-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile assets"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'profile-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile assets"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'profile-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Profile assets are publicly viewable"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'profile-assets');