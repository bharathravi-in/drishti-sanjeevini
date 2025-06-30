import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Search, X, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FollowButton } from './FollowButton';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface FollowListProps {
  userId: string;
  type: 'followers' | 'following';
  isOpen: boolean;
  onClose: () => void;
}

interface FollowUser {
  id: string;
  full_name: string;
  username: string;
  profile_photo_url: string;
  role: 'seeker' | 'supporter';
  created_at: string;
}

export function FollowList({ userId, type, isOpen, onClose }: FollowListProps) {
  const { user } = useAuth();
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    if (!isOpen) return;

    try {
      setLoading(true);
      
      let query;
      if (type === 'followers') {
        query = supabase
          .from('follows')
          .select(`
            follower:users!follower_id(
              id, full_name, username, profile_photo_url, role, created_at
            )
          `)
          .eq('following_id', userId);
      } else {
        query = supabase
          .from('follows')
          .select(`
            following:users!following_id(
              id, full_name, username, profile_photo_url, role, created_at
            )
          `)
          .eq('follower_id', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const userList = data?.map(item => 
        type === 'followers' ? item.follower : item.following
      ).filter(Boolean) || [];

      setUsers(userList);
      setFilteredUsers(userList);
    } catch (error) {
      console.error('Error fetching follow list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userId, type, isOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = users.filter(user =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[80vh] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {type === 'followers' ? (
                <Users className="w-5 h-5 text-blue-600" />
              ) : (
                <UserCheck className="w-5 h-5 text-green-600" />
              )}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {type === 'followers' ? 'Followers' : 'Following'} ({users.length})
              </h3>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              {searchQuery ? (
                <>
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No users found
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try a different search term
                  </p>
                </>
              ) : (
                <>
                  {type === 'followers' ? (
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  ) : (
                    <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  )}
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No {type} yet
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {type === 'followers' 
                      ? 'No one is following this user yet'
                      : 'This user isn\'t following anyone yet'
                    }
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredUsers.map((followUser) => (
                <div key={followUser.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* User Avatar */}
                      <div className="w-10 h-10 rounded-full overflow-hidden">
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
                        <div className="flex items-center space-x-2 text-xs">
                          {followUser.username && (
                            <span className="text-gray-500">@{followUser.username}</span>
                          )}
                          <span className={`px-2 py-1 rounded-full ${
                            followUser.role === 'seeker' 
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          }`}>
                            {followUser.role === 'seeker' ? 'Seeking' : 'Helping'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Follow Button */}
                    {user && user.id !== followUser.id && (
                      <FollowButton
                        targetUserId={followUser.id}
                        targetUserName={followUser.full_name}
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}