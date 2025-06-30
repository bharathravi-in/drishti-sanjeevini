/*
  # Fix RLS policies for posts and storage

  1. Posts Table Policies
    - Fix INSERT policy to properly validate user ownership
    - Ensure SELECT policy allows authenticated users to read all posts

  2. Storage Setup
    - Create media bucket if it doesn't exist
    - Set up storage policies for uploads and public access
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can create own posts" ON posts;

-- Create a new INSERT policy that properly validates user ownership
CREATE POLICY "Users can create own posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id 
      FROM users 
      WHERE auth_id = auth.uid()
    )
  );

-- Also ensure we have a proper SELECT policy for reading posts
DROP POLICY IF EXISTS "Authenticated users can read posts" ON posts;

CREATE POLICY "Authenticated users can read posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

-- Create the media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Public can view media" ON storage.objects;

-- Create storage policy for authenticated users to upload media
CREATE POLICY "Authenticated users can upload media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage policy for public read access to media
CREATE POLICY "Public can view media"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'media');