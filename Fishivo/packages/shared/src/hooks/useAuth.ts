// useAuth.ts - Authentication hook
// Adapted for TurboRepo structure

import { useState, useEffect, useCallback } from 'react';
import { databaseService } from '../services/databaseService';
import { googleSignInService } from '../services/googleSignInService';

// TODO: Import from types when available
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  });

  useEffect(() => {
    checkAuthStatus();
    
    // Listen for auth state changes
    const unsubscribe = databaseService.onAuthStateChange((user: any) => {
      setAuthState(prev => ({
        ...prev,
        user,
        isAuthenticated: !!user,
        isLoading: false,
        error: null
      }));
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const user = await databaseService.getCurrentUser();
      
      setAuthState({
        user,
        isAuthenticated: !!user,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Auth status check failed:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication check failed'
      });
    }
  };

  const signInWithGoogle = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await googleSignInService.signIn();
      
      if (result.success && result.data) {
        setAuthState({
          user: result.data,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return { success: true, user: result.data };
      } else {
        throw new Error(result.error || 'Google sign in failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google sign in failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await databaseService.signInWithEmail(email, password);
      
      if (result.success && result.user) {
        setAuthState({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return { success: true, user: result.user };
      } else {
        throw new Error(result.error || 'Email sign in failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email sign in failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, name?: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await databaseService.signUpWithEmail(email, password, name);
      
      if (result.success && result.user) {
        setAuthState({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return { success: true, user: result.user };
      } else {
        throw new Error(result.error || 'Email sign up failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email sign up failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await databaseService.signOut();
      await googleSignInService.signOut();
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      if (!authState.user) {
        throw new Error('No user logged in');
      }
      
      const result = await databaseService.updateUserProfile(authState.user.id, updates);
      
      if (result.success && result.user) {
        setAuthState(prev => ({
          ...prev,
          user: result.user,
          isLoading: false,
          error: null
        }));
        return { success: true, user: result.user };
      } else {
        throw new Error(result.error || 'Profile update failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, [authState.user]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, error: null }));
      
      const result = await databaseService.resetPassword(email);
      
      if (result.success) {
        return { success: true };
      } else {
        throw new Error(result.error || 'Password reset failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    error: authState.error,
    
    // Actions
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
    resetPassword,
    clearError,
    checkAuthStatus
  };
};

export default useAuth;