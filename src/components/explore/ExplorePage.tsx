import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Users, Filter } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { PostFeed } from '../posts/PostFeed';
import { FollowSuggestions } from '../follows/FollowSuggestions';
import { ExploreSearch, SearchFilters } from '../posts/ExploreSearch';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface TrendingPost {
  id: string;
  content: string;
  media_url: string | null;
  media_type: 'image' | 'video' | null;
  created_at: string;
  user_full_name: string;
  user_role: 'seeker' | 'supporter';
  engagement_score: number;
}

interface ExploreStats {
  totalPosts: number;
  totalUsers: number;
  activeToday: number;
  trendingTopics: string[];
}

export function ExplorePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'search' | 'trending' | 'discover'>('search');
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [stats, setStats] = useState<ExploreStats>({
    totalPosts: 0,
    totalUsers: 0,
    activeToday: 0,
    trendingTopics: []
  });
  const [loading, setLoading] = useState(false);

  const fetchTrendingPosts = async () => {
    try {
      setLoading(true);
      
      // Call the trending posts function
      const { data, error } = await supabase.rpc('get_trending_posts', { 
        limit_count: 10 
      });

      if (error) throw error;
      setTrendingPosts(data || []);
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      toast.error('Failed to load trending posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchExploreStats = async () => {
    try {
      const [postsResult, usersResult] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true })
      ]);

      // Get posts from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Get trending interests (most common interests)
      const { data: interestsData } = await supabase
        .from('users')
        .select('interests')
        .not('interests', 'is', null);

      const interestCounts: Record<string, number> = {};
      interestsData?.forEach(user => {
        user.interests?.forEach((interest: string) => {
          interestCounts[interest] = (interestCounts[interest] || 0) + 1;
        });
      });

      const trendingTopics = Object.entries(interestCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([topic]) => topic);

      setStats({
        totalPosts: postsResult.count || 0,
        totalUsers: usersResult.count || 0,
        activeToday: todayPosts || 0,
        trendingTopics
      });
    } catch (error) {
      console.error('Error fetching explore stats:', error);
    }
  };

  useEffect(() => {
    fetchExploreStats();
    if (activeTab === 'trending') {
      fetchTrendingPosts();
    }
  }, [activeTab]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Search className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Explore</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Discover new content and connect with your community
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</h3>
            <p className="text-gray-600 dark:text-gray-400">Community Members</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPosts}</h3>
            <p className="text-gray-600 dark:text-gray-400">Total Posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Filter className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeToday}</h3>
            <p className="text-gray-600 dark:text-gray-400">Posts Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Search className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.trendingTopics.length}</h3>
            <p className="text-gray-600 dark:text-gray-400">Active Topics</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'search'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Search className="w-4 h-4 inline mr-2" />
          Search & Filter
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'trending'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Trending
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'discover'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Discover
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <PostFeed />
        </div>
      )}

      {activeTab === 'trending' && (
        <div className="space-y-6">
          {/* Trending Topics */}
          {stats.trendingTopics.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Trending Topics
                </h2>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {stats.trendingTopics.map((topic) => (
                    <span
                      key={topic}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                    >
                      #{topic}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trending Posts */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Trending Posts
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Posts with high engagement in the last 24 hours
              </p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : trendingPosts.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No trending posts yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Check back later to see what's trending in your community
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trendingPosts.map((post, index) => (
                    <div
                      key={post.id}
                      className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {post.user_full_name}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            post.user_role === 'seeker' 
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                              : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          }`}>
                            {post.user_role === 'seeker' ? 'Seeking' : 'Helping'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(post.created_at)}
                          </span>
                        </div>
                        
                        <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
                          {post.content.length > 100 
                            ? `${post.content.substring(0, 100)}...` 
                            : post.content
                          }
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            🔥 {Math.round(post.engagement_score)} engagement
                          </span>
                          {post.media_type && (
                            <span className="text-xs text-gray-500">
                              {post.media_type === 'image' ? '📷' : '🎥'} {post.media_type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'discover' && (
        <div className="space-y-6">
          <FollowSuggestions />
          
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Discover New Connections
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Find people in your community with similar interests
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  More features coming soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Advanced user discovery and community features will be available soon
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}