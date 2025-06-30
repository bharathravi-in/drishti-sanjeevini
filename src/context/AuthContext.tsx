import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthState, User, ProfileFormData } from '../types/auth';
import { LoadingFallback } from '../components/ui/LoadingFallback';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    console.log('🔄 AuthProvider: Starting initialization');
    
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('🔍 AuthProvider: Getting session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('❌ AuthProvider: Session error:', error);
          setUser(null);
          setInitializing(false);
          return;
        }

        if (session?.user) {
          console.log('✅ AuthProvider: Session found, fetching profile');
          await fetchUserProfile(session.user.id, session.user.email);
        } else {
          console.log('ℹ️ AuthProvider: No session found');
          setUser(null);
          setInitializing(false);
        }
      } catch (error) {
        console.error('💥 AuthProvider: Init error:', error);
        setUser(null);
        if (mounted) {
          setInitializing(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('🔔 AuthProvider: Auth state changed:', event);

      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user.id, session.user.email);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setInitializing(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authId: string, email?: string) => {
    console.log('👤 AuthProvider: Fetching profile for:', authId);
    
    try {
      // Increased timeout to 30 seconds for better reliability in WebContainer environment
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 30000)
      );
      
      const fetchPromise = supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .maybeSingle(); // Use maybeSingle instead of single to handle no results gracefully

      console.log('🔍 AuthProvider: Starting database query...');
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      console.log('📊 AuthProvider: Query completed', { 
        hasData: !!data, 
        hasError: !!error,
        errorMessage: error?.message 
      });

      if (error) {
        console.error('❌ AuthProvider: Profile fetch error:', error);
        setUser(null);
        toast.error('Failed to load profile data. Please sign in again.');
        return;
      }

      if (data) {
        console.log('✅ AuthProvider: Profile loaded successfully', {
          userId: data.id,
          fullName: data.full_name,
          role: data.role
        });
        setUser(data);
      } else {
        console.log('ℹ️ AuthProvider: No profile found - new user needs to complete profile');
        // Create a minimal user object for new users
        const minimalUser: User = {
          id: '',
          auth_id: authId,
          email: email || '',
          full_name: '',
          role: 'seeker',
          interests: [],
          address: '',
          city: '',
          state: '',
          country: '',
          postal_code: '',
          upi_id: '',
          bank_account: '',
          paypal_email: '',
          profile_photo_url: '',
          cover_photo_url: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setUser(minimalUser);
      }
      
    } catch (error: any) {
      console.error('💥 AuthProvider: Profile fetch failed:', error);
      
      if (error.message === 'Profile fetch timeout') {
        console.error('⏰ AuthProvider: Database query timed out');
        // Don't set user to null on timeout - let user retry
        toast.error('Connection timeout. Please try again.');
      } else {
        // For other errors, set user to null to redirect to login
        console.error('🚫 AuthProvider: Setting user to null due to error');
        setUser(null);
        toast.error('Unable to load profile. Please sign in again.');
      }
    } finally {
      // CRITICAL: Always set initializing to false
      console.log('🏁 AuthProvider: Setting initializing to false');
      setInitializing(false);
    }
  };

  const retryInitialization = async () => {
    console.log('🔄 AuthProvider: Retrying initialization');
    setInitializing(true);
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ AuthProvider: Retry session error:', error);
        setUser(null);
        return;
      }

      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('💥 AuthProvider: Retry failed:', error);
      setUser(null);
    } finally {
      setInitializing(false);
    }
  };

  const forceLoginScreen = () => {
    console.log('🚪 AuthProvider: Forcing login screen');
    setUser(null);
    setInitializing(false);
    toast.info('Please sign in to continue');
  };

  const signUp = async (email: string, password: string, role: 'seeker' | 'supporter') => {
    try {
      setLoading(true);
      console.log('📝 AuthProvider: Starting signup');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('❌ AuthProvider: Signup error:', error);
        toast.error(error.message);
        throw error;
      }

      if (data.user) {
        console.log('✅ AuthProvider: User created, creating profile');
        
        const { data: newProfile, error: profileError } = await supabase
          .from('users')
          .insert({
            auth_id: data.user.id,
            email,
            full_name: '',
            role,
          })
          .select()
          .single();

        if (profileError) {
          console.error('❌ AuthProvider: Profile creation error:', profileError);
          toast.error('Failed to create profile');
          throw profileError;
        }

        setUser(newProfile);
        toast.success('Account created successfully!');
      }
    } catch (error) {
      console.error('💥 AuthProvider: Signup failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('🔑 AuthProvider: Starting signin');
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ AuthProvider: Signin error:', error);
        toast.error('Invalid email or password');
        throw error;
      }

      console.log('✅ AuthProvider: Signin successful');
      toast.success('Welcome back!');
    } catch (error) {
      console.error('💥 AuthProvider: Signin failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 AuthProvider: Starting signout');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ AuthProvider: Signout error:', error);
        toast.error('Error signing out');
        throw error;
      }

      setUser(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('💥 AuthProvider: Signout failed:', error);
      // Force clear user state even if signout fails
      setUser(null);
    }
  };

  const completeProfile = async (profileData: ProfileFormData) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      setLoading(true);
      console.log('📋 AuthProvider: Updating profile');
      
      const { error } = await supabase
        .from('users')
        .update(profileData)
        .eq('auth_id', user.auth_id);

      if (error) {
        console.error('❌ AuthProvider: Profile update error:', error);
        toast.error('Failed to update profile');
        throw error;
      }

      // Refresh user data
      await fetchUserProfile(user.auth_id, user.email);
      toast.success(`Welcome, ${profileData.full_name}!`);
    } catch (error) {
      console.error('💥 AuthProvider: Profile update failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthState = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    completeProfile,
  };

  // Debug log for current state
  console.log('🔍 AuthProvider State:', { 
    initializing, 
    hasUser: !!user, 
    userFullName: user?.full_name,
    loading 
  });

  // Enhanced LoadingFallback with retry options
  if (initializing) {
    return (
      <LoadingFallback 
        message="Loading your profile..."
        onRetry={retryInitialization}
        onSkip={forceLoginScreen}
        showDiagnostics={true}
      />
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}