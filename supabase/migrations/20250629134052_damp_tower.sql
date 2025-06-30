/*
  # Add Username and Messaging Features

  1. New Columns
    - Add `username` to users table (unique)
  
  2. New Tables
    - `messages` for private messaging between users
  
  3. Security
    - Enable RLS on messages table
    - Add policies for messaging
*/

-- Add username column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'username'
  ) THEN
    ALTER TABLE users ADD COLUMN username text UNIQUE;
  END IF;
END $$;

-- Create messages table for private messaging
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create indexes for messages
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages(sender_id, receiver_id, created_at);

-- RLS Policies for messages
CREATE POLICY "Users can read their own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    sender_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR
    receiver_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can update their received messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (
    receiver_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Function to get conversation between two users
CREATE OR REPLACE FUNCTION get_conversation(user1_id uuid, user2_id uuid)
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
  ORDER BY m.created_at ASC;
END;
$$;

-- Function to get user conversations list
CREATE OR REPLACE FUNCTION get_user_conversations(user_id uuid)
RETURNS TABLE (
  other_user_id uuid,
  other_user_name text,
  other_user_avatar text,
  last_message text,
  last_message_time timestamptz,
  unread_count bigint
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
      m.created_at as last_message_time
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
    lm.last_message,
    lm.last_message_time,
    COALESCE(uc.unread_count, 0)
  FROM latest_messages lm
  JOIN users u ON lm.other_user = u.id
  LEFT JOIN unread_counts uc ON lm.other_user = uc.other_user
  ORDER BY lm.last_message_time DESC;
END;
$$;