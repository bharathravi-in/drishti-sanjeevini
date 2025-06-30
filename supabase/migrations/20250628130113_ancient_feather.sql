/*
  # Fix RLS policies for posts table

  This migration fixes the RLS policies for the posts table to allow proper post creation.
  
  Note: Storage bucket and policies need to be configured through the Supabase dashboard:
  1. Go to Storage in your Supabase dashboard
  2. Create a bucket named "media" with public access enabled
  3. Add policies for authenticated users to upload and public users to view

  1. Changes to posts table
    - Update INSERT policy to properly validate user ownership
    - Ensure SELECT policy allows reading all posts
    - Keep existing UPDATE and DELETE policies
*/

-- Update the posts table INSERT policy to be more explicit and handle the user relationship correctly
DROP POLICY IF EXISTS "Users can create own posts" ON posts;

CREATE POLICY "Users can create own posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Ensure the posts SELECT policy allows reading all posts for authenticated users
DROP POLICY IF EXISTS "Authenticated users can read posts" ON posts;

CREATE POLICY "Authenticated users can read posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure UPDATE policy exists and is correct
DROP POLICY IF EXISTS "Users can update own posts" ON posts;

CREATE POLICY "Users can update own posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Ensure DELETE policy exists and is correct
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;

CREATE POLICY "Users can delete own posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));