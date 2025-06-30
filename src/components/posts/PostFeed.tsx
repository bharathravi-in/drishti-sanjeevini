import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Flag, MoreHorizontal, Play, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { LikeButton } from './LikeButton';
import { ThreadedComments } from './ThreadedComments';
import { ReportModal } from './ReportModal';
import { ExploreSearch, SearchFilters } from './ExploreSearch';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  content: string;
  media_url: string | null;
  media_type: 'image' | 'video' | null;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    role: 'seeker' | 'supporter';
    city: string;
    state: string;
    interests: string[];
    profile_photo_url?: string;
  } | null;
  like_count: number;
  comment_count: number;
  user_liked: boolean;
}

export function PostFeed() {
  const { user } = useAuth();
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [activeCommentSection, setActiveCommentSection] = useState<string | null>(null);
  const [activeReportModal, setActiveReportModal] = useState<string | null>(null);
  const [reportedPosts, setReportedPosts] = useState<Set<string>>(new Set());
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    searchQuery: '',
    interests: [],
    userRole: '',
    mediaType: '',
    location: ''
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Build the query with joins for likes and comments count
      let query = supabase
        .from('posts')
        .select(`
          *,
          user:users(id, full_name, role, city, state, interests, profile_photo_url),
          likes(count),
          comments(count)
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      
      // Process posts to add computed fields
      const processedPosts = await Promise.all((data || []).map(async (post) => {
        // Get like count
        const { count: likeCount } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        // Get comment count
        const { count: commentCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        // Check if current user liked this post
        let userLiked = false;
        if (user) {
          const { data: likeData } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .maybeSingle();
          userLiked = !!likeData;
        }

        return {
          ...post,
          like_count: likeCount || 0,
          comment_count: commentCount || 0,
          user_liked: userLiked
        };
      }));

      // Fetch user's reports
      if (user) {
        const { data: reportData } = await supabase
          .from('reports')
          .select('post_id')
          .eq('user_id', user.id);

        const userReportedPosts = new Set<string>();
        reportData?.forEach(report => {
          userReportedPosts.add(report.post_id);
        });
        setReportedPosts(userReportedPosts);
      }
      
      setAllPosts(processedPosts);
      setFilteredPosts(processedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  // Filter posts based on search criteria
  useEffect(() => {
    const filterPosts = () => {
      setSearchLoading(true);
      
      let filtered = [...allPosts];

      // Filter by search query
      if (currentFilters.searchQuery.trim()) {
        const query = currentFilters.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(post =>
          post.content.toLowerCase().includes(query) ||
          (post.user?.full_name?.toLowerCase().includes(query) ?? false)
        );
      }

      // Filter by user role
      if (currentFilters.userRole) {
        filtered = filtered.filter(post => post.user?.role === currentFilters.userRole);
      }

      // Filter by media type
      if (currentFilters.mediaType) {
        filtered = filtered.filter(post => post.media_type === currentFilters.mediaType);
      }

      // Filter by location
      if (currentFilters.location.trim()) {
        const location = currentFilters.location.toLowerCase().trim();
        filtered = filtered.filter(post =>
          post.user?.city?.toLowerCase().includes(location) ||
          post.user?.state?.toLowerCase().includes(location)
        );
      }

      // Filter by interests
      if (currentFilters.interests.length > 0) {
        filtered = filtered.filter(post =>
          post.user?.interests && currentFilters.interests.some(interest =>
            post.user.interests.includes(interest)
          )
        );
      }

      setFilteredPosts(filtered);
      setSearchLoading(false);
    };

    const timeoutId = setTimeout(filterPosts, 300);
    return () => clearTimeout(timeoutId);
  }, [allPosts, currentFilters]);

  const handleFiltersChange = (filters: SearchFilters) => {
    setCurrentFilters(filters);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString();
  };

  const toggleExpanded = (postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleLikeChange = (postId: string, liked: boolean, newCount: number) => {
    setAllPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, user_liked: liked, like_count: newCount }
        : post
    ));
    setFilteredPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, user_liked: liked, like_count: newCount }
        : post
    ));
  };

  const handleComment = (postId: string) => {
    setActiveCommentSection(postId);
  };

  const handleCommentCountChange = (postId: string, count: number) => {
    setAllPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, comment_count: count } : post
    ));
    setFilteredPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, comment_count: count } : post
    ));
  };

  const handleReport = (postId: string) => {
    setActiveReportModal(postId);
  };

  const handleReportSubmitted = () => {
    if (activeReportModal) {
      setReportedPosts(prev => new Set(prev).add(activeReportModal));
    }
  };

  const truncateContent = (content: string) => {
    const words = content.split(' ');
    const maxWords = 30;
    
    if (words.length <= maxWords) return content;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  const shouldShowReadMore = (content: string) => {
    return content.split(' ').length > 30;
  };

  const hasActiveFilters = currentFilters.interests.length > 0 || 
                          currentFilters.searchQuery.trim() || 
                          currentFilters.userRole ||
                          currentFilters.mediaType ||
                          currentFilters.location.trim();

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Search skeleton */}
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Post skeletons */}
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
              <div className="flex space-x-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Search and Filter Component */}
      <ExploreSearch onFiltersChange={handleFiltersChange} loading={searchLoading} />

      {/* Results Summary */}
      {hasActiveFilters && (
        <div className="mb-6">
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-800 dark:text-green-300 font-medium">
                    {searchLoading ? 'Searching...' : `Found ${filteredPosts.length} post${filteredPosts.length !== 1 ? 's' : ''}`}
                  </span>
                </div>
                {filteredPosts.length === 0 && !searchLoading && (
                  <span className="text-green-700 dark:text-green-400 text-sm">
                    Try adjusting your search criteria
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {filteredPosts.length === 0 && !searchLoading ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              {hasActiveFilters ? (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No posts match your search</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Try adjusting your search terms or removing some filters.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No posts yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Be the first to share your story!</p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => {
            // Skip posts without user data
            if (!post.user) {
              return null;
            }

            const isExpanded = expandedPosts.has(post.id);
            const isReported = reportedPosts.has(post.id);
            const showReadMore = shouldShowReadMore(post.content);
            const displayContent = isExpanded || !showReadMore 
              ? post.content 
              : truncateContent(post.content);
            
            // Check if current user is the post creator
            const isPostCreator = user && user.id === post.user.id;

            return (
              <Card key={post.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-0">
                  {/* Post Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1">
                        {/* User Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            {post.user.profile_photo_url ? (
                              <img
                                src={post.user.profile_photo_url}
                                alt={post.user.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {post.user.full_name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                          </div>
                          {/* Role indicator */}
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs ${
                            post.user.role === 'seeker' 
                              ? 'bg-blue-500' 
                              : 'bg-green-500'
                          }`}>
                            <span className="text-white text-xs">
                              {post.user.role === 'seeker' ? '🤝' : '❤️'}
                            </span>
                          </div>
                        </div>
                        
                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {post.user.full_name || 'Unknown User'}
                          </h3>
                          <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                            <span className={`font-medium ${
                              post.user.role === 'seeker' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'
                            }`}>
                              {post.user.role === 'seeker' ? 'Seeking Help' : 'Offering Help'}
                            </span>
                            {post.user.city && post.user.state && (
                              <>
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate">{post.user.city}, {post.user.state}</span>
                                </div>
                              </>
                            )}
                          </div>
                          
                          {/* User Interests */}
                          {post.user.interests && post.user.interests.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {post.user.interests.slice(0, 3).map((interest) => (
                                <span
                                  key={interest}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                >
                                  {interest}
                                </span>
                              ))}
                              {post.user.interests.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                  +{post.user.interests.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Timestamp and Menu */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(post.created_at)}</span>
                        </div>
                        <Button variant="outline" size="sm" className="p-1 h-6 w-6">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm">
                        {displayContent}
                        {showReadMore && !isExpanded && (
                          <button
                            onClick={() => toggleExpanded(post.id)}
                            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium ml-1 transition-colors"
                          >
                            Read more
                          </button>
                        )}
                        {showReadMore && isExpanded && (
                          <button
                            onClick={() => toggleExpanded(post.id)}
                            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium ml-1 transition-colors"
                          >
                            Show less
                          </button>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Media */}
                  {post.media_url && (
                    <div className="relative">
                      {post.media_type === 'image' ? (
                        <img
                          src={post.media_url}
                          alt="Post media"
                          className="w-full max-h-96 object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="relative">
                          <video
                            src={post.media_url}
                            controls
                            className="w-full max-h-96"
                            preload="metadata"
                          />
                          <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                            <Play className="w-3 h-3" />
                            <span>Video</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="p-6 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {/* Like Button */}
                        <LikeButton
                          postId={post.id}
                          initialLiked={post.user_liked}
                          initialCount={post.like_count}
                          onLikeChange={(liked, newCount) => handleLikeChange(post.id, liked, newCount)}
                        />
                        
                        {/* Comment Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleComment(post.id)}
                          className="text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="font-medium">
                            {post.comment_count > 0 ? post.comment_count : 'Comment'}
                          </span>
                        </Button>
                      </div>
                      
                      {/* Report Button - Only show if user is NOT the post creator */}
                      {!isPostCreator && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReport(post.id)}
                          disabled={isReported}
                          className={`${
                            isReported
                              ? 'text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed'
                              : 'text-gray-600 dark:text-gray-400 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                          }`}
                        >
                          <Flag className="w-4 h-4" />
                          <span className="font-medium text-xs">
                            {isReported ? 'Reported' : 'Report'}
                          </span>
                        </Button>
                      )}
                    </div>

                    {/* Engagement hint */}
                    {post.like_count === 0 && post.comment_count === 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                          Be the first to support this post.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          }).filter(Boolean)
        )}

        {/* Load more hint */}
        {filteredPosts.length > 0 && !hasActiveFilters && (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              You've reached the end. Check back later for new posts!
            </p>
          </div>
        )}
      </div>

      {/* Comment Section Modal */}
      {activeCommentSection && (
        <ThreadedComments
          postId={activeCommentSection}
          isOpen={true}
          onClose={() => setActiveCommentSection(null)}
          onCommentCountChange={(count) => handleCommentCountChange(activeCommentSection, count)}
        />
      )}

      {/* Report Modal */}
      {activeReportModal && (
        <ReportModal
          postId={activeReportModal}
          isOpen={true}
          onClose={() => setActiveReportModal(null)}
          onReportSubmitted={handleReportSubmitted}
        />
      )}
    </>
  );
}