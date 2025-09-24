import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeUserProfile } from '@fishivo/api';

interface ProfileState {
  profiles: Map<string, {
    data: NativeUserProfile;
    lastUpdated: number;
  }>;
  currentUserProfile: NativeUserProfile | null;
  profileChangedFlags: Map<string, boolean>;
  deletedPostIds: Set<string>;
  isStale: (userId: string, maxAge?: number) => boolean;
  setProfile: (userId: string, profile: NativeUserProfile) => void;
  setCurrentUserProfile: (profile: NativeUserProfile) => void;
  getProfile: (userId: string) => NativeUserProfile | null;
  clearProfile: (userId: string) => void;
  clearAllProfiles: () => void;
  hasProfileChanged: (userId: string) => boolean;
  markProfileAsChanged: (userId: string) => void;
  markProfileAsRefreshed: (userId: string) => void;
  markPostDeleted: (userId: string) => void;
  markPostAsDeleted: (postId: string) => void;
  isPostDeleted: (postId: string) => boolean;
  clearDeletedPost: (postId: string) => void;
  clearAllDeletedPosts: () => void;
}

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: new Map(),
      currentUserProfile: null,
      profileChangedFlags: new Map(),
      deletedPostIds: new Set(),

      isStale: (userId: string, maxAge: number = STALE_TIME) => {
        const profiles = get().profiles;
        const profile = profiles.get(userId);
        if (!profile) return true;
        
        const now = Date.now();
        return now - profile.lastUpdated > maxAge;
      },

      setProfile: (userId: string, profile: NativeUserProfile) => {
        set((state) => {
          const newProfiles = new Map(state.profiles);
          newProfiles.set(userId, {
            data: profile,
            lastUpdated: Date.now()
          });
          
          // If this is the current user, update currentUserProfile too
          const currentProfile = state.currentUserProfile;
          if (currentProfile && currentProfile.id === userId) {
            return {
              profiles: newProfiles,
              currentUserProfile: profile
            };
          }
          
          return { profiles: newProfiles };
        });
      },

      setCurrentUserProfile: (profile: NativeUserProfile) => {
        set((state) => {
          const newProfiles = new Map(state.profiles);
          newProfiles.set(profile.id, {
            data: profile,
            lastUpdated: Date.now()
          });
          
          return {
            profiles: newProfiles,
            currentUserProfile: profile
          };
        });
      },

      getProfile: (userId: string) => {
        const profiles = get().profiles;
        const profile = profiles.get(userId);
        return profile?.data || null;
      },

      clearProfile: (userId: string) => {
        set((state) => {
          const newProfiles = new Map(state.profiles);
          newProfiles.delete(userId);
          
          // If clearing current user, also clear currentUserProfile
          if (state.currentUserProfile?.id === userId) {
            return {
              profiles: newProfiles,
              currentUserProfile: null
            };
          }
          
          return { profiles: newProfiles };
        });
      },

      clearAllProfiles: () => {
        set({ 
          profiles: new Map(),
          currentUserProfile: null,
          profileChangedFlags: new Map()
        });
      },

      hasProfileChanged: (userId: string) => {
        const flags = get().profileChangedFlags;
        return flags.get(userId) === true;
      },

      markProfileAsChanged: (userId: string) => {
        set((state) => {
          const newFlags = new Map(state.profileChangedFlags);
          newFlags.set(userId, true);
          return { profileChangedFlags: newFlags };
        });
      },

      markProfileAsRefreshed: (userId: string) => {
        set((state) => {
          const newFlags = new Map(state.profileChangedFlags);
          newFlags.delete(userId);
          return { profileChangedFlags: newFlags };
        });
      },

      markPostDeleted: (userId: string) => {
        set((state) => {
          const newFlags = new Map(state.profileChangedFlags);
          newFlags.set(userId, true);
          return { profileChangedFlags: newFlags };
        });
      },

      markPostAsDeleted: (postId: string) => {
        set((state) => {
          const newDeletedIds = new Set(state.deletedPostIds);
          newDeletedIds.add(postId);
          return { deletedPostIds: newDeletedIds };
        });
      },

      isPostDeleted: (postId: string) => {
        const deletedIds = get().deletedPostIds;
        // Defensive check to ensure deletedIds is a Set
        if (!deletedIds || typeof deletedIds.has !== 'function') {
          return false;
        }
        return deletedIds.has(postId);
      },

      clearDeletedPost: (postId: string) => {
        set((state) => {
          const newDeletedIds = new Set(state.deletedPostIds);
          newDeletedIds.delete(postId);
          return { deletedPostIds: newDeletedIds };
        });
      },

      clearAllDeletedPosts: () => {
        set({ deletedPostIds: new Set() });
      }
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentUserProfile: state.currentUserProfile,
        // Convert Map to array for serialization
        profiles: Array.from(state.profiles.entries()).slice(0, 10), // Keep only last 10 profiles
        // Convert Set to array for serialization
        deletedPostIds: Array.from(state.deletedPostIds)
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (Array.isArray(state.profiles)) {
            // Convert array back to Map
            state.profiles = new Map(state.profiles);
          } else if (!state.profiles) {
            state.profiles = new Map();
          }
          
          if (Array.isArray(state.deletedPostIds)) {
            // Convert array back to Set
            state.deletedPostIds = new Set(state.deletedPostIds);
          } else if (!state.deletedPostIds) {
            state.deletedPostIds = new Set();
          }
          
          // Ensure profileChangedFlags is initialized
          if (!state.profileChangedFlags) {
            state.profileChangedFlags = new Map();
          }
        }
      }
    }
  )
);