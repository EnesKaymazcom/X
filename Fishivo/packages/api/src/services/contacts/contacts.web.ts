import crypto from 'crypto'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@fishivo/api/client/supabase.server'
import type { 
  Contact, 
  ContactHash, 
  UserContact, 
  FriendSuggestion, 
  Friendship, 
  FriendRequest,
  ContactsService 
} from './types'

export class WebContactsService implements ContactsService {
  
  /**
   * Hash phone numbers for privacy-first storage
   */
  hashPhoneNumbers(phones: string[]): ContactHash[] {
    return phones.map(phone => {
      // Normalize phone number (remove spaces, dashes, parentheses)
      const normalized = phone.replace(/[\s\-\(\)]/g, '')
      
      // Create SHA-256 hash
      const hash = crypto.createHash('sha256').update(normalized).digest('hex')
      
      return {
        phone_hash: hash,
        original_phone: process.env.NODE_ENV === 'development' ? normalized : undefined
      }
    })
  }

  /**
   * Sync user's contacts to database
   */
  async syncUserContacts(userId: string, contacts: Contact[]): Promise<void> {
    const supabase = createSupabaseAdminClient()
    
    // Hash all phone numbers
    const phoneHashes = this.hashPhoneNumbers(contacts.map(c => c.phone))
    
    try {
      // First, delete existing contacts for this user
      await supabase
        .from('user_contacts')
        .delete()
        .eq('user_id', userId)
      
      // Insert new contacts
      if (phoneHashes.length > 0) {
        const contactRecords = phoneHashes.map(hash => ({
          user_id: userId,
          phone_hash: hash.phone_hash
        }))
        
        const { error } = await supabase
          .from('user_contacts')
          .insert(contactRecords)
        
        if (error) {
          throw new Error(`Failed to sync contacts: ${error.message}`)
        }
      }
    } catch (error) {
      console.error('Error syncing user contacts:', error)
      throw error
    }
  }

  /**
   * Get user's synced contacts
   */
  async getUserContacts(userId: string): Promise<UserContact[]> {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('user_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      throw new Error(`Failed to get user contacts: ${error.message}`)
    }
    
    return data || []
  }

  /**
   * Delete all user contacts
   */
  async deleteUserContacts(userId: string): Promise<void> {
    const supabase = await createSupabaseServerClient()
    
    const { error } = await supabase
      .from('user_contacts')
      .delete()
      .eq('user_id', userId)
    
    if (error) {
      throw new Error(`Failed to delete user contacts: ${error.message}`)
    }
  }

  /**
   * Find friend suggestions based on various factors
   */
  async findFriendSuggestions(userId: string, limit = 20): Promise<FriendSuggestion[]> {
    const contactFriends = await this.findContactFriends(userId)
    const locationFriends = await this.findLocationBasedFriends(userId)
    const interestFriends = await this.findInterestBasedFriends(userId)
    
    // Combine and deduplicate suggestions
    const allSuggestions = [...contactFriends, ...locationFriends, ...interestFriends]
    const uniqueSuggestions = this.deduplicateSuggestions(allSuggestions)
    
    // Sort by priority (contacts > location > interests) and limit
    return uniqueSuggestions
      .sort((a, b) => {
        const priority = { contact: 3, location: 2, interest: 1, mutual_friends: 1 }
        return priority[b.suggestion_reason] - priority[a.suggestion_reason]
      })
      .slice(0, limit)
  }

  /**
   * Find friends through contact matching
   */
  async findContactFriends(userId: string): Promise<FriendSuggestion[]> {
    const supabase = createSupabaseAdminClient()
    
    // Get user's phone hash (if they opted in)
    const { data: currentUser } = await supabase
      .from('users')
      .select('phone, privacy_settings')
      .eq('id', userId)
      .single()
    
    if (!currentUser?.phone || !currentUser.privacy_settings?.phone_discoverable) {
      return []
    }
    
    const userPhoneHash = this.hashPhoneNumbers([currentUser.phone])[0].phone_hash
    
    // Find users who have this phone number in their contacts
    // AND who have made their phone discoverable
    const { data: suggestions, error } = await supabase
      .from('user_contacts')
      .select(`
        user_id,
        users!inner(
          id,
          username,
          full_name,
          avatar_url,
          privacy_settings,
          phone
        )
      `)
      .eq('phone_hash', userPhoneHash)
      .neq('user_id', userId)
    
    if (error) {
      console.error('Error finding contact friends:', error)
      return []
    }
    
    // Filter users who allow contact discovery and check friendship status
    const friendSuggestions: FriendSuggestion[] = []
    
    for (const suggestion of suggestions || []) {
      const userData = (suggestion as any).users
      
      // Check privacy settings
      if (!userData?.privacy_settings?.contact_discovery) {
        continue
      }
      
      // Check if already friends or has pending request
      const friendshipStatus = await this.getFriendshipStatus(userId, userData.id)
      if (friendshipStatus !== 'none') {
        continue
      }
      
      friendSuggestions.push({
        user_id: userData.id,
        username: userData.username,
        full_name: userData.full_name,
        avatar_url: userData.avatar_url,
        mutual_contacts: 1, // They have each other's numbers
        is_following: false,
        suggestion_reason: 'contact'
      })
    }
    
    return friendSuggestions
  }

