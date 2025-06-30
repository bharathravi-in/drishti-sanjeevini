import React, { useState, useEffect } from 'react';
import { Users, UserCheck, ArrowLeft, Search, X } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FollowButton } from './FollowButton';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface FollowUser {
  id: string;
  full_name: string;
  profile_photo_url?: string;
  role: 'seeker' | 'supporter';
  followed_at: string;
}

interface FollowListProps {
  userId: string;
  userName: string;
  type: 'followers' | 'following';
  isOpen: boolean;
  onClose: () => void;
}

export function FollowList({ userId, userName, type, isOpen, onClose }: FollowListProps) {
  const { user } = useAuth();
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const functionName = type === 'followers' ? 'get_user_followers' : 'get_user_following';
      const { data, error } = await supabase.rpc(functionName, {
        user_id: userId,
        limit_count: 100
      });

      if (error) throw error;
      
      const mappedUsers = (data || []).map((item: any) => ({
        id: type === 'followers' ? item.follower_id : item.following_id,
        full_name: type === 'followers' ? item.follower_name : item.following_name,
        profile_photo_url: type === 'followers' ? item.follower_avatar : item.following_avatar,
        role: type === 'followers' ? item.follower_role : item.following_role,
        followed_at: item.followed_at
      }));
      
      setUsers(mappedUsers);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, userId, type]);

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[80vh] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="p-1 h-6 w-6"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-2">
                {type === 'followers' ? (
                  <Users className="w-5 h-5 text-blue-600" />
                ) : (
                  <UserCheck className="w-5 h-5 text-green-600" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {userName}'s {type === 'followers' ? 'Followers' : 'Following'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {users.length} {type === 'followers' ? 'followers' : 'following'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${type}...`}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-3 p-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                {type === 'followers' ? (
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                ) : (
                  <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                )}
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {searchQuery ? 'No users found' : `No ${type} yet`}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {searchQuery 
                    ? 'Try a different search term' 
                    : `${userName} ${type === 'followers' ? "doesn't have any followers" : "isn't following anyone"} yet`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((followUser) => (
                  <div
                    key={followUser.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {/* User Avatar */}
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        {followUser.profile_photo_url ? (
                          <img
                            src={followUser.profile_photo_url}
                            alt={followUser.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {followUser.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {followUser.full_name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            followUser.role === 'seeker' 
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          }`}>
                            {followUser.role === 'seeker' ? 'Seeking Help' : 'Offering Help'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(followUser.followed_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Follow Button */}
                    <div className="flex-shrink-0 ml-3">
                      <FollowButton
                        targetUserId={followUser.id}
                        targetUserName={followUser.full_name}
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}