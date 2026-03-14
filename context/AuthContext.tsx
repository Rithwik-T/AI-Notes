import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';
import { SplashScreen } from '../components/ui/SplashScreen';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const mapSessionToUser = (session: Session): User => {
    let plan = session.user.user_metadata?.plan || 'free';
    const trialEndsAt = session.user.user_metadata?.trialEndsAt;
    const hasHadTrial = session.user.user_metadata?.hasHadTrial || false;

    // Auto-downgrade trial if expired
    if (plan === 'trial' && trialEndsAt) {
      if (new Date() > new Date(trialEndsAt)) {
        plan = 'free';
        // We don't await this here to avoid blocking the render, 
        // but it will sync the DB for the next refresh
        supabase.auth.updateUser({ data: { plan: 'free' } });
      }
    }

    return {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
      avatarUrl: session.user.user_metadata?.avatar_url,
      plan,
      trialEndsAt,
      hasHadTrial
    };
  };

  useEffect(() => {
    // Get initial session
    const initSession = async () => {
      const startTime = Date.now();
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(mapSessionToUser(session));
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        const elapsed = Date.now() - startTime;
        const minDelay = 1500; // Show splash screen for at least 1.5s
        if (elapsed < minDelay) {
          setTimeout(() => setLoading(false), minDelay - elapsed);
        } else {
          setLoading(false);
        }
      }
    };

    initSession();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(mapSessionToUser(session));
      } else {
        setUser(null);
      }
      // Only set loading false if we aren't in the initial splash screen window
      // The initSession timeout will handle the initial loading state
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();
      if (session && user) {
        session.user = user;
        setUser(mapSessionToUser(session));
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, logout, refreshUser }}>
      {loading ? <SplashScreen /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};