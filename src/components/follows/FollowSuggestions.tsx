import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Sparkles, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { FollowButton } from './FollowButton';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface SuggestedUser {
  user_id: string;
  full_name: string;
  username: string;
  profile_photo_url: string;
  mutual_connections: number;
  common_interests: string[];
}

export function FollowSuggestions() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('get_follow_suggestions', {
        user_uuid: user.id,
        limit_count: 5
      });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching follow suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [user]);

  if (!user || suggestions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <UserPlus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Suggested for you
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                People you might know
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSuggestions}
            loading={loading}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div key={suggestion.user_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                {/* User Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {suggestion.profile_photo_url ? (
                    <img
                      src={suggestion.profile_photo_url}
                      alt={suggestion.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {suggestion.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {suggestion.full_name}
                  </h4>
                  {suggestion.username && (
                    <p className="text-sm text-gray-500">@{suggestion.username}</p>
                  )}
                  
                  {/* Connection Info */}
                  <div className="flex items-center space-x-2 mt-1">
                    {suggestion.mutual_connections > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                        <Users className="w-3 h-3" />
                        <span>{suggestion.mutual_connections} mutual</span>
                      </div>
                    )}
                    
                    {suggestion.common_interests.length > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
                        <Sparkles className="w-3 h-3" />
                        <span>{suggestion.common_interests.length} shared interests</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Common Interests */}
                  {suggestion.common_interests.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {suggestion.common_interests.slice(0, 2).map((interest) => (
                        <span
                          key={interest}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        >
                          {interest}
                        </span>
                      ))}
                      {suggestion.common_interests.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{suggestion.common_interests.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Follow Button */}
              <FollowButton
                targetUserId={suggestion.user_id}
                targetUserName={suggestion.full_name}
                size="sm"
                onFollowChange={() => {
                  // Remove from suggestions when followed
                  setSuggestions(prev => prev.filter(s => s.user_id !== suggestion.user_id));
                }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}