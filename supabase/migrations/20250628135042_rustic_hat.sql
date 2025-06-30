/*
  # Create likes table for DRiSHTi SANjEEViNi

  1. New Tables
    - `likes`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to posts table)
      - `user_id` (uuid, foreign key to users table)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `likes` table
    - Add policies for authenticated users to create/delete likes
    - Add policies for all users to read likes
    - Prevent duplicate likes with unique constraint

  3. Performance
    - Add indexes for optimal query performance
    - Unique constraint on (post_id, user_id) to prevent duplicate likes
*/

CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Users can create likes for any post
CREATE POLICY "Users can create likes"
  ON likes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- All authenticated users can read likes
CREATE POLICY "Authenticated users can read likes"
  ON likes
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can delete their own likes
CREATE POLICY "Users can delete own likes"
  ON likes
  FOR DELETE
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS likes_post_id_idx ON likes(post_id);
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON likes(user_id);
CREATE INDEX IF NOT EXISTS likes_created_at_idx ON likes(created_at DESC);