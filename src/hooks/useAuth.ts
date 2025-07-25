import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  role: 'super-user' | 'guest';
  created_at: string;
  updated_at: string;
}
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error - this is expected for new users
        console.error('Error fetching user profile:', error);
        return null;
      }

      // If no profile exists, create one with default role
      if (!data) {
        const { data: newProfile, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: userId,
              email: '', // Will be updated by trigger
              role: 'guest' // Default role
            }
          ])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating user profile:', insertError);
          return null;
        }

        return newProfile;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get current session and user profile
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setUserProfile(null);
    return { error };
  };

  const updateUserRole = async (role: 'super-user' | 'guest') => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { data, error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { error };
      }

      setUserProfile(data);
      return { data, error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const isSuperUser = userProfile?.role === 'super-user';
  const isGuest = userProfile?.role === 'guest';

  return {
    user,
    session,
    userProfile,
    loading,
    isSuperUser,
    isGuest,
    signUp,
    signIn,
    signOut,
    updateUserRole,
  };
}