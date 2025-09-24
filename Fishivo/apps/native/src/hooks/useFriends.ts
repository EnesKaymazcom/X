import { useState, useCallback, useEffect } from 'react'
import { createNativeApiService } from '@fishivo/api/services/native'
import type { FriendSuggestion, FriendRequest } from '@fishivo/api'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'

// Modal callback types
type ModalType = 'success' | 'error' | 'confirm' | 'delete'

interface ModalCallbacks {
  onShowSuccess?: (message: string) => void
  onShowError?: (message: string) => void
  onShowConfirm?: (title: string, message: string, onConfirm: () => void) => void
  onShowDelete?: (title: string, message: string, onConfirm: () => void) => void
}

interface UseFriendsReturn {
  // State
  suggestions: FriendSuggestion[]
  friendRequests: FriendRequest[]
  friends: FriendSuggestion[]
  isLoading: boolean
  error: string | null
  
  // Actions
  findSuggestions: () => Promise<void>
  sendFriendRequest: (userId: string, callbacks?: ModalCallbacks) => Promise<void>
  respondToRequest: (requestId: number, response: 'accepted' | 'rejected', callbacks?: ModalCallbacks) => Promise<void>
  unfriend: (friendId: string, callbacks?: ModalCallbacks) => Promise<void>
  blockUser: (userId: string, callbacks?: ModalCallbacks) => Promise<void>
  
  // Data refresh
  refreshData: () => Promise<void>
  
  // Counts
  getRequestCount: () => number
  getFriendsCount: () => number
  getSuggestionsCount: () => number
}

