/*
  # Social Features Migration

  1. New Tables
    - `likes` - User likes on posts
    - `notifications` - User notifications for likes, comments, replies
  
  2. Table Updates
    - Add `parent_id` to `comments` for threaded comments
    - Update `users` role constraint to include 'admin'
  
  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for each table
    - Create notification triggers
  
  4. Functions
    - Helper functions for like counts, comment counts
    - Notification creation function
*/

-- Update users table to support admin role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'users_role_check_updated'
  ) THEN
    -- Drop existing constraint
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    
    -- Add new constraint with admin role
    ALTER TABLE users ADD CONSTRAINT users_role_check_updated 
    CHECK (role = ANY (ARRAY['seeker'::text, 'supporter'::text, 'admin'::text]));
  END IF;
END $$;

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create indexes for likes
CREATE INDEX IF NOT EXISTS likes_post_id_idx ON likes(post_id);
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON likes(user_id);
CREATE INDEX IF NOT EXISTS likes_created_at_idx ON likes(created_at DESC);

-- Enable RLS for likes
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Drop existing likes policies if they exist
DROP POLICY IF EXISTS "Users can read all likes" ON likes;
DROP POLICY IF EXISTS "Users can create likes" ON likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON likes;

-- Create likes policies
CREATE POLICY "Users can read all likes"
  ON likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create likes"
  ON likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Users can delete own likes"
  ON likes FOR DELETE
  TO authenticated
  USING (user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

-- Update comments table for threaded comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE comments ADD COLUMN parent_id uuid REFERENCES comments(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for threaded comments
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON comments(parent_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receiver_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type = ANY (ARRAY['like'::text, 'comment'::text, 'reply'::text])),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS notifications_receiver_id_idx ON notifications(receiver_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications(read);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON notifications(type);

-- Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing notifications policies if they exist
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Create notifications policies
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (receiver_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Users can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (actor_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (receiver_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Don't create notification if user is acting on their own content
  IF NEW.user_id = (
    SELECT user_id FROM posts WHERE id = NEW.post_id
  ) THEN
    RETURN NEW;
  END IF;

  -- Create notification based on trigger table
  IF TG_TABLE_NAME = 'likes' THEN
    INSERT INTO notifications (receiver_id, actor_id, type, post_id)
    SELECT p.user_id, NEW.user_id, 'like', NEW.post_id
    FROM posts p WHERE p.id = NEW.post_id;
  
  ELSIF TG_TABLE_NAME = 'comments' THEN
    -- Check if it's a reply or top-level comment
    IF NEW.parent_id IS NOT NULL THEN
      -- It's a reply - notify the parent comment author
      INSERT INTO notifications (receiver_id, actor_id, type, post_id, comment_id)
      SELECT c.user_id, NEW.user_id, 'reply', NEW.post_id, NEW.id
      FROM comments c WHERE c.id = NEW.parent_id;
    ELSE
      -- It's a top-level comment - notify the post author
      INSERT INTO notifications (receiver_id, actor_id, type, post_id, comment_id)
      SELECT p.user_id, NEW.user_id, 'comment', NEW.post_id, NEW.id
      FROM posts p WHERE p.id = NEW.post_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for notifications
DROP TRIGGER IF EXISTS likes_notification_trigger ON likes;
CREATE TRIGGER likes_notification_trigger
  AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION create_notification();

DROP TRIGGER IF EXISTS comments_notification_trigger ON comments;
CREATE TRIGGER comments_notification_trigger
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION create_notification();

-- Function to get like count for posts
CREATE OR REPLACE FUNCTION get_post_like_count(post_uuid uuid)
RETURNS integer AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM likes WHERE post_id = post_uuid);
END;
$$ LANGUAGE plpgsql;

-- Function to get comment count for posts
CREATE OR REPLACE FUNCTION get_post_comment_count(post_uuid uuid)
RETURNS integer AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM comments WHERE post_id = post_uuid);
END;
$$ LANGUAGE plpgsql;

-- Function to check if user liked a post
CREATE OR REPLACE FUNCTION user_liked_post(post_uuid uuid, user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM likes 
    WHERE post_id = post_uuid AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql;