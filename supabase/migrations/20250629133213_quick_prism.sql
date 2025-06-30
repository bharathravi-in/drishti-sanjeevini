/*
  # Fix ambiguous column reference in get_trending_posts function

  1. Database Functions
    - Update `get_trending_posts` function to resolve ambiguous column references
    - Explicitly qualify all column references with table aliases
    - Ensure proper JOIN syntax and column disambiguation

  2. Changes Made
    - Add proper table aliases (p for posts, u for users, etc.)
    - Qualify all column references with their respective table aliases
    - Fix any ambiguous references to created_at, updated_at, and other common columns
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_trending_posts();

-- Create the corrected get_trending_posts function
CREATE OR REPLACE FUNCTION get_trending_posts()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  content text,
  media_url text,
  media_type text,
  created_at timestamptz,
  updated_at timestamptz,
  user_full_name text,
  user_profile_photo_url text,
  like_count bigint,
  comment_count bigint
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.content,
    p.media_url,
    p.media_type,
    p.created_at,
    p.updated_at,
    u.full_name as user_full_name,
    u.profile_photo_url as user_profile_photo_url,
    COALESCE(l.like_count, 0) as like_count,
    COALESCE(c.comment_count, 0) as comment_count
  FROM posts p
  LEFT JOIN users u ON p.user_id = u.id
  LEFT JOIN (
    SELECT 
      post_id, 
      COUNT(*) as like_count
    FROM likes 
    GROUP BY post_id
  ) l ON p.id = l.post_id
  LEFT JOIN (
    SELECT 
      post_id, 
      COUNT(*) as comment_count
    FROM comments 
    GROUP BY post_id
  ) c ON p.id = c.post_id
  WHERE p.created_at >= NOW() - INTERVAL '7 days'
  ORDER BY 
    (COALESCE(l.like_count, 0) * 2 + COALESCE(c.comment_count, 0)) DESC,
    p.created_at DESC
  LIMIT 50;
$$;