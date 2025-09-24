import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native'
import type { 
  Contact, 
  ContactHash, 
  UserContact, 
  FriendSuggestion, 
  Friendship, 
  FriendRequest,
  ContactsService 
} from './types'

function simpleHash(str: string): string {
  let hash = 0
  if (str.length === 0) return hash.toString()
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36)
}

export class NativeContactsService implements ContactsService {
  
  hashPhoneNumbers(phones: string[]): ContactHash[] {
    return phones.map(phone => {
      const normalized = phone.replace(/[\s\-\(\)]/g, '')
      const hash = simpleHash(normalized)
      
      return {
        phone_hash: hash,
        original_phone: __DEV__ ? normalized : undefined
      }
    })
  }

  async syncUserContacts(userId: string, contacts: Contact[]): Promise<void> {
    const supabase = getNativeSupabaseClient()
    const phoneHashes = this.hashPhoneNumbers(contacts.map(c => c.phone))
    
    try {
      await supabase
        .from('user_contacts')
        .delete()
        .eq('user_id', userId)
      
      if (phoneHashes.length > 0) {
        const batchSize = 100
        for (let i = 0; i < phoneHashes.length; i += batchSize) {
          const batch = phoneHashes.slice(i, i + batchSize)
          const contactRecords = batch.map(hash => ({
            user_id: userId,
            phone_hash: hash.phone_hash
          }))
          
          const { error } = await supabase
            .from('user_contacts')
            .insert(contactRecords)
          
          if (error) {
            throw new Error(`Failed to sync contacts batch: ${error.message}`)
          }
        }
      }
    } catch (error) {
      // Re-throw error for proper handling
      throw error
    }
  }

  async getUserContacts(userId: string): Promise<UserContact[]> {
    const supabase = getNativeSupabaseClient()
    
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

  async deleteUserContacts(userId: string): Promise<void> {
    const supabase = getNativeSupabaseClient()
    
    const { error } = await supabase
      .from('user_contacts')
      .delete()
      .eq('user_id', userId)
    
    if (error) {
      throw new Error(`Failed to delete user contacts: ${error.message}`)
    }
  }

  async findFriendSuggestions(userId: string, limit = 20): Promise<FriendSuggestion[]> {
    const contactFriends = await this.findContactFriends(userId)
    return contactFriends.slice(0, limit)
  }

  async findContactFriends(userId: string): Promise<FriendSuggestion[]> {
    const supabase = getNativeSupabaseClient()
    const { data: currentUser } = await supabase
      .from('users')
      .select('phone, privacy_settings')
      .eq('id', userId)
      .single()
    
    if (!currentUser?.phone || !currentUser.privacy_settings?.phone_discoverable) {
      return []
    }
    
    const userPhoneHash = this.hashPhoneNumbers([currentUser.phone])[0].phone_hash
    const { data: suggestions, error } = await supabase
      .from('user_contacts')
      .select(`
        user_id,
        users!inner(
          id,
          username,
          full_name,
          avatar_url,
          privacy_settings
        )
      `)
      .eq('phone_hash', userPhoneHash)
      .neq('user_id', userId)
    
    if (error) {
      // Return empty array on error
      return []
    }
    const friendSuggestions: FriendSuggestion[] = []
    
    for (const suggestion of suggestions || []) {
      const user = suggestion.users as any
      if (!user?.privacy_settings?.contact_discovery) {
        continue
      }
      const friendshipStatus = await this.getFriendshipStatus(userId, user.id)
      if (friendshipStatus !== 'none') {
        continue
      }
      friendSuggestions.push({
        user_id: user.id,
        username: user.username,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        mutual_contacts: 1,
        is_following: false,
        suggestion_reason: 'contact'
      })
    }
    
    return friendSuggestions
  }

  async sendFriendRequest(fromUserId: string, toUserId: string): Promise<Friendship> {
    const supabase = getNativeSupabaseClient()
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

  async respondToFriendRequest(userId: string, friendshipId: number, response: 'accepted' | 'rejected'): Promise<Friendship> {
    const supabase = getNativeSupabaseClient()
    
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

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    const supabase = getNativeSupabaseClient()
    
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        status,
        requested_by,
        created_at,
        user1_id,
        user2_id,
        users!friendships_requested_by_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('status', 'pending')
      .neq('requested_by', userId)
    
    if (error) {
      throw new Error(`Failed to get friend requests: ${error.message}`)
    }
    
    return (data || []).map(friendship => {
      const requester = (friendship as any).users;
      return {
        id: friendship.id,
        user_id: requester.id,
        username: requester.username,
        full_name: requester.full_name,
        avatar_url: requester.avatar_url,
        status: 'pending' as const,
        created_at: friendship.created_at
      };
    })
  }

  async getFriends(userId: string): Promise<FriendSuggestion[]> {
    const supabase = getNativeSupabaseClient()
    
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
        is_following: false,
        suggestion_reason: 'contact' as const
      }
    })
  }

  async unfriend(userId: string, friendId: string): Promise<void> {
    const supabase = getNativeSupabaseClient()
    
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

  async blockUser(userId: string, blockedUserId: string, reason?: string): Promise<void> {
    const supabase = getNativeSupabaseClient()
    
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
    const supabase = getNativeSupabaseClient()
    
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
    const supabase = getNativeSupabaseClient()
    
    const { data, error } = await supabase
      .from('blocked_users')
      .select(`
        id,
        blocked_id,
        reason,
        created_at,
        users:blocked_id(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('blocker_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      throw new Error(`Failed to get blocked users: ${error.message}`)
    }
    
    if (!data || data.length === 0) {
      return []
    }
    
    return data.map(item => ({
      id: item.id,
      blocked_id: item.blocked_id,
      reason: item.reason,
      created_at: item.created_at,
      users: Array.isArray(item.users) ? item.users[0] : (item.users || {
        id: item.blocked_id,
        username: 'Unknown',
        full_name: null,
        avatar_url: null
      })
    }))
  }

  async isUserBlocked(userId: string, targetUserId: string): Promise<boolean> {
    const supabase = getNativeSupabaseClient()
    
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

  async updateContactDiscoverySettings(
    userId: string, 
    settings: { contact_discovery: boolean; phone_discoverable: boolean }
  ): Promise<void> {
    const supabase = getNativeSupabaseClient()
    
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

  private async getFriendshipStatus(userId1: string, userId2: string): Promise<string> {
    const supabase = getNativeSupabaseClient()
    
    try {
      const [user1_id, user2_id] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1]
      
      const { data } = await supabase
        .from('friendships')
        .select('status')
        .eq('user1_id', user1_id)
        .eq('user2_id', user2_id)
        .single()
      
      return data?.status || 'none'
    } catch (error) {
      return 'none'
    }
  }
}
export const nativeContactsService = new NativeContactsService()