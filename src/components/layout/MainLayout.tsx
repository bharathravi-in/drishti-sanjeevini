import React from 'react';
import { Sparkles, Home, Plus, User, Search, Shield, BarChart3, MessageCircle, Crown } from 'lucide-react';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LanguageSelector } from '../ui/LanguageSelector';
import { NotificationBell } from '../notifications/NotificationBell';
import { SubscriptionStatus } from '../payments/SubscriptionStatus';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface MainLayoutProps {
  children: React.ReactNode;
  currentView: 'feed' | 'create' | 'explore' | 'notifications' | 'profile' | 'admin' | 'analytics' | 'messages' | 'premium';
  onViewChange: (view: 'feed' | 'create' | 'explore' | 'notifications' | 'profile' | 'admin' | 'analytics' | 'messages' | 'premium') => void;
}

export function MainLayout({ children, currentView, onViewChange }: MainLayoutProps) {
  const { user, signOut } = useAuth();
  const { t, isRTL } = useLanguage();

  if (!user) return null;

  // Get profile photo URL from user data
  const profilePhotoUrl = (user as any).profile_photo_url;
  const userInitials = user.full_name ? user.full_name.charAt(0).toUpperCase() : '?';
  const isAdmin = user.role === 'admin';

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Logo + App Title */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-green-700 dark:text-green-400">{t('appName')}</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t('tagline')}</p>
              </div>
            </div>

            {/* Center: Navigation (Desktop) */}
            <div className="hidden lg:flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant={currentView === 'feed' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onViewChange('feed')}
                className="flex items-center space-x-2 rtl:space-x-reverse"
              >
                <Home className="w-4 h-4" />
                <span>{t('feed')}</span>
              </Button>
              <Button
                variant={currentView === 'create' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onViewChange('create')}
                className="flex items-center space-x-2 rtl:space-x-reverse"
              >
                <Plus className="w-4 h-4" />
                <span>{t('create')}</span>
              </Button>
              <Button
                variant={currentView === 'explore' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onViewChange('explore')}
                className="flex items-center space-x-2 rtl:space-x-reverse"
              >
                <Search className="w-4 h-4" />
                <span>Explore</span>
              </Button>
              <Button
                variant={currentView === 'messages' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onViewChange('messages')}
                className="flex items-center space-x-2 rtl:space-x-reverse"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Messages</span>
              </Button>
              <Button
                variant={currentView === 'premium' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onViewChange('premium')}
                className="flex items-center space-x-2 rtl:space-x-reverse bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 border-none"
              >
                <Crown className="w-4 h-4" />
                <span>Premium</span>
              </Button>
              {isAdmin && (
                <>
                  <Button
                    variant={currentView === 'admin' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => onViewChange('admin')}
                    className="flex items-center space-x-2 rtl:space-x-reverse"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </Button>
                  <Button
                    variant={currentView === 'analytics' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => onViewChange('analytics')}
                    className="flex items-center space-x-2 rtl:space-x-reverse"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Analytics</span>
                  </Button>
                </>
              )}
            </div>

            {/* Right: Controls */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse flex-shrink-0">
              {/* Notifications */}
              <NotificationBell />

              {/* Language & Theme Controls Group */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <LanguageSelector />
                <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                <ThemeToggle />
              </div>

              {/* User Profile Section */}
              <div className="relative group">
                <div className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200">
                  {/* Profile Photo with Fallback */}
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-gray-600 shadow-sm">
                    {profilePhotoUrl ? (
                      <img
                        src={profilePhotoUrl}
                        alt={`${user.full_name}'s profile`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    {/* Fallback initials display */}
                    <div 
                      className={`w-full h-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center ${profilePhotoUrl ? 'hidden' : 'flex'}`}
                    >
                      <span className="text-white font-semibold text-sm">
                        {userInitials}
                      </span>
                    </div>
                  </div>
                  
                  <div className="hidden md:block text-left rtl:text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-32">
                      {user.full_name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {user.role === 'seeker' ? t('seekingHelp') : user.role === 'admin' ? 'Administrator' : t('offeringHelp')}
                    </p>
                  </div>
                </div>

                {/* Profile Dropdown */}
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <button
                      onClick={() => onViewChange('profile')}
                      className="w-full px-4 py-2 text-left rtl:text-right text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
                    >
                      <User className="w-4 h-4" />
                      <span>{t('profile')}</span>
                    </button>
                    <button
                      onClick={() => onViewChange('messages')}
                      className="w-full px-4 py-2 text-left rtl:text-right text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Messages</span>
                    </button>
                    <button
                      onClick={() => onViewChange('premium')}
                      className="w-full px-4 py-2 text-left rtl:text-right text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
                    >
                      <Crown className="w-4 h-4 text-yellow-500" />
                      <span>Premium</span>
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => onViewChange('admin')}
                          className="w-full px-4 py-2 text-left rtl:text-right text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </button>
                        <button
                          onClick={() => onViewChange('analytics')}
                          className="w-full px-4 py-2 text-left rtl:text-right text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span>Analytics</span>
                        </button>
                      </>
                    )}
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                    <button
                      onClick={signOut}
                      className="w-full px-4 py-2 text-left rtl:text-right text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      {t('signOut')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Subscription Status */}
      <div className="max-w-4xl mx-auto px-4 py-2">
        <SubscriptionStatus />
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-20 md:pb-6">
        {children}
      </main>
    </div>
  );
}