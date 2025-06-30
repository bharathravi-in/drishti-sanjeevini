import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, MapPin, Calendar, MessageCircle, Heart, Share2, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { FollowButton } from '../follows/FollowButton';
import { FollowStats } from '../follows/FollowStats';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface PublicUser {
  id: string;
  username: string;
  full_name: string;
  role: 'seeker' | 'supporter';
  interests: string[];
  city: string;
  state: string;
  profile_photo_url?: string;
  cover_photo_url?: string;
  created_at: string;
}

interface UserPost {
  id: string;
  content: string;
  media_url: string | null;
  media_type: 'image' | 'video' | null;
  created_at: string;
  like_count: number;
  comment_count: number;
}

export function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<PublicUser | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchProfile = async () => {
    if (!username) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .select('id, username, full_name, role, interests, city, state, profile_photo_url, cover_photo_url, created_at')
        .eq('username', username)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error('User not found');
        } else {
          throw error;
        }
        return;
      }

      setProfileUser(data);
      
      // Set page title
      document.title = `${data.full_name} | DRiSHTi SANjEEViNi`;
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    if (!profileUser) return;

    try {
      setPostsLoading(true);
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          media_url,
          media_type,
          created_at
        `)
        .eq('user_id', profileUser.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Get like and comment counts for each post
      const postsWithCounts = await Promise.all(
        (data || []).map(async (post) => {
          const [likesResult, commentsResult] = await Promise.all([
            supabase
              .from('likes')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id),
            supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id)
          ]);

          return {
            ...post,
            like_count: likesResult.count || 0,
            comment_count: commentsResult.count || 0
          };
        })
      );

      setPosts(postsWithCounts);
      
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (profileUser) {
      fetchUserPosts();
    }
  }, [profileUser]);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileUser?.full_name} | DRiSHTi SANjEEViNi`,
          text: `Check out ${profileUser?.full_name}'s profile on DRiSHTi SANjEEViNi`,
          url: url
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Profile link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="text-center py-12 max-w-md mx-4">
          <CardContent>
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">User Not Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The profile you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Cover Photo and Profile Header */}
        <div className="relative mb-8">
          {/* Cover Photo */}
          <div className="w-full h-48 rounded-lg overflow-hidden bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30">
            {profileUser.cover_photo_url ? (
              <img
                src={profileUser.cover_photo_url}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <User className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No cover photo</p>
                </div>
              </div>
            )}
          </div>

          {/* Profile Info Overlay */}
          <div className="absolute -bottom-16 left-0 right-0 px-6">
            <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
              {/* Profile Photo */}
              <div className="relative z-10">
                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                  {profileUser.profile_photo_url ? (
                    <img
                      src={profileUser.profile_photo_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-2xl">
                      {profileUser.full_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {profileUser.full_name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        profileUser.role === 'seeker' 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      }`}>
                        <span className="mr-2">{profileUser.role === 'seeker' ? '🤝' : '❤️'}</span>
                        {profileUser.role === 'seeker' ? 'Seeking Help' : 'Offering Help'}
                      </div>
                      
                      {profileUser.city && profileUser.state && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          {profileUser.city}, {profileUser.state}
                        </div>
                      )}
                      
                      <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        Joined {new Date(profileUser.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* Follow Stats */}
                    <FollowStats userId={profileUser.id} />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button onClick={handleShare} variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                    
                    {!isOwnProfile && (
                      <>
                        <FollowButton 
                          targetUserId={profileUser.id}
                          targetUserName={profileUser.full_name}
                        />
                        <Button variant="primary" size="sm">
                          <MessageCircle className="w-4 h-4" />
                          Message
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacing for overlay */}
        <div className="pt-20"></div>

        {/* Interests */}
        {profileUser.interests && profileUser.interests.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Interests</h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profileUser.interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Posts ({posts.length})
              </h3>
              <div className="flex space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No posts yet</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {isOwnProfile ? "You haven't shared anything yet." : `${profileUser.full_name} hasn't shared anything yet.`}
                </p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
                      viewMode === 'list' ? 'p-4' : ''
                    }`}
                  >
                    {viewMode === 'grid' ? (
                      <>
                        {post.media_url ? (
                          <div className="aspect-square">
                            {post.media_type === 'image' ? (
                              <img
                                src={post.media_url}
                                alt="Post media"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <video
                                src={post.media_url}
                                className="w-full h-full object-cover"
                                controls={false}
                                muted
                              />
                            )}
                          </div>
                        ) : (
                          <div className="aspect-square bg-gray-100 dark:bg-gray-800 p-4 flex items-center justify-center">
                            <p className="text-gray-700 dark:text-gray-300 text-sm text-center line-clamp-6">
                              {post.content}
                            </p>
                          </div>
                        )}
                        <div className="p-3">
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center">
                                <Heart className="w-4 h-4 mr-1" />
                                {post.like_count}
                              </span>
                              <span className="flex items-center">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                {post.comment_count}
                              </span>
                            </div>
                            <span>{formatTimeAgo(post.created_at)}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                          {post.content}
                        </p>
                        {post.media_url && (
                          <div className="rounded-lg overflow-hidden">
                            {post.media_type === 'image' ? (
                              <img
                                src={post.media_url}
                                alt="Post media"
                                className="w-full max-h-64 object-cover"
                              />
                            ) : (
                              <video
                                src={post.media_url}
                                controls
                                className="w-full max-h-64"
                              />
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Heart className="w-4 h-4 mr-1" />
                              {post.like_count} likes
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {post.comment_count} comments
                            </span>
                          </div>
                          <span>{formatTimeAgo(post.created_at)}</span>
                        </div>
                      </div>
                    )}
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