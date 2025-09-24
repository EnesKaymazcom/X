import { useState, useEffect, useCallback } from 'react'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import { followService } from '@fishivo/api'
import { useSupabaseUser } from './useSupabaseUser'
import { useFollowStore } from '@/stores/followStore'

interface UseFollowOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
  enableHaptic?: boolean
}

export function useFollow(targetUserId: string, options: UseFollowOptions = {}) {
  const { user: currentUser } = useSupabaseUser()
  const [isLoading, setIsLoading] = useState(false)
  
  // Use global store as single source of truth
  const { 
    getFollowStatus, 
    getUserStats, 
    followUser,
    unfollowUser,
    updateUserStats
  } = useFollowStore()

  // Get follow status from global store
  const isFollowing = currentUser?.id ? 
    getFollowStatus(currentUser.id, targetUserId) ?? false : false
  
  // Get followers count from global store
  const userStats = getUserStats(targetUserId)
  const followersCount = userStats?.followers_count ?? 0

  // Initialize follow status if not cached
  useEffect(() => {
    if (!currentUser?.id || !targetUserId) return

    const initializeFollowStatus = async () => {
      const cachedStatus = getFollowStatus(currentUser.id, targetUserId)
      if (cachedStatus === undefined) {
        try {
          // Direct check and update store
          const isFollowing = await followService.isFollowing(currentUser.id, targetUserId)
          // Update store with the result
          const { followStates } = useFollowStore.getState()
          const key = `${currentUser.id}:${targetUserId}`
          const newFollowStates = new Map(followStates)
          newFollowStates.set(key, {
            userId: targetUserId,
            isFollowing,
            lastUpdated: Date.now()
          })
          useFollowStore.setState({ followStates: newFollowStates })
        } catch (error) {
          // Silent fail - will retry on next interaction
        }
      }
    }

    initializeFollowStatus()
  }, [currentUser?.id, targetUserId, getFollowStatus])

  // Toggle follow - simplified single path
  const toggleFollow = useCallback(async () => {
    if (!currentUser?.id || !targetUserId || isLoading) return
    
    // Haptic feedback - sadece açık açık istenirse çalışır
    if (options.enableHaptic === true) {
      ReactNativeHapticFeedback.trigger('impactLight', {
        enableVibrateFallback: false,
        ignoreAndroidSystemSettings: false
      })
    }

    setIsLoading(true)

    try {
      let result
      if (isFollowing) {
        result = await unfollowUser(currentUser.id, targetUserId)
      } else {
        result = await followUser(currentUser.id, targetUserId)
      }

      if (!result.success) {
        if (result.error === 'rate_limit_exceeded') {
          options.onError?.('Çok fazla takip işlemi yaptınız. Lütfen biraz bekleyin.')
        } else if (result.error === 'user_blocked') {
          options.onError?.('Bu kullanıcı engellenmiş.')
        } else if (result.error === 'cannot_follow_self') {
          options.onError?.('Kendinizi takip edemezsiniz.')
        } else {
          options.onError?.(result.error || 'Bir hata oluştu')
        }
      } else {
        options.onSuccess?.()
      }
    } catch (error) {
      options.onError?.('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }, [currentUser?.id, targetUserId, isFollowing, isLoading, options, followUser, unfollowUser])

  // Check if can follow
  const canFollow = !isLoading && currentUser?.id && targetUserId && currentUser.id !== targetUserId

  // Helper function to set followers count - no useCallback needed since it's just a wrapper
  const setFollowersCount = (value: number | ((prev: number) => number)) => {
    const currentCount = typeof value === 'function' ? value(followersCount) : value
    updateUserStats(targetUserId, { followers_count: currentCount })
  }

  return {
    isFollowing,
    isLoading,
    followersCount,
    setFollowersCount,
    toggleFollow,
    canFollow
  }
}