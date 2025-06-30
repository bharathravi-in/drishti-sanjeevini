/*
  # Complete Social Media Follow System

  1. New Tables
    - `follows` - Core follow relationships
    - `follow_requests` - For private account follow requests
    - `user_blocks` - User blocking functionality
    - `follow_activity_log` - Rate limiting and activity tracking

  2. User Table Updates
    - `is_private` - Private account setting
    - `allow_follow_requests` - Allow follow requests setting

  3. Security
    - Enable RLS on all new tables
    - Comprehensive policies for data access
    - Rate limiting functions
    - Activity logging

  4. Performance
    - Optimized indexes for all query patterns
    - Efficient functions for statistics and suggestions

  5. Features
    - Follow/unfollow with notifications
    - Private accounts with follow requests
    - User blocking with automatic cleanup
    - Rate limiting (50 actions per hour)
    - Follow suggestions based on mutual connections and interests
    - Comprehensive activity logging
*/

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT follows_check CHECK (follower_id != following_id)
);

-- Create follow requests table for private accounts
CREATE TABLE IF NOT EXISTS follow_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT follow_requests_status_check CHECK (status IN ('pending', 'accepted', 'rejected')),
  CONSTRAINT follow_requests_check CHECK (requester_id != requested_id)
);

-- Create user blocks table
CREATE TABLE IF NOT EXISTS user_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT user_blocks_check CHECK (blocker_id != blocked_id)
);

-- Create follow activity log for rate limiting
CREATE TABLE IF NOT EXISTS follow_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT follow_activity_action_check CHECK (action IN ('follow', 'unfollow', 'block', 'unblock'))
);

-- Add privacy settings to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'is_private'
  ) THEN
    ALTER TABLE users ADD COLUMN is_private boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'allow_follow_requests'
  ) THEN
    ALTER TABLE users ADD COLUMN allow_follow_requests boolean DEFAULT true;
  END IF;
END $$;

-- Create unique constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'follows_follower_id_following_id_key'
  ) THEN
    ALTER TABLE follows ADD CONSTRAINT follows_follower_id_following_id_key UNIQUE(follower_id, following_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'follow_requests_requester_id_requested_id_key'
  ) THEN
    ALTER TABLE follow_requests ADD CONSTRAINT follow_requests_requester_id_requested_id_key UNIQUE(requester_id, requested_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_blocks_blocker_id_blocked_id_key'
  ) THEN
    ALTER TABLE user_blocks ADD CONSTRAINT user_blocks_blocker_id_blocked_id_key UNIQUE(blocker_id, blocked_id);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON follows(following_id);
CREATE INDEX IF NOT EXISTS follows_created_at_idx ON follows(created_at DESC);

CREATE INDEX IF NOT EXISTS follow_requests_requester_id_idx ON follow_requests(requester_id);
CREATE INDEX IF NOT EXISTS follow_requests_requested_id_idx ON follow_requests(requested_id);
CREATE INDEX IF NOT EXISTS follow_requests_status_idx ON follow_requests(status);
CREATE INDEX IF NOT EXISTS follow_requests_created_at_idx ON follow_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS user_blocks_blocker_id_idx ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS user_blocks_blocked_id_idx ON user_blocks(blocked_id);
CREATE INDEX IF NOT EXISTS user_blocks_created_at_idx ON user_blocks(created_at DESC);

CREATE INDEX IF NOT EXISTS follow_activity_log_user_id_idx ON follow_activity_log(user_id);
CREATE INDEX IF NOT EXISTS follow_activity_log_created_at_idx ON follow_activity_log(created_at DESC);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_activity_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read all follows" ON follows;
DROP POLICY IF EXISTS "Users can create follows" ON follows;
DROP POLICY IF EXISTS "Users can delete own follows" ON follows;

DROP POLICY IF EXISTS "Users can read their own follow requests" ON follow_requests;
DROP POLICY IF EXISTS "Users can create follow requests" ON follow_requests;
DROP POLICY IF EXISTS "Users can update their received requests" ON follow_requests;
DROP POLICY IF EXISTS "Users can delete their own requests" ON follow_requests;

DROP POLICY IF EXISTS "Users can read their own blocks" ON user_blocks;
DROP POLICY IF EXISTS "Users can create blocks" ON user_blocks;
DROP POLICY IF EXISTS "Users can delete their own blocks" ON user_blocks;

DROP POLICY IF EXISTS "Users can read their own activity" ON follow_activity_log;
DROP POLICY IF EXISTS "System can insert activity logs" ON follow_activity_log;

-- RLS Policies for follows table
CREATE POLICY "Users can read all follows" ON follows
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create follows" ON follows
  FOR INSERT TO authenticated
  WITH CHECK (
    follower_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) AND
    follower_id != following_id
  );

