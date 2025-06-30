import React, { useState, useEffect } from 'react';
import { Users, UserCheck, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FollowStatsProps {
  userId: string;
  className?: string;
  showTrending?: boolean;
}

interface FollowCounts {
  followers: number;
  following: number;
}

export function FollowStats({ userId, className = '', showTrending = false }: FollowStatsProps) {
  const [counts, setCounts] = useState<FollowCounts>({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const [recentGrowth, setRecentGrowth] = useState(0);

  const fetchFollowCounts = async () => {
    try {
      setLoading(true);
      
      const [followersResult, followingResult] = await Promise.all([
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId),
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId)
      ]);

      setCounts({
        followers: followersResult.count || 0,
        following: followingResult.count || 0
      });

      // Get recent growth (last 7 days) if showTrending is enabled
      if (showTrending) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { count: recentFollowers } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId)
          .gte('created_at', sevenDaysAgo.toISOString());

        setRecentGrowth(recentFollowers || 0);
      }
    } catch (error) {
      console.error('Error fetching follow counts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowCounts();

    // Set up real-time subscription for follow changes
    const subscription = supabase
      .channel('follow_stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `or(follower_id.eq.${userId},following_id.eq.${userId})`
        },
        () => {
          fetchFollowCounts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, showTrending]);

  if (loading) {
    return (
      <div className={`flex space-x-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    );
  }

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
        <Users className="w-4 h-4" />
        <span className="font-medium text-gray-900 dark:text-white">
          {formatCount(counts.followers)}
        </span>
        <span className="text-sm">
          follower{counts.followers !== 1 ? 's' : ''}
        </span>
        {showTrending && recentGrowth > 0 && (
          <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
            <TrendingUp className="w-3 h-3" />
            <span className="text-xs">+{recentGrowth}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
        <UserCheck className="w-4 h-4" />
        <span className="font-medium text-gray-900 dark:text-white">
          {formatCount(counts.following)}
        </span>
        <span className="text-sm">following</span>
      </div>
    </div>
  );
}