  /**
   * Find location-based friends
   */
  private async findLocationBasedFriends(userId: string): Promise<FriendSuggestion[]> {
    const supabase = createSupabaseAdminClient()
    
    // Get user's location from their recent posts or profile
    const { data: userPosts } = await supabase
      .from('posts')
      .select('latitude, longitude')
      .eq('user_id', userId)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (!userPosts || userPosts.length === 0) {
      return []
    }
    
    // Find users who posted nearby (within ~10km)
    const suggestions: FriendSuggestion[] = []
    
    for (const post of userPosts) {
      const { data: nearbyUsers } = await supabase.rpc('find_nearby_users', {
        target_lat: post.latitude,
        target_lng: post.longitude,
        radius_km: 10,
        exclude_user_id: userId,
        limit_count: 5
      })
      
      // This would need a custom RPC function - simplified for now
      // Just return empty array as location matching is complex
    }
    
    return []
  }

  /**
   * Find interest-based friends
   */
  private async findInterestBasedFriends(userId: string): Promise<FriendSuggestion[]> {
    // This would analyze user's posts, liked species, equipment, etc.
    // Simplified for now
    return []
  }

  /**
   * Send friend request
   */
  async sendFriendRequest(fromUserId: string, toUserId: string): Promise<Friendship> {
    const supabase = await createSupabaseServerClient()
    
    // Normalize user IDs (user1_id should always be < user2_id)
    const [user1_id, user2_id] = fromUserId < toUserId ? [fromUserId, toUserId] : [toUserId, fromUserId]
    
    const { data, error } = await supabase
      .from('friendships')
      .insert({
        user1_id,
        user2_id,
        status: 'pending',
        requested_by: fromUserId
      })
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to send friend request: ${error.message}`)
    }
    
    return data
  }

  /**
   * Respond to friend request
   */
  async respondToFriendRequest(userId: string, friendshipId: number, response: 'accepted' | 'rejected'): Promise<Friendship> {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('friendships')
      .update({ 
        status: response,
        updated_at: new Date().toISOString()
      })
      .eq('id', friendshipId)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to respond to friend request: ${error.message}`)
    }
    
    return data
  }

  /**
   * Get pending friend requests for user
   */
  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        status,
        requested_by,
        created_at,
        user1_id,
        user2_id,
        requester:users!requested_by(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('status', 'pending')
      .neq('requested_by', userId) // Don't show requests I sent
    
    if (error) {
      throw new Error(`Failed to get friend requests: ${error.message}`)
    }
    
    return (data || []).map(friendship => {
      const requesterData = (friendship as any).requester;
      return {
        id: friendship.id,
        user_id: requesterData.id,
        username: requesterData.username,
        full_name: requesterData.full_name,
        avatar_url: requesterData.avatar_url,
        status: 'pending' as const,
        created_at: friendship.created_at
      };
    })
  }

  /**
   * Get user's friends
   */
  async getFriends(userId: string): Promise<FriendSuggestion[]> {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        user1_id,
        user2_id,
        user1:users!user1_id(id, username, full_name, avatar_url),
        user2:users!user2_id(id, username, full_name, avatar_url)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('status', 'accepted')
    
    if (error) {
      throw new Error(`Failed to get friends: ${error.message}`)
    }
    
    return (data || []).map(friendship => {
      const friendData = friendship.user1_id === userId ? 
        (friendship as any).user2 : 
        (friendship as any).user1;
      
      return {
        user_id: friendData.id,
        username: friendData.username,
        full_name: friendData.full_name,
        avatar_url: friendData.avatar_url,
        mutual_contacts: 0,
        is_following: false, // Would need to check follows table
        suggestion_reason: 'contact' as const
      }
    })
  }

  /**
   * Unfriend a user
   */
  async unfriend(userId: string, friendId: string): Promise<void> {
    const supabase = await createSupabaseServerClient()
    
    const [user1_id, user2_id] = userId < friendId ? [userId, friendId] : [friendId, userId]
    
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('user1_id', user1_id)
      .eq('user2_id', user2_id)
    
    if (error) {
      throw new Error(`Failed to unfriend user: ${error.message}`)
    }
  }

  /**
   * Block a user
   */
  async blockUser(userId: string, blockedUserId: string, reason?: string): Promise<void> {
    const supabase = await createSupabaseServerClient()
    
    // Check if already blocked
    const { data: existing } = await supabase
      .from('blocked_users')
      .select('id')
      .eq('blocker_id', userId)
      .eq('blocked_id', blockedUserId)
      .single()
    
    if (existing) {
      return // Already blocked
    }
    
    // Insert into blocked_users table
    const { error } = await supabase
      .from('blocked_users')
      .insert({
        blocker_id: userId,
        blocked_id: blockedUserId,
        reason: reason || null
      })
    
    if (error) {
      throw new Error(`Failed to block user: ${error.message}`)
    }
  }

  async unblockUser(userId: string, blockedUserId: string): Promise<void> {
    const supabase = await createSupabaseServerClient()
    
    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', userId)
      .eq('blocked_id', blockedUserId)
    
    if (error) {
      throw new Error(`Failed to unblock user: ${error.message}`)
    }
  }

  async getBlockedUsers(userId: string): Promise<{
    id: number;
    blocked_id: string;
    reason: string | null;
    created_at: string;
    users: {
      id: string;
      username: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  }[]> {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('blocked_users')
      .select(`
        id,
        blocked_id,
        reason,
        created_at
      `)
      .eq('blocker_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      throw new Error(`Failed to get blocked users: ${error.message}`)
    }
    
    if (!data || data.length === 0) {
      return []
    }
    
    // Get user details for blocked users
    const blockedUserIds = data.map(item => item.blocked_id)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, full_name, avatar_url')
      .in('id', blockedUserIds)
    
    if (usersError) {
      throw new Error(`Failed to get user details: ${usersError.message}`)
    }
    
    // Combine blocked_users data with user details
    const usersMap = new Map(users?.map(u => [u.id, u]) || [])
    
    return data.map(item => ({
      id: item.id,
      blocked_id: item.blocked_id,
      reason: item.reason,
      created_at: item.created_at,
      users: usersMap.get(item.blocked_id) || {
        id: item.blocked_id,
        username: 'Unknown',
        full_name: null,
        avatar_url: null
      }
    }))
  }

  async isUserBlocked(userId: string, targetUserId: string): Promise<boolean> {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('blocked_users')
      .select('id')
      .or(`blocker_id.eq.${userId},blocker_id.eq.${targetUserId}`)
      .or(`blocked_id.eq.${userId},blocked_id.eq.${targetUserId}`)
      .limit(1)
    
    if (error) {
      throw new Error(`Failed to check block status: ${error.message}`)
    }
    
    return (data && data.length > 0) || false
  }

  /**
   * Update contact discovery settings
   */
  async updateContactDiscoverySettings(
    userId: string, 
    settings: { contact_discovery: boolean; phone_discoverable: boolean }
  ): Promise<void> {
    const supabase = await createSupabaseServerClient()
    
    const { error } = await supabase
      .from('users')
      .update({
        privacy_settings: {
          contact_discovery: settings.contact_discovery,
          phone_discoverable: settings.phone_discoverable
        }
      })
      .eq('id', userId)
    
    if (error) {
      throw new Error(`Failed to update contact discovery settings: ${error.message}`)
    }
  }

  /**
   * Helper: Get friendship status between two users
   */
  private async getFriendshipStatus(userId1: string, userId2: string): Promise<string> {
    const supabase = createSupabaseAdminClient()
    
    const { data } = await supabase.rpc('get_friendship_status', {
      uid1: userId1,
      uid2: userId2
    })
    
    return data || 'none'
  }

  /**
   * Helper: Remove duplicate suggestions
   */
  private deduplicateSuggestions(suggestions: FriendSuggestion[]): FriendSuggestion[] {
    const seen = new Set<string>()
    return suggestions.filter(suggestion => {
      if (seen.has(suggestion.user_id)) {
        return false
      }
      seen.add(suggestion.user_id)
      return true
    })
  }
}

// Export singleton instance
export const webContactsService = new WebContactsService()