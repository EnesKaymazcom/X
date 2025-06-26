import React, { createContext, useContext, useState, ReactNode } from 'react';
import { apiService } from '@fishivo/shared';

interface FollowContextValue {
  followMap: Record<string, boolean>;
  pendingMap: Record<string, boolean>;
  isFollowing: (userId: string) => boolean;
  isPending: (userId: string) => boolean;
  follow: (userId: string) => Promise<void>;
  unfollow: (userId: string) => Promise<void>;
  refreshStatus: (userId: string) => Promise<void>;
}

const FollowContext = createContext<FollowContextValue | undefined>(undefined);

export const FollowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [followMap, setFollowMap] = useState<Record<string, boolean>>({});
  const [pendingMap, setPendingMap] = useState<Record<string, boolean>>({});

  const isFollowing = (userId: string) => !!followMap[userId];
  const isPending = (userId: string) => !!pendingMap[userId];

  const follow = async (userId: string) => {
    if (isPending(userId)) return;
    setPendingMap(prev=>({...prev,[userId]:true}));
    try {
      await apiService.followUser(userId);
      setFollowMap(prev => ({ ...prev, [userId]: true }));
    } catch (error) {
      const msg = error instanceof Error ? error.message : '';
      if (msg.includes('already following')) {
        setFollowMap(prev => ({ ...prev, [userId]: true }));
      } else {
        throw error;
      }
    }
    setPendingMap(prev=>({...prev,[userId]:false}));
  };

  const unfollow = async (userId: string) => {
    if (isPending(userId)) return;
    setPendingMap(prev=>({...prev,[userId]:true}));
    try {
      await apiService.unfollowUser(userId);
      setFollowMap(prev => ({ ...prev, [userId]: false }));
    } catch (error) {
      const msg = error instanceof Error ? error.message : '';
      if (msg.includes('not following')) {
        setFollowMap(prev => ({ ...prev, [userId]: false }));
      } else {
        throw error;
      }
    }
    setPendingMap(prev=>({...prev,[userId]:false}));
  };

  const refreshStatus = async (userId: string) => {
    const status = await apiService.isFollowing(userId);
    setFollowMap(prev => ({ ...prev, [userId]: status }));
  };

  const value: FollowContextValue = { followMap, pendingMap, isFollowing, isPending, follow, unfollow, refreshStatus };

  return <FollowContext.Provider value={value}>{children}</FollowContext.Provider>;
};

export const useFollow = () => {
  const ctx = useContext(FollowContext);
  if (!ctx) throw new Error('useFollow must be used within FollowProvider');
  return ctx;
};
