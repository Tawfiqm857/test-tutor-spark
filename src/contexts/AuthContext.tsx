import React, { createContext, useContext, useState, useEffect } from 'react';
import { backend as supabase } from '@/integrations/backend/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateAvatar: (avatar: string) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setLoading(true);
        
        if (session?.user) {
          // Get or create profile
          const profile = await getOrCreateProfile(session.user);
          setUser(profile);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const profile = await getOrCreateProfile(session.user);
        setUser(profile);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getOrCreateProfile = async (authUser: SupabaseUser): Promise<User> => {
    try {
      // Try to get existing profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (profile) {
        return {
          id: profile.user_id,
          name: profile.display_name || authUser.email || 'User',
          email: authUser.email || '',
          avatar: profile.avatar_url
        };
      }

      // Create new profile if doesn't exist
      const displayName = authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || 'User';
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: authUser.id,
          display_name: displayName
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating profile:', insertError);
        // Fallback to basic user data
        return {
          id: authUser.id,
          name: displayName,
          email: authUser.email || '',
        };
      }

      return {
        id: newProfile.user_id,
        name: newProfile.display_name || displayName,
        email: authUser.email || '',
        avatar: newProfile.avatar_url
      };
    } catch (error) {
      console.error('Error in getOrCreateProfile:', error);
      return {
        id: authUser.id,
        name: authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
      };
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: name
          }
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const updateAvatar = async (avatar: string) => {
    if (user && session?.user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: avatar })
          .eq('user_id', session.user.id);

        if (!error) {
          setUser({ ...user, avatar });
        }
      } catch (error) {
        console.error('Error updating avatar:', error);
      }
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateAvatar,
    isAuthenticated: !!session?.user,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};