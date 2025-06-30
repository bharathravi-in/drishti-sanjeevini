import React from 'react';
import { Home, Plus, Search, Bell, User, MessageCircle, Crown } from 'lucide-react';
import { NotificationBell } from '../notifications/NotificationBell';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface MobileBottomNavProps {
  currentView: 'feed' | 'create' | 'explore' | 'notifications' | 'profile' | 'messages' | 'premium';
  onViewChange: (view: 'feed' | 'create' | 'explore' | 'notifications' | 'profile' | 'messages' | 'premium') => void;
}

export function MobileBottomNav({ currentView, onViewChange }: MobileBottomNavProps) {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  const profilePhotoUrl = (user as any).profile_photo_url;
  const userInitials = user.full_name ? user.full_name.charAt(0).toUpperCase() : '?';

  const navItems = [
    {
      id: 'feed' as const,
      icon: Home,
      label: t('home'),
      active: currentView === 'feed'
    },
    {
      id: 'create' as const,
      icon: Plus,
      label: t('create'),
      active: currentView === 'create'
    },
    {
      id: 'explore' as const,
      icon: Search,
      label: 'Explore',
      active: currentView === 'explore'
    },
    {
      id: 'messages' as const,
      icon: MessageCircle,
      label: 'Messages',
      active: currentView === 'messages'
    },
    {
      id: 'premium' as const,
      icon: Crown,
      label: 'Premium',
      active: currentView === 'premium',
      isPremium: true
    },
    {
      id: 'notifications' as const,
      icon: Bell,
      label: 'Notifications',
      active: currentView === 'notifications',
      isNotification: true
    },
    {
      id: 'profile' as const,
      icon: User,
      label: t('profile'),
      active: currentView === 'profile',
      isProfile: true
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className="flex flex-col items-center py-2 px-2 min-w-0 flex-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {item.isNotification ? (
              <div className="relative">
                <NotificationBell />
              </div>
            ) : item.isProfile ? (
              <div className="w-5 h-5 rounded-full overflow-hidden">
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-full h-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center ${profilePhotoUrl ? 'hidden' : 'flex'}`}
                >
                  <span className="text-white font-semibold text-xs">
                    {userInitials}
                  </span>
                </div>
              </div>
            ) : (
              <item.icon 
                className={`w-5 h-5 ${
                  item.active 
                    ? item.isPremium 
                      ? 'text-yellow-500' 
                      : 'text-green-600 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`} 
              />
            )}
            <span 
              className={`text-xs mt-1 truncate ${
                item.active 
                  ? item.isPremium 
                    ? 'text-yellow-500 font-medium' 
                    : 'text-green-600 dark:text-green-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}