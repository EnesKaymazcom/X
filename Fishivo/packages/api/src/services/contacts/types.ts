export interface Contact {
  phone: string
  name?: string
  displayName?: string
}

export interface ContactHash {
  phone_hash: string
  original_phone?: string // Only for debugging, never stored
}

export interface UserContact {
  id: number
  user_id: string
  phone_hash: string
  created_at: string
  updated_at: string
}

export interface FriendSuggestion {
  user_id: string
  username: string
  full_name?: string
  avatar_url?: string
  mutual_contacts: number
  is_following: boolean
  suggestion_reason: 'contact' | 'location' | 'interest' | 'mutual_friends'
}

export interface Friendship {
  id: number
  user1_id: string
  user2_id: string
  status: 'pending' | 'accepted' | 'rejected' | 'blocked'
  requested_by: string
  created_at: string
  updated_at: string
}

export interface FriendRequest {
  id: number
  user_id: string
  username: string
  full_name?: string
  avatar_url?: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export interface ContactsService {
  // Contact management
  hashPhoneNumbers(phones: string[]): ContactHash[]
  syncUserContacts(userId: string, contacts: Contact[]): Promise<void>
  getUserContacts(userId: string): Promise<UserContact[]>
  deleteUserContacts(userId: string): Promise<void>
  
  // Friend discovery
  findFriendSuggestions(userId: string, limit?: number): Promise<FriendSuggestion[]>
  findContactFriends(userId: string): Promise<FriendSuggestion[]>
  
  // Friendship management
  sendFriendRequest(fromUserId: string, toUserId: string): Promise<Friendship>
  respondToFriendRequest(userId: string, friendshipId: number, response: 'accepted' | 'rejected'): Promise<Friendship>
  getFriendRequests(userId: string): Promise<FriendRequest[]>
  getFriends(userId: string): Promise<FriendSuggestion[]>
  unfriend(userId: string, friendId: string): Promise<void>
  blockUser(userId: string, blockedUserId: string, reason?: string): Promise<void>
  unblockUser(userId: string, blockedUserId: string): Promise<void>
  getBlockedUsers(userId: string): Promise<{
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
  }[]>
  isUserBlocked(userId: string, targetUserId: string): Promise<boolean>
  
  // Privacy settings
  updateContactDiscoverySettings(userId: string, settings: { contact_discovery: boolean; phone_discoverable: boolean }): Promise<void>
}