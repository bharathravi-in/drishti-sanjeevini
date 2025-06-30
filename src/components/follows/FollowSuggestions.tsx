import React, { useState, useEffect } from 'react';
import { Users, Sparkles, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { FollowButton } from './FollowButton';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface SuggestedUser {
  id: string;
  full_name: string;
  profile_photo_url?: string;
  role: 'seeker' | 'supporter';
  interests: string[];
  city?: string;
  state?: string;
  mutual_connections: number;
}

interface FollowSuggestionsProps {
  className?: string;
  maxSuggestions?: number;
}

export function FollowSuggestions({ className = '', maxSuggestions = 5 }: FollowSuggestionsProps) {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get users with similar interests who the current user isn't following
      const { data: usersData, error } = await supabase
        .from('users')
        .select('id, full_name, profile_photo_url, role, interests, city, state')
        .neq('id', user.id)
        .not('id', 'in', `(
          SELECT following_id FROM follows WHERE follower_id = '${user.id}'
        )`)
        .limit(maxSuggestions * 2); // Get more to filter and randomize

      if (error) throw error;

      // Filter users with similar interests or location
      const filtered = (usersData || [])
        .filter(u => {
          // Check for common interests
          const commonInterests = u.interests?.filter(interest => 
            user.interests?.includes(interest)
          ).length || 0;

          // Check for same location
          const sameLocation = (u.city === user.city && u.state === user.state) && 
                              user.city && user.state;

          return commonInterests > 0 || sameLocation;
        })
        .map(u => ({
          ...u,
          mutual_connections: 0, // We'll calculate this if needed
          interests: u.interests || []
        }))
        .slice(0, maxSuggestions);

      setSuggestions(filtered);
    } catch (error) {
      console.error('Error fetching follow suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [user, maxSuggestions]);

  if (!user || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Suggested for You
            </h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSuggestions}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          People you might want to connect with
        </p>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestedUser) => (
              <div
                key={suggestedUser.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {/* User Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    {suggestedUser.profile_photo_url ? (
                      <img
                        src={suggestedUser.profile_photo_url}
                        alt={suggestedUser.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {suggestedUser.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {suggestedUser.full_name}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        suggestedUser.role === 'seeker' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {suggestedUser.role === 'seeker' ? 'Seeking' : 'Helping'}
                      </span>
                      {suggestedUser.city && suggestedUser.state && (
                        <span className="text-xs text-gray-500">
                          {suggestedUser.city}, {suggestedUser.state}
                        </span>
                      )}
                    </div>
                    
                    {/* Common Interests */}
                    {suggestedUser.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {suggestedUser.interests
                          .filter(interest => user.interests?.includes(interest))
                          .slice(0, 2)
                          .map((interest) => (
                            <span
                              key={interest}
                              className="text-xs px-1 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded"
                            >
                              {interest}
                            </span>
                          ))
                        }
                      </div>
                    )}
                  </div>
                </div>

                {/* Follow Button */}
                <div className="flex-shrink-0 ml-3">
                  <FollowButton
                    targetUserId={suggestedUser.id}
                    targetUserName={suggestedUser.full_name}
                    size="sm"
                    onFollowChange={() => {
                      // Remove from suggestions when followed
                      setSuggestions(prev => 
                        prev.filter(s => s.id !== suggestedUser.id)
                      );
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}