CREATE POLICY "Users can delete own follows" ON follows
  FOR DELETE TO authenticated
  USING (follower_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for follow_requests table
CREATE POLICY "Users can read their own follow requests" ON follow_requests
  FOR SELECT TO authenticated
  USING (
    requester_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR
    requested_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can create follow requests" ON follow_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    requester_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) AND
    requester_id != requested_id
  );

CREATE POLICY "Users can update their received requests" ON follow_requests
  FOR UPDATE TO authenticated
  USING (requested_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete their own requests" ON follow_requests
  FOR DELETE TO authenticated
  USING (requester_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for user_blocks table
CREATE POLICY "Users can read their own blocks" ON user_blocks
  FOR SELECT TO authenticated
  USING (blocker_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create blocks" ON user_blocks
  FOR INSERT TO authenticated
  WITH CHECK (
    blocker_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) AND
    blocker_id != blocked_id
  );

CREATE POLICY "Users can delete their own blocks" ON user_blocks
  FOR DELETE TO authenticated
  USING (blocker_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for follow_activity_log table
CREATE POLICY "Users can read their own activity" ON follow_activity_log
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "System can insert activity logs" ON follow_activity_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Function to check rate limiting
CREATE OR REPLACE FUNCTION check_follow_rate_limit(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_actions integer;
BEGIN
  -- Check actions in the last hour
  SELECT COUNT(*)
  INTO recent_actions
  FROM follow_activity_log
  WHERE user_id = user_uuid
    AND created_at > now() - interval '1 hour'
    AND action IN ('follow', 'unfollow');
  
  -- Allow max 50 follow/unfollow actions per hour
  RETURN recent_actions < 50;
END;
$$;

-- Function to create follow notification
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only create notification if not blocked
  IF NOT EXISTS (
    SELECT 1 FROM user_blocks 
    WHERE blocker_id = NEW.following_id AND blocked_id = NEW.follower_id
  ) THEN
    INSERT INTO notifications (receiver_id, actor_id, type, created_at)
    VALUES (NEW.following_id, NEW.follower_id, 'follow', now());
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to log follow activity
CREATE OR REPLACE FUNCTION log_follow_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO follow_activity_log (user_id, action, target_user_id)
    VALUES (NEW.follower_id, 'follow', NEW.following_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO follow_activity_log (user_id, action, target_user_id)
    VALUES (OLD.follower_id, 'unfollow', OLD.following_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Function to log block activity
CREATE OR REPLACE FUNCTION log_block_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO follow_activity_log (user_id, action, target_user_id)
    VALUES (NEW.blocker_id, 'block', NEW.blocked_id);
    
    -- Remove existing follows when blocking
    DELETE FROM follows 
    WHERE (follower_id = NEW.blocker_id AND following_id = NEW.blocked_id)
       OR (follower_id = NEW.blocked_id AND following_id = NEW.blocker_id);
    
    -- Remove pending follow requests
    DELETE FROM follow_requests
    WHERE (requester_id = NEW.blocker_id AND requested_id = NEW.blocked_id)
       OR (requester_id = NEW.blocked_id AND requested_id = NEW.blocker_id);
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO follow_activity_log (user_id, action, target_user_id)
    VALUES (OLD.blocker_id, 'unblock', OLD.blocked_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS follows_notification_trigger ON follows;
DROP TRIGGER IF EXISTS follows_activity_trigger ON follows;
DROP TRIGGER IF EXISTS blocks_activity_trigger ON user_blocks;

-- Create triggers
CREATE TRIGGER follows_notification_trigger
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION create_follow_notification();

CREATE TRIGGER follows_activity_trigger
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION log_follow_activity();

CREATE TRIGGER blocks_activity_trigger
  AFTER INSERT OR DELETE ON user_blocks
  FOR EACH ROW
  EXECUTE FUNCTION log_block_activity();

-- Function to get follow statistics
CREATE OR REPLACE FUNCTION get_follow_stats(user_uuid uuid)
RETURNS TABLE(
  followers_count bigint,
  following_count bigint,
  mutual_follows_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM follows WHERE following_id = user_uuid) as followers_count,
    (SELECT COUNT(*) FROM follows WHERE follower_id = user_uuid) as following_count,
    (SELECT COUNT(*) FROM follows f1 
     WHERE f1.follower_id = user_uuid 
     AND EXISTS (
       SELECT 1 FROM follows f2 
       WHERE f2.follower_id = f1.following_id 
       AND f2.following_id = user_uuid
     )) as mutual_follows_count;
END;
$$;

-- Function to get follow suggestions
CREATE OR REPLACE FUNCTION get_follow_suggestions(user_uuid uuid, limit_count integer DEFAULT 10)
RETURNS TABLE(
  user_id uuid,
  full_name text,
  username text,
  profile_photo_url text,
  mutual_connections bigint,
  common_interests text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    u.id,
    u.full_name,
    u.username,
    u.profile_photo_url,
    COALESCE(mutual.mutual_count, 0) as mutual_connections,
    COALESCE(
      ARRAY(
        SELECT unnest(u.interests) 
        INTERSECT 
        SELECT unnest(current_user.interests)
      ), 
      ARRAY[]::text[]
    ) as common_interests
  FROM users u
  CROSS JOIN (SELECT interests FROM users WHERE id = user_uuid) current_user
  LEFT JOIN (
    SELECT 
      f2.following_id as suggested_user,
      COUNT(*) as mutual_count
    FROM follows f1
    JOIN follows f2 ON f1.following_id = f2.follower_id
    WHERE f1.follower_id = user_uuid
      AND f2.following_id != user_uuid
      AND f2.following_id NOT IN (
        SELECT following_id FROM follows WHERE follower_id = user_uuid
      )
    GROUP BY f2.following_id
  ) mutual ON mutual.suggested_user = u.id
  WHERE u.id != user_uuid
    AND u.id NOT IN (SELECT following_id FROM follows WHERE follower_id = user_uuid)
    AND u.id NOT IN (SELECT blocked_id FROM user_blocks WHERE blocker_id = user_uuid)
    AND u.id NOT IN (SELECT blocker_id FROM user_blocks WHERE blocked_id = user_uuid)
    AND (u.is_private = false OR u.allow_follow_requests = true)
  ORDER BY 
    mutual_connections DESC NULLS LAST,
    array_length(common_interests, 1) DESC NULLS LAST,
    u.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_follow_rate_limit(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_follow_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_follow_suggestions(uuid, integer) TO authenticated;