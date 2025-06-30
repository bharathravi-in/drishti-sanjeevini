import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

interface PostFilterProps {
  onFiltersChange: (filters: FilterState) => void;
  loading?: boolean;
}

export interface FilterState {
  interests: string[];
  searchQuery: string;
  userRole?: 'seeker' | 'supporter' | '';
}

const INTERESTS = [
  { value: 'Education', icon: '📚', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'Healthcare', icon: '🏥', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'Employment', icon: '💼', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'Counseling', icon: '🤝', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'Donation', icon: '💝', color: 'bg-pink-100 text-pink-700 border-pink-200' },
];

export function PostFilter({ onFiltersChange, loading = false }: PostFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    interests: [],
    searchQuery: '',
    userRole: ''
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

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleInterestToggle = (interest: string) => {
    setFilters(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: e.target.value
    }));
  };

  const handleRoleChange = (role: 'seeker' | 'supporter' | '') => {
    setFilters(prev => ({
      ...prev,
      userRole: role
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      interests: [],
      searchQuery: '',
      userRole: ''
    });
  };

  const hasActiveFilters = filters.interests.length > 0 || filters.searchQuery.trim() || filters.userRole;
  const activeFilterCount = filters.interests.length + (filters.searchQuery.trim() ? 1 : 0) + (filters.userRole ? 1 : 0);

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
            placeholder="Search posts by content, keywords..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white placeholder-gray-400 text-sm"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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
              <span>Filters</span>
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
        <div className={`space-y-4 ${isMobile ? (isExpanded ? 'block' : 'hidden') : 'block'}`}>
          {/* User Role Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Filter by User Type
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleRoleChange('')}
                className={`px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
                  filters.userRole === ''
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 text-gray-600 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                All Posts
              </button>
              <button
                onClick={() => handleRoleChange('seeker')}
                className={`px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
                  filters.userRole === 'seeker'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                🤝 Seeking Help
              </button>
              <button
                onClick={() => handleRoleChange('supporter')}
                className={`px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
                  filters.userRole === 'supporter'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 text-gray-600 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                ❤️ Offering Help
              </button>
            </div>
          </div>

          {/* Interest Filters */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Filter by Interests
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest.value}
                  onClick={() => handleInterestToggle(interest.value)}
                  className={`p-3 rounded-lg border transition-all duration-200 text-center hover:shadow-sm ${
                    filters.interests.includes(interest.value)
                      ? 'border-green-500 bg-green-50 shadow-sm'
                      : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-lg">{interest.icon}</span>
                    <span className="font-medium text-xs text-gray-900">{interest.value}</span>
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
            <div className="flex justify-end pt-2 border-t border-gray-100">
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
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 mr-2">Active:</span>
              
              {filters.searchQuery && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  Search: "{filters.searchQuery.length > 15 ? filters.searchQuery.substring(0, 15) + '...' : filters.searchQuery}"
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {filters.userRole && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                  filters.userRole === 'seeker' 
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-green-100 text-green-800 border-green-200'
                }`}>
                  {filters.userRole === 'seeker' ? '🤝 Seeking Help' : '❤️ Offering Help'}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, userRole: '' }))}
                    className={`ml-1 ${filters.userRole === 'seeker' ? 'text-blue-600 hover:text-blue-800' : 'text-green-600 hover:text-green-800'}`}
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
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
                  >
                    {interestData?.icon} {interest}
                    <button
                      onClick={() => handleInterestToggle(interest)}
                      className="ml-1 text-gray-600 hover:text-gray-800"
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
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Filtering posts...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}