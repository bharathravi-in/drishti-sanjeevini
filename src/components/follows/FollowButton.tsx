import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface FollowButtonProps {
  targetUserId: string;
  targetUserName: string;
  onFollowChange?: (isFollowing: boolean, followerCount: number) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FollowButton({ 
  targetUserId, 
  targetUserName, 
  onFollowChange,
  className = '',
  size = 'sm'
}: FollowButtonProps) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);

  // Don't show follow button for self
  if (!user || user.id === targetUserId) {
    return null;
  }

  const checkFollowStatus = async () => {
    try {
      setInitialLoading(true);
      
      // Check if current user is following target user
      const { data: followData, error: followError } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle();

      if (followError) throw followError;
      setIsFollowing(!!followData);

      // Get follower count for target user
      const { count, error: countError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', targetUserId);

      if (countError) throw countError;
      setFollowerCount(count || 0);

    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    checkFollowStatus();

    // Set up real-time subscription for follow changes
    const subscription = supabase
      .channel('follow_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `following_id=eq.${targetUserId}`
        },
        () => {
          checkFollowStatus();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [targetUserId, user.id]);

  const handleFollow = async () => {
    if (loading) return;

    setLoading(true);
    const wasFollowing = isFollowing;

    try {
      if (wasFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) throw error;

        setIsFollowing(false);
        const newCount = Math.max(0, followerCount - 1);
        setFollowerCount(newCount);
        onFollowChange?.(false, newCount);
        
        toast.success(`Unfollowed ${targetUserName}`, {
          icon: '👋',
          duration: 3000,
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });

        if (error) throw error;

        setIsFollowing(true);
        const newCount = followerCount + 1;
        setFollowerCount(newCount);
        onFollowChange?.(true, newCount);
        
        toast.success(`Now following ${targetUserName}`, {
          icon: '🎉',
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      
      if (error.code === '23505') {
        toast.error('You are already following this user');
        // Refresh status to sync with database
        checkFollowStatus();
      } else if (error.code === '23503') {
        toast.error('User not found');
      } else {
        toast.error('Failed to update follow status. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={className}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <Button
      onClick={handleFollow}
      loading={loading}
      variant={isFollowing ? 'outline' : 'primary'}
      size={size}
      className={`transition-all duration-200 ${
        isFollowing 
          ? 'text-gray-600 dark:text-gray-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20' 
          : 'bg-green-600 hover:bg-green-700 text-white'
      } ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="w-4 h-4" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          Follow
        </>
      )}
    </Button>
  );
}