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