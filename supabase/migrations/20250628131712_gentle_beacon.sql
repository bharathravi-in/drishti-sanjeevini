/*
  # Fix RLS policies for post creation

  1. Posts Table Policies
    - Drop and recreate INSERT policy with proper user validation
    - Ensure the policy correctly matches user_id with the authenticated user
    - Add debugging-friendly policy structure

  2. Storage Policies
    - Ensure storage bucket exists and has correct policies
    - Fix any issues with media upload permissions
*/

-- First, let's ensure the posts table policies are correct
DROP POLICY IF EXISTS "Users can create own posts" ON posts;
DROP POLICY IF EXISTS "Authenticated users can read posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;

-- Create a simple INSERT policy that allows authenticated users to create posts
-- where the user_id matches a user record with their auth_id
CREATE POLICY "Users can create own posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = posts.user_id 
      AND users.auth_id = auth.uid()
    )
  );

-- Allow all authenticated users to read posts
CREATE POLICY "Authenticated users can read posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to update their own posts
CREATE POLICY "Users can update own posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = posts.user_id 
      AND users.auth_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = posts.user_id 
      AND users.auth_id = auth.uid()
    )
  );

-- Allow users to delete their own posts
CREATE POLICY "Users can delete own posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = posts.user_id 
      AND users.auth_id = auth.uid()
    )
  );

-- Ensure the media storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload media to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own media" ON storage.objects;
DROP POLICY IF EXISTS "Public can view media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;

-- Create storage policies for media uploads
CREATE POLICY "Users can upload to media bucket"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public read access to media files
CREATE POLICY "Public can view media files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'media');

-- Allow users to delete their own media files
CREATE POLICY "Users can delete own media files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );