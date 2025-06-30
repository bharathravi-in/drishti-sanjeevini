/*
  # Create reports table for DRiSHTi SANjEEViNi

  1. New Tables
    - `reports`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to posts table)
      - `user_id` (uuid, foreign key to users table)
      - `reason` (text) - predefined reason categories
      - `message` (text) - detailed description from user
      - `status` (text) - pending, reviewed, resolved
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `reports` table
    - Add policies for authenticated users to create reports
    - Add policies for users to read their own reports
    - Prevent duplicate reports from same user for same post

  3. Constraints
    - Check constraint for valid reason values
    - Unique constraint to prevent duplicate reports
*/

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL CHECK (reason IN ('spam', 'hate', 'scam', 'false_info', 'inappropriate', 'other')),
  message text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports for any post (but only one per post)
CREATE POLICY "Users can create reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Users can read their own reports
CREATE POLICY "Users can read own reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS reports_post_id_idx ON reports(post_id);
CREATE INDEX IF NOT EXISTS reports_user_id_idx ON reports(user_id);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at DESC);