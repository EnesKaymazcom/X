import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { followService } from '@fishivo/api'

interface FollowState {
  userId: string
  isFollowing: boolean
  lastUpdated: number
}

interface CachedFollowState extends FollowState {}
interface CachedUserStats extends UserStats {
  lastUpdated: number
}

interface UserStats {
  followers_count: number
  following_count: number
  lastUpdated: number
}

interface FollowStore {
  // State
  followStates: Map<string, FollowState>
  userStats: Map<string, UserStats>
  subscriptions: Map<string, any>
  isInitialized: boolean
  cleanupIntervalId?: NodeJS.Timeout
  
  // Actions
  followUser: (currentUserId: string, targetUserId: string) => Promise<{ success: boolean; error?: string }>
  unfollowUser: (currentUserId: string, targetUserId: string) => Promise<{ success: boolean; error?: string }>
  getFollowStatus: (currentUserId: string, targetUserId: string) => boolean | undefined
  getUserStats: (userId: string) => UserStats | undefined
  updateUserStats: (userId: string, stats: Partial<UserStats>) => void
  
  // Real-time subscriptions
  subscribeToUser: (userId: string, callback?: (event: any) => void) => void
  unsubscribeFromUser: (userId: string) => void
  unsubscribeAll: () => void
  
  // Cache management
  invalidateFollowStatus: (currentUserId: string, targetUserId: string) => void
  invalidateUserStats: (userId: string) => void
  clearExpiredCache: () => void
  
  // Initialization
  initialize: () => void
  cleanup: () => void
}

const CACHE_TTL = 5 * 60 * 1000 // 5 dakika
const STATS_CACHE_TTL = 10 * 60 * 1000 // 10 dakika

