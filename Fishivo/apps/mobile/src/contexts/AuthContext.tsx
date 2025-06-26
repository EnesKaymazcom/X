import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '@fishivo/shared';
import { googleSignInService } from '@fishivo/shared';

interface User {
  id: string;
  email: string;
  fullName?: string;
  avatar?: string;
  username?: string;
  bio?: string;
  location?: string;
  [key: string]: any;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  const clearAuthError = () => {
    setAuthError(null);
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      // TODO: Implement login method in apiService
      throw new Error('Login method not implemented');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setAuthError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      const result = await googleSignInService.signIn();
      if (result.success && result.data) {
        setUser(result.data);
        await AsyncStorage.setItem('auth_token', result.data.token || '');
      } else {
        throw new Error(result.error || 'Google sign in failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign in failed';
      setAuthError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem('auth_token');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      // TODO: Implement updateProfile method in apiService
      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Profile update failed';
      setAuthError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        try {
          // TODO: Implement getProfile method in apiService
          // const response = await apiService.getProfile();
          // if (response.success && response.data) {
          //   setUser(response.data);
          // } else {
          //   throw new Error('Failed to get user data');
          // }
        } catch (error) {
          // Token geçersiz, temizle
          await AsyncStorage.removeItem('auth_token');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    authError,
    login,
    signInWithGoogle,
    logout,
    updateProfile,
    clearAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext, AuthProvider };