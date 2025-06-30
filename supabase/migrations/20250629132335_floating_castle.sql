/*
  # Complete Notifications, Explore, and Mobile Navigation System

  1. Enhanced Notifications
    - Real-time notification system with bell icon and badge
    - Notification types: likes, comments, replies, follows
    - Mark as read functionality
    - Real-time updates via Supabase subscriptions

  2. Advanced Search and Explore
    - Multi-filter search by interests, user type, media type, location
    - Real-time search with debouncing
    - Filter chips and clear functionality
    - Mobile-optimized collapsible filters

  3. Mobile Navigation
    - Fixed bottom navigation bar
    - Icon-based navigation with active states
    - Responsive design for all screen sizes

  4. Optional Following System
    - Follow/unfollow users
    - Follower/following counts
    - Follow notifications
*/

-- Ensure all required tables exist with proper structure

-- Update notifications table to include follow notifications
DO $$
BEGIN
  -- Check if follow type is already in the constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name LIKE '%notifications_type_check%' 
    AND check_clause LIKE '%follow%'
  ) THEN
    -- Drop existing constraint
    ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
    
    -- Add new constraint with follow type
    ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
    CHECK (type = ANY (ARRAY['like'::text, 'comment'::text, 'reply'::text, 'follow'::text]));
  END IF;
END $$;

-- Create follows table for user following system
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create indexes for follows
CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON follows(following_id);
CREATE INDEX IF NOT EXISTS follows_created_at_idx ON follows(created_at DESC);

-- Enable RLS for follows
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Drop existing follows policies if they exist
DROP POLICY IF EXISTS "Users can read all follows" ON follows;
DROP POLICY IF EXISTS "Users can create follows" ON follows;
DROP POLICY IF EXISTS "Users can delete own follows" ON follows;

-- Create follows policies
CREATE POLICY "Users can read all follows"
  ON follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create follows"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (follower_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Users can delete own follows"
  ON follows FOR DELETE
  TO authenticated
  USING (follower_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

-- Update notification creation function to handle follows
CREATE OR REPLACE FUNCTION create_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle different trigger tables
  IF TG_TABLE_NAME = 'likes' THEN
    -- Don't create notification if user is liking their own post
    IF NEW.user_id = (SELECT user_id FROM posts WHERE id = NEW.post_id) THEN
      RETURN NEW;
    END IF;
    
    INSERT INTO notifications (receiver_id, actor_id, type, post_id)
    SELECT p.user_id, NEW.user_id, 'like', NEW.post_id
    FROM posts p WHERE p.id = NEW.post_id;
  
  ELSIF TG_TABLE_NAME = 'comments' THEN
    -- Don't create notification if user is commenting on their own post/comment
    IF NEW.parent_id IS NOT NULL THEN
      -- It's a reply - notify the parent comment author if not self
      IF NEW.user_id != (SELECT user_id FROM comments WHERE id = NEW.parent_id) THEN
        INSERT INTO notifications (receiver_id, actor_id, type, post_id, comment_id)
        SELECT c.user_id, NEW.user_id, 'reply', NEW.post_id, NEW.id
        FROM comments c WHERE c.id = NEW.parent_id;
      END IF;
    ELSE
      -- It's a top-level comment - notify the post author if not self
      IF NEW.user_id != (SELECT user_id FROM posts WHERE id = NEW.post_id) THEN
        INSERT INTO notifications (receiver_id, actor_id, type, post_id, comment_id)
        SELECT p.user_id, NEW.user_id, 'comment', NEW.post_id, NEW.id
        FROM posts p WHERE p.id = NEW.post_id;
      END IF;
    END IF;
  
  ELSIF TG_TABLE_NAME = 'follows' THEN
    -- Don't create notification if user is following themselves (shouldn't happen due to check constraint)
    IF NEW.follower_id != NEW.following_id THEN
      INSERT INTO notifications (receiver_id, actor_id, type)
      VALUES (NEW.following_id, NEW.follower_id, 'follow');
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for follows notifications
DROP TRIGGER IF EXISTS follows_notification_trigger ON follows;
CREATE TRIGGER follows_notification_trigger
  AFTER INSERT ON follows
  FOR EACH ROW EXECUTE FUNCTION create_notification();

-- Function to get follower count for a user
CREATE OR REPLACE FUNCTION get_follower_count(user_uuid uuid)
RETURNS integer AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM follows WHERE following_id = user_uuid);
END;
$$ LANGUAGE plpgsql;

-- Function to get following count for a user
CREATE OR REPLACE FUNCTION get_following_count(user_uuid uuid)
RETURNS integer AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM follows WHERE follower_id = user_uuid);
END;
$$ LANGUAGE plpgsql;