export const useFollowStore = create<FollowStore>()(
  persist(
    (set, get) => ({
      followStates: new Map(),
      userStats: new Map(),
      subscriptions: new Map(),
      isInitialized: false,

      followUser: async (currentUserId: string, targetUserId: string) => {
        const store = get()
        const key = `${currentUserId}:${targetUserId}`
        
        // Optimistic update
        const newFollowStates = new Map(store.followStates)
        newFollowStates.set(key, {
          userId: targetUserId,
          isFollowing: true,
          lastUpdated: Date.now()
        })
        
        // Update both users' stats optimistically
        const newUserStats = new Map(store.userStats)
        
        // Update target user's followers count
        const targetStats = store.userStats.get(targetUserId)
        if (targetStats) {
          newUserStats.set(targetUserId, {
            ...targetStats,
            followers_count: targetStats.followers_count + 1,
            lastUpdated: Date.now()
          })
        }
        
        // Update current user's following count
        const currentUserStats = store.userStats.get(currentUserId)
        if (currentUserStats) {
          newUserStats.set(currentUserId, {
            ...currentUserStats,
            following_count: currentUserStats.following_count + 1,
            lastUpdated: Date.now()
          })
        }
        
        set({ followStates: newFollowStates, userStats: newUserStats })
        
        try {
          const result = await followService.followUser(currentUserId, targetUserId)
          
          if (!result.success) {
            // Rollback optimistic update
            const rollbackFollowStates = new Map(get().followStates)
            rollbackFollowStates.set(key, {
              userId: targetUserId,
              isFollowing: false,
              lastUpdated: Date.now()
            })
            
            const rollbackUserStats = new Map(get().userStats)
            
            // Rollback target user stats
            if (targetStats) {
              rollbackUserStats.set(targetUserId, {
                ...targetStats,
                followers_count: Math.max(0, targetStats.followers_count - 1),
                lastUpdated: Date.now()
              })
            }
            
            // Rollback current user stats
            if (currentUserStats) {
              rollbackUserStats.set(currentUserId, {
                ...currentUserStats,
                following_count: Math.max(0, currentUserStats.following_count - 1),
                lastUpdated: Date.now()
              })
            }
            
            set({ followStates: rollbackFollowStates, userStats: rollbackUserStats })
          }
          
          return result
        } catch (error: any) {
          // Rollback on error
          const rollbackFollowStates = new Map(get().followStates)
          rollbackFollowStates.set(key, {
            userId: targetUserId,
            isFollowing: false,
            lastUpdated: Date.now()
          })
          
          const rollbackUserStats = new Map(get().userStats)
          
          // Rollback target user stats
          if (targetStats) {
            rollbackUserStats.set(targetUserId, {
              ...targetStats,
              followers_count: Math.max(0, targetStats.followers_count - 1),
              lastUpdated: Date.now()
            })
          }
          
          // Rollback current user stats
          if (currentUserStats) {
            rollbackUserStats.set(currentUserId, {
              ...currentUserStats,
              following_count: Math.max(0, currentUserStats.following_count - 1),
              lastUpdated: Date.now()
            })
          }
          
          set({ followStates: rollbackFollowStates, userStats: rollbackUserStats })
          return { success: false, error: error.message }
        }
      },

      unfollowUser: async (currentUserId: string, targetUserId: string) => {
        const store = get()
        const key = `${currentUserId}:${targetUserId}`
        
        // Optimistic update
        const newFollowStates = new Map(store.followStates)
        newFollowStates.set(key, {
          userId: targetUserId,
          isFollowing: false,
          lastUpdated: Date.now()
        })
        
        // Update both users' stats optimistically
        const newUserStats = new Map(store.userStats)
        
        // Update target user's followers count
        const targetStats = store.userStats.get(targetUserId)
        if (targetStats) {
          newUserStats.set(targetUserId, {
            ...targetStats,
            followers_count: Math.max(0, targetStats.followers_count - 1),
            lastUpdated: Date.now()
          })
        }
        
        // Update current user's following count
        const currentUserStats = store.userStats.get(currentUserId)
        if (currentUserStats) {
          newUserStats.set(currentUserId, {
            ...currentUserStats,
            following_count: Math.max(0, currentUserStats.following_count - 1),
            lastUpdated: Date.now()
          })
        }
        
        set({ followStates: newFollowStates, userStats: newUserStats })
        
        try {
          const result = await followService.unfollowUser(currentUserId, targetUserId)
          
          if (!result.success) {
            // Rollback optimistic update
            const rollbackFollowStates = new Map(get().followStates)
            rollbackFollowStates.set(key, {
              userId: targetUserId,
              isFollowing: true,
              lastUpdated: Date.now()
            })
            
            const rollbackUserStats = new Map(get().userStats)
            
            // Rollback target user stats
            if (targetStats) {
              rollbackUserStats.set(targetUserId, {
                ...targetStats,
                followers_count: targetStats.followers_count + 1,
                lastUpdated: Date.now()
              })
            }
            
            // Rollback current user stats
            if (currentUserStats) {
              rollbackUserStats.set(currentUserId, {
                ...currentUserStats,
                following_count: currentUserStats.following_count + 1,
                lastUpdated: Date.now()
              })
            }
            
            set({ followStates: rollbackFollowStates, userStats: rollbackUserStats })
          }
          
          return result
        } catch (error: any) {
          // Rollback on error
          const rollbackFollowStates = new Map(get().followStates)
          rollbackFollowStates.set(key, {
            userId: targetUserId,
            isFollowing: true,
            lastUpdated: Date.now()
          })
          
          const rollbackUserStats = new Map(get().userStats)
          
          // Rollback target user stats
          if (targetStats) {
            rollbackUserStats.set(targetUserId, {
              ...targetStats,
              followers_count: targetStats.followers_count + 1,
              lastUpdated: Date.now()
            })
          }
          
          // Rollback current user stats
          if (currentUserStats) {
            rollbackUserStats.set(currentUserId, {
              ...currentUserStats,
              following_count: currentUserStats.following_count + 1,
              lastUpdated: Date.now()
            })
          }
          
          set({ followStates: rollbackFollowStates, userStats: rollbackUserStats })
          return { success: false, error: error.message }
        }
      },

      getFollowStatus: (currentUserId: string, targetUserId: string) => {
        const key = `${currentUserId}:${targetUserId}`
        const state = get().followStates.get(key)
        
        if (!state) return undefined
        
        // Check if cache is expired
        if (Date.now() - state.lastUpdated > CACHE_TTL) {
          return undefined
        }
        
        return state.isFollowing
      },

      getUserStats: (userId: string) => {
        const stats = get().userStats.get(userId)
        
        if (!stats) return undefined
        
        // Check if cache is expired
        if (Date.now() - stats.lastUpdated > STATS_CACHE_TTL) {
          return undefined
        }
        
        return stats
      },

      updateUserStats: (userId: string, stats: Partial<UserStats>) => {
        const store = get()
        const currentStats = store.userStats.get(userId)
        const newUserStats = new Map(store.userStats)
        
        newUserStats.set(userId, {
          followers_count: currentStats?.followers_count || 0,
          following_count: currentStats?.following_count || 0,
          ...stats,
          lastUpdated: Date.now()
        })
        
        set({ userStats: newUserStats })
      },

      subscribeToUser: (userId: string, callback?: (event: any) => void) => {
        const store = get()
        
        // Check if already subscribed
        if (store.subscriptions.has(userId)) {
          return
        }
        
        const channel = followService.subscribeToFollowEvents(userId, (event: any) => {
          // Update global state based on event
          if (event.type === 'followers') {
            if (event.eventType === 'INSERT') {
              // Someone followed this user
              const followerId = event.new?.follower_id
              if (followerId) {
                const key = `${followerId}:${userId}`
                const newFollowStates = new Map(get().followStates)
                newFollowStates.set(key, {
                  userId: userId,
                  isFollowing: true,
                  lastUpdated: Date.now()
                })
                set({ followStates: newFollowStates })
                
                // Don't update stats here - DB already updated them
              }
            } else if (event.eventType === 'DELETE') {
              // Someone unfollowed this user
              const followerId = event.old?.follower_id
              if (followerId) {
                const key = `${followerId}:${userId}`
                const newFollowStates = new Map(get().followStates)
                newFollowStates.set(key, {
                  userId: userId,
                  isFollowing: false,
                  lastUpdated: Date.now()
                })
                set({ followStates: newFollowStates })
                
                // Don't update stats here - DB already updated them
              }
            }
          }
          
          // Call external callback if provided
          callback?.(event)
        })
        
        const newSubscriptions = new Map(store.subscriptions)
        newSubscriptions.set(userId, channel)
        set({ subscriptions: newSubscriptions })
      },

      unsubscribeFromUser: (userId: string) => {
        const store = get()
        const channel = store.subscriptions.get(userId)
        
        if (channel) {
          followService.unsubscribeFromFollowEvents(channel)
          const newSubscriptions = new Map(store.subscriptions)
          newSubscriptions.delete(userId)
          set({ subscriptions: newSubscriptions })
        }
      },

      unsubscribeAll: () => {
        const store = get()
        
        for (const [, channel] of store.subscriptions.entries()) {
          followService.unsubscribeFromFollowEvents(channel)
        }
        
        set({ subscriptions: new Map() })
      },

      invalidateFollowStatus: (currentUserId: string, targetUserId: string) => {
        const key = `${currentUserId}:${targetUserId}`
        const newFollowStates = new Map(get().followStates)
        newFollowStates.delete(key)
        set({ followStates: newFollowStates })
      },

      invalidateUserStats: (userId: string) => {
        const newUserStats = new Map(get().userStats)
        newUserStats.delete(userId)
        set({ userStats: newUserStats })
      },

      clearExpiredCache: () => {
        const now = Date.now()
        const store = get()
        
        // Clear expired follow states
        const newFollowStates = new Map(store.followStates)
        for (const [key, state] of newFollowStates.entries()) {
          if (now - (state as CachedFollowState).lastUpdated > CACHE_TTL) {
            newFollowStates.delete(key)
          }
        }
        
        // Clear expired user stats
        const newUserStats = new Map(store.userStats)
        for (const [key, stats] of newUserStats.entries()) {
          if (now - (stats as CachedUserStats).lastUpdated > STATS_CACHE_TTL) {
            newUserStats.delete(key)
          }
        }
        
        set({ 
          followStates: newFollowStates,
          userStats: newUserStats
        })
      },

      initialize: () => {
        if (get().isInitialized) return
        
        // Clear expired cache on startup
        get().clearExpiredCache()
        
        // Set up periodic cache cleanup with cleanup on unmount
        const intervalId = setInterval(() => {
          get().clearExpiredCache()
        }, 5 * 60000) // Every 5 minutes instead of 1 minute for better performance
        
        set({ isInitialized: true, cleanupIntervalId: intervalId })
      },

      cleanup: () => {
        const { cleanupIntervalId } = get()
        if (cleanupIntervalId) {
          clearInterval(cleanupIntervalId)
        }
        get().unsubscribeAll()
        set({ isInitialized: false, cleanupIntervalId: undefined })
      }
    }),
    {
      name: 'follow-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Convert Maps to arrays for serialization
        followStates: state.followStates instanceof Map ? Array.from(state.followStates.entries()) : [],
        userStats: state.userStats instanceof Map ? Array.from(state.userStats.entries()) : []
      }),
      onRehydrateStorage: () => (state: FollowStore | undefined) => {
        if (state) {
          // Convert arrays back to Maps safely
          const followStatesArray = Array.isArray(state.followStates) ? state.followStates : []
          const userStatsArray = Array.isArray(state.userStats) ? state.userStats : []
          
          state.followStates = new Map(followStatesArray)
          state.userStats = new Map(userStatsArray)
          state.subscriptions = new Map()
          state.isInitialized = false
        }
      }
    }
  )
)