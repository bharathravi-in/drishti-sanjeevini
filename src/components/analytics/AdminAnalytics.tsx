import React, { useState, useEffect } from 'react';
import { BarChart3, Users, MessageSquare, FileText, TrendingUp, Calendar, Award, Activity } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface AnalyticsData {
  totalUsers: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
  totalPosts: number;
  postsThisMonth: number;
  postsThisWeek: number;
  totalComments: number;
  commentsThisMonth: number;
  commentsThisWeek: number;
  topPosters: Array<{
    full_name: string;
    post_count: number;
    role: string;
  }>;
  topCommenters: Array<{
    full_name: string;
    comment_count: number;
    role: string;
  }>;
}

export function AdminAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to view analytics.</p>
        </CardContent>
      </Card>
    );
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Get current date boundaries
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

      // Fetch all analytics data in parallel
      const [
        totalUsersResult,
        newUsersMonthResult,
        newUsersWeekResult,
        totalPostsResult,
        postsMonthResult,
        postsWeekResult,
        totalCommentsResult,
        commentsMonthResult,
        commentsWeekResult,
        topPostersResult,
        topCommentersResult
      ] = await Promise.all([
        // Total users
        supabase.from('users').select('*', { count: 'exact', head: true }),
        
        // New users this month
        supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth.toISOString()),
        
        // New users this week
        supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfWeek.toISOString()),
        
        // Total posts
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        
        // Posts this month
        supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth.toISOString()),
        
        // Posts this week
        supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfWeek.toISOString()),
        
        // Total comments
        supabase.from('comments').select('*', { count: 'exact', head: true }),
        
        // Comments this month
        supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth.toISOString()),
        
        // Comments this week
        supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfWeek.toISOString()),
        
        // Top 5 posters
        supabase
          .from('posts')
          .select(`
            user:users(full_name, role),
            user_id
          `)
          .then(result => {
            if (result.error) throw result.error;
            
            // Count posts per user
            const userCounts: Record<string, { full_name: string; role: string; count: number }> = {};
            result.data?.forEach(post => {
              if (post.user) {
                const key = post.user_id;
                if (!userCounts[key]) {
                  userCounts[key] = {
                    full_name: post.user.full_name,
                    role: post.user.role,
                    count: 0
                  };
                }
                userCounts[key].count++;
              }
            });
            
            // Sort and get top 5
            return Object.values(userCounts)
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)
              .map(user => ({
                full_name: user.full_name,
                post_count: user.count,
                role: user.role
              }));
          }),
        
        // Top 5 commenters
        supabase
          .from('comments')
          .select(`
            user:users(full_name, role),
            user_id
          `)
          .then(result => {
            if (result.error) throw result.error;
            
            // Count comments per user
            const userCounts: Record<string, { full_name: string; role: string; count: number }> = {};
            result.data?.forEach(comment => {
              if (comment.user) {
                const key = comment.user_id;
                if (!userCounts[key]) {
                  userCounts[key] = {
                    full_name: comment.user.full_name,
                    role: comment.user.role,
                    count: 0
                  };
                }
                userCounts[key].count++;
              }
            });
            
            // Sort and get top 5
            return Object.values(userCounts)
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)
              .map(user => ({
                full_name: user.full_name,
                comment_count: user.count,
                role: user.role
              }));
          })
      ]);

      setAnalytics({
        totalUsers: totalUsersResult.count || 0,
        newUsersThisMonth: newUsersMonthResult.count || 0,
        newUsersThisWeek: newUsersWeekResult.count || 0,
        totalPosts: totalPostsResult.count || 0,
        postsThisMonth: postsMonthResult.count || 0,
        postsThisWeek: postsWeekResult.count || 0,
        totalComments: totalCommentsResult.count || 0,
        commentsThisMonth: commentsMonthResult.count || 0,
        commentsThisWeek: commentsWeekResult.count || 0,
        topPosters: topPostersResult || [],
        topCommenters: topCommentersResult || []
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Analytics</h3>
          <p className="text-gray-600">Unable to fetch analytics data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
              <p className="text-gray-600">Community engagement and growth metrics</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</h3>
            <p className="text-blue-600 font-medium">Total Users</p>
            <div className="mt-2 text-sm text-gray-600">
              <span className="text-green-600">+{analytics.newUsersThisMonth}</span> this month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{analytics.totalPosts}</h3>
            <p className="text-green-600 font-medium">Total Posts</p>
            <div className="mt-2 text-sm text-gray-600">
              <span className="text-green-600">+{analytics.postsThisMonth}</span> this month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{analytics.totalComments}</h3>
            <p className="text-purple-600 font-medium">Total Comments</p>
            <div className="mt-2 text-sm text-gray-600">
              <span className="text-green-600">+{analytics.commentsThisMonth}</span> this month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">
              {((analytics.postsThisWeek + analytics.commentsThisWeek) / 7).toFixed(1)}
            </h3>
            <p className="text-orange-600 font-medium">Daily Activity</p>
            <div className="mt-2 text-sm text-gray-600">
              Posts + Comments per day
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">This Week</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">New Users:</span>
                <span className="font-medium text-blue-600">{analytics.newUsersThisWeek}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New Posts:</span>
                <span className="font-medium text-green-600">{analytics.postsThisWeek}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New Comments:</span>
                <span className="font-medium text-purple-600">{analytics.commentsThisWeek}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Engagement Rate</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Comments per Post:</span>
                <span className="font-medium">
                  {analytics.totalPosts > 0 ? (analytics.totalComments / analytics.totalPosts).toFixed(1) : '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Users:</span>
                <span className="font-medium">
                  {Math.min(analytics.topPosters.length + analytics.topCommenters.length, analytics.totalUsers)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Growth Rate:</span>
                <span className="font-medium text-green-600">
                  {analytics.totalUsers > 0 ? ((analytics.newUsersThisMonth / analytics.totalUsers) * 100).toFixed(1) : '0'}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900">Community Health</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Seekers:</span>
                <span className="font-medium text-blue-600">
                  {analytics.topPosters.filter(p => p.role === 'seeker').length + 
                   analytics.topCommenters.filter(c => c.role === 'seeker').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Supporters:</span>
                <span className="font-medium text-green-600">
                  {analytics.topPosters.filter(p => p.role === 'supporter').length + 
                   analytics.topCommenters.filter(c => c.role === 'supporter').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Balance Score:</span>
                <span className="font-medium text-purple-600">Good</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Contributors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Top Contributors (Posts)</h3>
            <p className="text-gray-600 text-sm">Most active content creators</p>
          </CardHeader>
          <CardContent>
            {analytics.topPosters.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No posts yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.topPosters.map((poster, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {poster.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{poster.full_name}</p>
                        <p className={`text-xs ${
                          poster.role === 'seeker' ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {poster.role === 'seeker' ? 'Seeking Help' : 'Offering Help'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{poster.post_count}</p>
                      <p className="text-xs text-gray-500">posts</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Top Engagers (Comments)</h3>
            <p className="text-gray-600 text-sm">Most active community members</p>
          </CardHeader>
          <CardContent>
            {analytics.topCommenters.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No comments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.topCommenters.map((commenter, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {commenter.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{commenter.full_name}</p>
                        <p className={`text-xs ${
                          commenter.role === 'seeker' ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {commenter.role === 'seeker' ? 'Seeking Help' : 'Offering Help'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{commenter.comment_count}</p>
                      <p className="text-xs text-gray-500">comments</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}