import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ProfileForm } from './ProfileForm';
import { ProfileDetails } from '../profile/ProfileDetails';
import { MainLayout } from '../layout/MainLayout';
import { MobileBottomNav } from '../layout/MobileBottomNav';
import { CreatePost } from '../posts/CreatePost';
import { PostFeed } from '../posts/PostFeed';
import { ExplorePage } from '../explore/ExplorePage';
import { NotificationsList } from '../notifications/NotificationsList';
import { AdminDashboard } from '../posts/AdminDashboard';
import { AdminAnalytics } from '../analytics/AdminAnalytics';
import { MessageCenter } from '../messaging/MessageCenter';
import { PremiumFeatures } from '../payments/PremiumFeatures';
import { PaymentSuccess } from '../payments/PaymentSuccess';
import { PaymentCancelled } from '../payments/PaymentCancelled';
import { LandingPage } from '../layout/LandingPage';
import { Footer } from '../layout/Footer';
import { TermsOfService } from '../legal/TermsOfService';
import { PrivacyPolicy } from '../legal/PrivacyPolicy';
import { PWAInstallPrompt } from '../pwa/PWAInstallPrompt';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export function AuthContainer() {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [currentView, setCurrentView] = useState<'feed' | 'create' | 'explore' | 'notifications' | 'profile' | 'admin' | 'analytics' | 'messages' | 'premium'>('feed');

  // Check for payment success/cancel in URL
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  const paymentStatus = window.location.pathname;

  // Handle payment success page
  if (paymentStatus === '/payment-success' && sessionId) {
    return (
      <PaymentSuccess 
        sessionId={sessionId}
        onContinue={() => {
          window.history.replaceState({}, '', '/');
          setCurrentView('feed');
        }}
      />
    );
  }

  // Handle payment cancelled page
  if (paymentStatus === '/payment-cancelled') {
    return (
      <PaymentCancelled 
        onRetry={() => {
          window.history.replaceState({}, '', '/');
          setCurrentView('premium');
        }}
        onGoBack={() => {
          window.history.replaceState({}, '', '/');
          setCurrentView('feed');
        }}
      />
    );
  }

  // Show legal pages
  if (showTerms) {
    return <TermsOfService onBack={() => setShowTerms(false)} />;
  }

  if (showPrivacy) {
    return <PrivacyPolicy onBack={() => setShowPrivacy(false)} />;
  }

  // Show landing page for non-authenticated users
  if (!user && showLanding) {
    return (
      <>
        <LandingPage onGetStarted={() => setShowLanding(false)} />
        <Footer 
          onTermsClick={() => setShowTerms(true)}
          onPrivacyClick={() => setShowPrivacy(true)}
        />
      </>
    );
  }

  // If user exists but profile is incomplete, show profile form
  if (user && !user.full_name) {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 transition-colors duration-200 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="max-w-4xl mx-auto">
          <ProfileForm />
        </div>
      </div>
    );
  }

  // If user is complete, show main application
  if (user && user.full_name) {
    return (
      <>
        <MainLayout currentView={currentView} onViewChange={setCurrentView}>
          {currentView === 'feed' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('communityFeed')}</h2>
                <p className="text-gray-600 dark:text-gray-400">{t('tagline')}</p>
              </div>
              <PostFeed />
            </div>
          )}
          
          {currentView === 'create' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('shareStory')}</h2>
                <p className="text-gray-600 dark:text-gray-400">Connect with your community through your experiences</p>
              </div>
              <CreatePost onPostCreated={() => setCurrentView('feed')} />
            </div>
          )}

          {currentView === 'explore' && (
            <ExplorePage />
          )}

          {currentView === 'notifications' && (
            <NotificationsList />
          )}
          
          {currentView === 'profile' && (
            <div className="space-y-6">
              <ProfileDetails />
            </div>
          )}

          {currentView === 'admin' && user.role === 'admin' && (
            <div className="space-y-6">
              <AdminDashboard />
            </div>
          )}

          {currentView === 'analytics' && user.role === 'admin' && (
            <div className="space-y-6">
              <AdminAnalytics />
            </div>
          )}

          {currentView === 'messages' && (
            <div className="space-y-6">
              <MessageCenter />
            </div>
          )}

          {currentView === 'premium' && (
            <div className="space-y-6">
              <PremiumFeatures />
            </div>
          )}
        </MainLayout>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav currentView={currentView} onViewChange={setCurrentView} />

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />

        {/* Footer for authenticated users */}
        <Footer 
          onTermsClick={() => setShowTerms(true)}
          onPrivacyClick={() => setShowPrivacy(true)}
        />
      </>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-8 transition-colors duration-200 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-md w-full">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('appName')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('tagline')}</p>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="relative">
              {/* Toggle Animation Background */}
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 ${
                  isLogin ? 'translate-x-0' : 'translate-x-0'
                }`}
              />
              
              <div className="p-6">
                {isLogin ? (
                  <LoginForm onToggleMode={() => setIsLogin(false)} />
                ) : (
                  <SignupForm onToggleMode={() => setIsLogin(true)} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p>
            By continuing, you agree to our{' '}
            <button 
              onClick={() => setShowTerms(true)}
              className="text-green-600 hover:text-green-700 underline"
            >
              Terms of Service
            </button>
            {' '}and{' '}
            <button 
              onClick={() => setShowPrivacy(true)}
              className="text-green-600 hover:text-green-700 underline"
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}