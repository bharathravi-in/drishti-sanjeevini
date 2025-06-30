/*
  # Follow System and Enhanced Messaging

  1. New Tables
    - `follows` - User follow relationships
      - `id` (uuid, primary key)
      - `follower_id` (uuid, references users)
      - `following_id` (uuid, references users)
      - `created_at` (timestamp)
      - Unique constraint on (follower_id, following_id)
      - Check constraint to prevent self-following

  2. Enhanced Messages
    - Add indexes for better performance
    - Functions for conversation management

  3. Security
    - Enable RLS on follows table
    - Add policies for secure follow operations
    - Functions for follow counts and conversation management

  4. Notifications
    - Trigger for follow notifications
*/

-- Create follows table if not exists
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Add constraints if they don't exist
DO $$
BEGIN
  -- Add unique constraint if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'follows_follower_id_following_id_key'
  ) THEN
    ALTER TABLE follows ADD CONSTRAINT follows_follower_id_following_id_key UNIQUE(follower_id, following_id);
  END IF;

  -- Add check constraint if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'follows_check'
  ) THEN
    ALTER TABLE follows ADD CONSTRAINT follows_check CHECK (follower_id != following_id);
  END IF;
END $$;

-- Enable RLS on follows
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Create indexes for follows if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'follows_follower_id_idx') THEN
    CREATE INDEX follows_follower_id_idx ON follows(follower_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'follows_following_id_idx') THEN
    CREATE INDEX follows_following_id_idx ON follows(following_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'follows_created_at_idx') THEN
    CREATE INDEX follows_created_at_idx ON follows(created_at DESC);
  END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can read all follows" ON follows;
  DROP POLICY IF EXISTS "Users can create follows" ON follows;
  DROP POLICY IF EXISTS "Users can delete own follows" ON follows;
END $$;

-- RLS Policies for follows
CREATE POLICY "Users can read all follows"
  ON follows
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create follows"
  ON follows
  FOR INSERT
  TO authenticated
  WITH CHECK (
    follower_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) AND
    follower_id != following_id
  );

CREATE POLICY "Users can delete own follows"
  ON follows
  FOR DELETE
  TO authenticated
  USING (
    follower_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Create or replace follow notification function
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for the user being followed
  INSERT INTO notifications (receiver_id, actor_id, type)
  VALUES (NEW.following_id, NEW.follower_id, 'follow');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS follows_notification_trigger ON follows;
CREATE TRIGGER follows_notification_trigger
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION create_follow_notification();

-- Enhanced messages table indexes
DO $$
BEGIN
  -- Add read status index if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'messages' AND indexname = 'messages_read_idx'
  ) THEN
    CREATE INDEX messages_read_idx ON messages(read);
  END IF;

  -- Add conversation index if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'messages' AND indexname = 'messages_conversation_idx'
  ) THEN
    CREATE INDEX messages_conversation_idx ON messages(sender_id, receiver_id, created_at);
  END IF;
END $$;

-- Function to get follow counts for a user
CREATE OR REPLACE FUNCTION get_follow_counts(user_id uuid)
RETURNS TABLE (
  followers_count bigint,
  following_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM follows WHERE following_id = user_id) as followers_count,
    (SELECT COUNT(*) FROM follows WHERE follower_id = user_id) as following_count;
END;
$$;

-- Function to check if user A follows user B
CREATE OR REPLACE FUNCTION is_following(follower_id uuid, following_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM follows 
    WHERE follows.follower_id = is_following.follower_id 
    AND follows.following_id = is_following.following_id
  );
END;
$$;

-- Function to get user's followers
CREATE OR REPLACE FUNCTION get_user_followers(user_id uuid, limit_count int DEFAULT 20)
RETURNS TABLE (
  follower_id uuid,
  follower_name text,
  follower_avatar text,
  follower_role text,
  followed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.full_name,
    u.profile_photo_url,
    u.role,
    f.created_at
  FROM follows f
  JOIN users u ON f.follower_id = u.id
  WHERE f.following_id = user_id
  ORDER BY f.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Function to get who user is following
CREATE OR REPLACE FUNCTION get_user_following(user_id uuid, limit_count int DEFAULT 20)
RETURNS TABLE (
  following_id uuid,
  following_name text,
  following_avatar text,
  following_role text,
  followed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.full_name,
    u.profile_photo_url,
    u.role,
    f.created_at
  FROM follows f
  JOIN users u ON f.following_id = u.id
  WHERE f.follower_id = user_id
  ORDER BY f.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Enhanced conversation function with better performance
CREATE OR REPLACE FUNCTION get_conversation(user1_id uuid, user2_id uuid, limit_count int DEFAULT 50)
RETURNS TABLE (
  id uuid,
  sender_id uuid,
  receiver_id uuid,
  content text,
  read boolean,
  created_at timestamptz,
  sender_name text,
  sender_avatar text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.sender_id,
    m.receiver_id,
    m.content,
    m.read,
    m.created_at,
    u.full_name as sender_name,
    u.profile_photo_url as sender_avatar
  FROM messages m
  JOIN users u ON m.sender_id = u.id
  WHERE 
    (m.sender_id = user1_id AND m.receiver_id = user2_id) OR
    (m.sender_id = user2_id AND m.receiver_id = user1_id)
  ORDER BY m.created_at ASC
  LIMIT limit_count;
END;
$$;

-- Enhanced user conversations function
CREATE OR REPLACE FUNCTION get_user_conversations(user_id uuid, limit_count int DEFAULT 20)
RETURNS TABLE (
  other_user_id uuid,
  other_user_name text,
  other_user_avatar text,
  other_user_role text,
  last_message text,
  last_message_time timestamptz,
  unread_count bigint,
  is_sender boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH latest_messages AS (
    SELECT DISTINCT ON (
      CASE 
        WHEN m.sender_id = user_id THEN m.receiver_id 
        ELSE m.sender_id 
      END
    )
      CASE 
        WHEN m.sender_id = user_id THEN m.receiver_id 
        ELSE m.sender_id 
      END as other_user,
      m.content as last_message,
      m.created_at as last_message_time,
      m.sender_id = user_id as is_sender
    FROM messages m
    WHERE m.sender_id = user_id OR m.receiver_id = user_id
    ORDER BY 
      CASE 
        WHEN m.sender_id = user_id THEN m.receiver_id 
        ELSE m.sender_id 
      END,
      m.created_at DESC
  ),
  unread_counts AS (
    SELECT 
      m.sender_id as other_user,
      COUNT(*) as unread_count
    FROM messages m
    WHERE m.receiver_id = user_id AND m.read = false
    GROUP BY m.sender_id
  )
  SELECT 
    lm.other_user,
    u.full_name,
    u.profile_photo_url,
    u.role,
    lm.last_message,
    lm.last_message_time,
    COALESCE(uc.unread_count, 0),
    lm.is_sender
  FROM latest_messages lm
  JOIN users u ON lm.other_user = u.id
  LEFT JOIN unread_counts uc ON lm.other_user = uc.other_user
  ORDER BY lm.last_message_time DESC
  LIMIT limit_count;
END;
$$;

-- Function to mark conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_read(current_user_id uuid, other_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE messages 
  SET read = true 
  WHERE receiver_id = current_user_id 
  AND sender_id = other_user_id 
  AND read = false;
END;
$$;

-- Function to get unread message count for user
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM messages 
    WHERE receiver_id = user_id AND read = false
  );
END;
$$;