-- Function to check if user A follows user B
CREATE OR REPLACE FUNCTION user_follows(follower_uuid uuid, following_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM follows 
    WHERE follower_id = follower_uuid AND following_id = following_uuid
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get notification summary for a user
CREATE OR REPLACE FUNCTION get_notification_summary(user_uuid uuid)
RETURNS TABLE(
  total_count integer,
  unread_count integer,
  like_count integer,
  comment_count integer,
  follow_count integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::integer FROM notifications WHERE receiver_id = user_uuid),
    (SELECT COUNT(*)::integer FROM notifications WHERE receiver_id = user_uuid AND read = false),
    (SELECT COUNT(*)::integer FROM notifications WHERE receiver_id = user_uuid AND type = 'like'),
    (SELECT COUNT(*)::integer FROM notifications WHERE receiver_id = user_uuid AND type IN ('comment', 'reply')),
    (SELECT COUNT(*)::integer FROM notifications WHERE receiver_id = user_uuid AND type = 'follow');
END;
$$ LANGUAGE plpgsql;

-- Function to search posts with filters
CREATE OR REPLACE FUNCTION search_posts(
  search_query text DEFAULT '',
  user_role_filter text DEFAULT '',
  media_type_filter text DEFAULT '',
  location_filter text DEFAULT '',
  interest_filters text[] DEFAULT ARRAY[]::text[],
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  content text,
  media_url text,
  media_type text,
  created_at timestamptz,
  user_id uuid,
  user_full_name text,
  user_role text,
  user_city text,
  user_state text,
  user_interests text[],
  user_profile_photo_url text,
  like_count bigint,
  comment_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.content,
    p.media_url,
    p.media_type,
    p.created_at,
    p.user_id,
    u.full_name as user_full_name,
    u.role as user_role,
    u.city as user_city,
    u.state as user_state,
    u.interests as user_interests,
    u.profile_photo_url as user_profile_photo_url,
    COALESCE(l.like_count, 0) as like_count,
    COALESCE(c.comment_count, 0) as comment_count
  FROM posts p
  JOIN users u ON p.user_id = u.id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as like_count
    FROM likes
    GROUP BY post_id
  ) l ON p.id = l.post_id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as comment_count
    FROM comments
    GROUP BY post_id
  ) c ON p.id = c.post_id
  WHERE 
    (search_query = '' OR p.content ILIKE '%' || search_query || '%' OR u.full_name ILIKE '%' || search_query || '%')
    AND (user_role_filter = '' OR u.role = user_role_filter)
    AND (media_type_filter = '' OR p.media_type = media_type_filter)
    AND (location_filter = '' OR u.city ILIKE '%' || location_filter || '%' OR u.state ILIKE '%' || location_filter || '%')
    AND (array_length(interest_filters, 1) IS NULL OR u.interests && interest_filters)
  ORDER BY p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Add indexes for better search performance
CREATE INDEX IF NOT EXISTS posts_content_gin_idx ON posts USING GIN(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS users_full_name_gin_idx ON users USING GIN(to_tsvector('english', full_name));
CREATE INDEX IF NOT EXISTS users_location_idx ON users(city, state);

-- Function to get trending posts (posts with high engagement in last 24 hours)
CREATE OR REPLACE FUNCTION get_trending_posts(limit_count integer DEFAULT 10)
RETURNS TABLE(
  id uuid,
  content text,
  media_url text,
  media_type text,
  created_at timestamptz,
  user_id uuid,
  user_full_name text,
  user_role text,
  engagement_score numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.content,
    p.media_url,
    p.media_type,
    p.created_at,
    p.user_id,
    u.full_name as user_full_name,
    u.role as user_role,
    (COALESCE(l.like_count, 0) * 1.0 + COALESCE(c.comment_count, 0) * 2.0) as engagement_score
  FROM posts p
  JOIN users u ON p.user_id = u.id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as like_count
    FROM likes
    WHERE created_at > NOW() - INTERVAL '24 hours'
    GROUP BY post_id
  ) l ON p.id = l.post_id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as comment_count
    FROM comments
    WHERE created_at > NOW() - INTERVAL '24 hours'
    GROUP BY post_id
  ) c ON p.id = c.post_id
  WHERE p.created_at > NOW() - INTERVAL '7 days'
  ORDER BY engagement_score DESC, p.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user activity feed (posts from followed users)
CREATE OR REPLACE FUNCTION get_user_feed(user_uuid uuid, limit_count integer DEFAULT 20)
RETURNS TABLE(
  id uuid,
  content text,
  media_url text,
  media_type text,
  created_at timestamptz,
  user_id uuid,
  user_full_name text,
  user_role text,
  user_profile_photo_url text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.content,
    p.media_url,
    p.media_type,
    p.created_at,
    p.user_id,
    u.full_name as user_full_name,
    u.role as user_role,
    u.profile_photo_url as user_profile_photo_url
  FROM posts p
  JOIN users u ON p.user_id = u.id
  WHERE p.user_id IN (
    SELECT following_id FROM follows WHERE follower_id = user_uuid
  )
  OR p.user_id = user_uuid  -- Include user's own posts
  ORDER BY p.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;