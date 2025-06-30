import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp, Image, Video, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

interface ExploreSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  loading?: boolean;
}

export interface SearchFilters {
  searchQuery: string;
  interests: string[];
  userRole: 'seeker' | 'supporter' | '';
  mediaType: 'image' | 'video' | '';
  location: string;
}

const INTERESTS = [
  { value: 'Education', icon: '📚', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'Healthcare', icon: '🏥', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'Employment', icon: '💼', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'Counseling', icon: '🤝', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'Donation', icon: '💝', color: 'bg-pink-100 text-pink-700 border-pink-200' },
];

export function ExploreSearch({ onFiltersChange, loading = false }: ExploreSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    searchQuery: '',
    interests: [],
    userRole: '',
    mediaType: '',
    location: ''
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Notify parent of filter changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange(filters);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [filters, onFiltersChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: e.target.value
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setFilters(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleRoleChange = (role: 'seeker' | 'supporter' | '') => {
    setFilters(prev => ({
      ...prev,
      userRole: role
    }));
  };

  const handleMediaTypeChange = (mediaType: 'image' | 'video' | '') => {
    setFilters(prev => ({
      ...prev,
      mediaType: mediaType
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      searchQuery: '',
      interests: [],
      userRole: '',
      mediaType: '',
      location: ''
    });
  };

  const hasActiveFilters = filters.interests.length > 0 || 
                          filters.searchQuery.trim() || 
                          filters.userRole ||
                          filters.mediaType ||
                          filters.location.trim();
  
  const activeFilterCount = filters.interests.length + 
                           (filters.searchQuery.trim() ? 1 : 0) + 
                           (filters.userRole ? 1 : 0) +
                           (filters.mediaType ? 1 : 0) +
                           (filters.location.trim() ? 1 : 0);

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {/* Search Bar - Always Visible */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search posts by content, keywords, or user names..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button (Mobile) */}
        {isMobile && (
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Advanced Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        )}

        {/* Filter Content */}
        <div className={`space-y-6 ${isMobile ? (isExpanded ? 'block' : 'hidden') : 'block'}`}>
          {/* Quick Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* User Type Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                User Type
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleRoleChange('')}
                  className={`px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
                    filters.userRole === ''
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-1" />
                  All
                </button>
                <button
                  onClick={() => handleRoleChange('seeker')}
                  className={`px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
                    filters.userRole === 'seeker'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  🤝 Seeking Help
                </button>
                <button
                  onClick={() => handleRoleChange('supporter')}
                  className={`px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
                    filters.userRole === 'supporter'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                >
                  ❤️ Offering Help
                </button>
              </div>
            </div>

            {/* Media Type Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Media Type
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleMediaTypeChange('')}
                  className={`px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
                    filters.mediaType === ''
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                >
                  All Media
                </button>
                <button
                  onClick={() => handleMediaTypeChange('image')}
                  className={`px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
                    filters.mediaType === 'image'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                  }`}
                >
                  <Image className="w-4 h-4 inline mr-1" />
                  Images
                </button>
                <button
                  onClick={() => handleMediaTypeChange('video')}
                  className={`px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
                    filters.mediaType === 'video'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                  }`}
                >
                  <Video className="w-4 h-4 inline mr-1" />
                  Videos
                </button>
              </div>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Location
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, State, or Country"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Interest Filters */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Filter by Interests
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest.value}
                  onClick={() => handleInterestToggle(interest.value)}
                  className={`p-3 rounded-lg border transition-all duration-200 text-center hover:shadow-sm ${
                    filters.interests.includes(interest.value)
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-sm'
                      : 'border-gray-300 dark:border-gray-600 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-lg">{interest.icon}</span>
                    <span className="font-medium text-xs text-gray-900 dark:text-white">{interest.value}</span>
                    {filters.interests.includes(interest.value) && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters Button (Desktop) */}
          {!isMobile && hasActiveFilters && (
            <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>

        {/* Active Filters Chips */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 mr-2">Active filters:</span>
              
              {filters.searchQuery && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800">
                  Search: "{filters.searchQuery.length > 15 ? filters.searchQuery.substring(0, 15) + '...' : filters.searchQuery}"
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                    className="ml-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {filters.userRole && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                  filters.userRole === 'seeker' 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800'
                }`}>
                  {filters.userRole === 'seeker' ? '🤝 Seeking Help' : '❤️ Offering Help'}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, userRole: '' }))}
                    className={`ml-1 ${filters.userRole === 'seeker' ? 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200' : 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200'}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.mediaType && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                  filters.mediaType === 'image'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
                }`}>
                  {filters.mediaType === 'image' ? '📷 Images' : '🎥 Videos'}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, mediaType: '' }))}
                    className={`ml-1 ${filters.mediaType === 'image' ? 'text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200' : 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200'}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.location && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                  📍 {filters.location}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, location: '' }))}
                    className="ml-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {filters.interests.map((interest) => {
                const interestData = INTERESTS.find(i => i.value === interest);
                return (
                  <span
                    key={interest}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                  >
                    {interestData?.icon} {interest}
                    <button
                      onClick={() => handleInterestToggle(interest)}
                      className="ml-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Searching posts...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}