export const useFriends = (): UseFriendsReturn => {
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [friends, setFriends] = useState<FriendSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { user } = useSupabaseUser()
  const apiService = createNativeApiService()

  /**
   * Find friend suggestions
   */
  const findSuggestions = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      setError('Kullanıcı girişi gerekli')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const suggestions = await apiService.contacts.findFriendSuggestions(user.id, 20)
      setSuggestions(suggestions)
    } catch (error) {
      // Find suggestions error
      setError('Arkadaş önerileri yüklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  /**
   * Send friend request
   */
  const sendFriendRequest = useCallback(async (userId: string, callbacks?: ModalCallbacks): Promise<void> => {
    if (!user?.id) {
      setError('Kullanıcı girişi gerekli')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      await apiService.contacts.sendFriendRequest(user.id, userId)
      
      // Remove from suggestions
      setSuggestions(prev => prev.filter(s => s.user_id !== userId))
      
      callbacks?.onShowSuccess?.('Arkadaşlık isteğin başarıyla gönderildi.')
    } catch (error) {
      // Send friend request error
      setError('Arkadaşlık isteği gönderilirken hata oluştu')
      
      callbacks?.onShowError?.('Arkadaşlık isteği gönderilirken bir hata oluştu.')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  /**
   * Respond to friend request
   */
  const respondToRequest = useCallback(async (
    requestId: number, 
    response: 'accepted' | 'rejected',
    callbacks?: ModalCallbacks
  ): Promise<void> => {
    if (!user?.id) {
      setError('Kullanıcı girişi gerekli')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      await apiService.contacts.respondToFriendRequest(user.id, requestId, response)
      
      // Remove from requests
      const request = friendRequests.find(r => r.id === requestId)
      setFriendRequests(prev => prev.filter(r => r.id !== requestId))
      
      // If accepted, add to friends
      if (response === 'accepted' && request) {
        setFriends(prev => [...prev, {
          user_id: request.user_id,
          username: request.username,
          full_name: request.full_name,
          avatar_url: request.avatar_url,
          mutual_contacts: 0,
          is_following: false,
          suggestion_reason: 'contact'
        }])
      }
      
      const message = response === 'accepted' 
        ? 'Arkadaşlık isteği kabul edildi'
        : 'Arkadaşlık isteği reddedildi'
      
      callbacks?.onShowSuccess?.(message)
    } catch (error) {
      // Respond to request error
      setError('Arkadaşlık isteğine yanıt verilirken hata oluştu')
      
      callbacks?.onShowError?.('İsteğe yanıt verilirken bir hata oluştu.')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, friendRequests])

  /**
   * Unfriend a user
   */
  const unfriend = useCallback(async (friendId: string, callbacks?: ModalCallbacks): Promise<void> => {
    if (!user?.id) {
      setError('Kullanıcı girişi gerekli')
      return
    }

    try {
      // Show confirmation via callback
      const handleConfirm = async () => {
        try {
          setIsLoading(true)
          await apiService.contacts.unfriend(user.id, friendId)
          
          // Remove from friends list
          setFriends(prev => prev.filter(f => f.user_id !== friendId))
          
          callbacks?.onShowSuccess?.('Arkadaşlık başarıyla sonlandırıldı.')
        } catch (error) {
          // Unfriend error
          callbacks?.onShowError?.('Arkadaşlık sonlandırılırken bir hata oluştu.')
        } finally {
          setIsLoading(false)
        }
      }
      
      callbacks?.onShowDelete?.(
        'Arkadaşlığı Sonlandır',
        'Bu kişiyle arkadaşlığını sonlandırmak istediğinizden emin misiniz?',
        handleConfirm
      )
    } catch (error) {
      // Unfriend error
      setError('Arkadaşlık sonlandırılırken hata oluştu')
    }
  }, [user?.id])

  /**
   * Block a user
   */
  const blockUser = useCallback(async (userId: string, callbacks?: ModalCallbacks): Promise<void> => {
    if (!user?.id) {
      setError('Kullanıcı girişi gerekli')
      return
    }

    try {
      // Show confirmation via callback
      const handleConfirm = async () => {
        try {
          setIsLoading(true)
          await apiService.contacts.blockUser(user.id, userId)
          
          // Remove from all lists
          setFriends(prev => prev.filter(f => f.user_id !== userId))
          setSuggestions(prev => prev.filter(s => s.user_id !== userId))
          setFriendRequests(prev => prev.filter(r => r.user_id !== userId))
          
          callbacks?.onShowSuccess?.('Kullanıcı başarıyla engellendi.')
        } catch (error) {
          // Block user error
          callbacks?.onShowError?.('Kullanıcı engellenirken bir hata oluştu.')
        } finally {
          setIsLoading(false)
        }
      }
      
      callbacks?.onShowConfirm?.(
        'Kullanıcıyı Engelle',
        'Bu kullanıcıyı engellemek istediğinizden emin misiniz? Engellenmiş kullanıcılar size mesaj gönderemez ve arkadaşlık isteği yollayamaz.',
        handleConfirm
      )
    } catch (error) {
      // Block user error
      setError('Kullanıcı engellenirken hata oluştu')
    }
  }, [user?.id])

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async (): Promise<void> => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      setError(null)

      // Check if contacts service is available
      if (!apiService.contacts) {
        // Contacts service not available
        setError('Servis kullanılamıyor')
        return
      }

      const [suggestionsData, requestsData, friendsData] = await Promise.all([
        apiService.contacts.findFriendSuggestions(user.id, 20),
        apiService.contacts.getFriendRequests(user.id),
        apiService.contacts.getFriends(user.id)
      ])

      setSuggestions(suggestionsData)
      setFriendRequests(requestsData)
      setFriends(friendsData)
    } catch (error) {
      // Refresh data error
      setError('Veri yenilenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  /**
   * Get counts
   */
  const getRequestCount = useCallback((): number => friendRequests.length, [friendRequests])
  const getFriendsCount = useCallback((): number => friends.length, [friends])
  const getSuggestionsCount = useCallback((): number => suggestions.length, [suggestions])

  // Auto-refresh on user change
  useEffect(() => {
    if (user?.id) {
      refreshData()
    }
  }, [user?.id, refreshData])

  return {
    // State
    suggestions,
    friendRequests,
    friends,
    isLoading,
    error,
    
    // Actions
    findSuggestions,
    sendFriendRequest,
    respondToRequest,
    unfriend,
    blockUser,
    
    // Data refresh
    refreshData,
    
    // Counts
    getRequestCount,
    getFriendsCount,
    getSuggestionsCount
  }
}

export default useFriends