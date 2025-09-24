import { createSupabaseServerClient, createSupabaseAdminClient } from '@fishivo/api/client/supabase.server'
import { FullUser } from '@fishivo/types'

export interface PaginatedUsers {
  items: FullUser[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface UserFilters {
  search?: string
  role?: string
  status?: string
}

export const userServiceWeb = {
  // Admin: Get paginated users list
  async getAdminUsers(page: number = 1, limit: number = 20, filters?: UserFilters): Promise<PaginatedUsers> {
    const supabase = await createSupabaseServerClient()
    const offset = (page - 1) * limit
    
    // Build query with user_stats join
    let query = supabase.from('users').select(`
      *,
      user_stats!left (
        followers_count,
        following_count,
        catches_count,
        spots_count
      )
    `, { count: 'exact' })
    
    // Apply filters
    if (filters?.search) {
      query = query.or(`username.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }
    
    if (filters?.role && filters.role !== 'all') {
      query = query.eq('role', filters.role)
    }
    
    if (filters?.status && filters.status !== 'all') {
      const now = new Date().toISOString()
      switch (filters.status) {
        case 'active':
          query = query.or(`banned_until.is.null,banned_until.lt.${now}`)
          break
        case 'banned':
          query = query.gt('banned_until', now)
          break
        case 'pro':
          query = query.eq('is_pro', true)
          break
      }
    }
    
    // Apply pagination and ordering
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    // Flatten user_stats data into user object
    const items = (data || []).map(user => ({
      ...user,
      followers_count: user.user_stats?.[0]?.followers_count || 0,
      following_count: user.user_stats?.[0]?.following_count || 0,
      catches_count: user.user_stats?.[0]?.catches_count || 0,
      spots_count: user.user_stats?.[0]?.spots_count || 0,
      user_stats: undefined // Remove the nested user_stats
    }))
    
    return {
      items,
      total: count || 0,
      page,
      limit,
      hasMore: count ? offset + limit < count : false
    }
  },
  
  // Get single user by ID
  async getUserById(userId: string): Promise<FullUser | null> {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },
  
  // Update user role
  async updateUserRole(userId: string, role: 'user' | 'admin' | 'super_admin'): Promise<void> {
    const supabase = createSupabaseAdminClient()
    
    const { error } = await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
    
    if (error) throw error
  },
  
  // Ban user
  async banUser(userId: string, reason: string, durationDays?: number): Promise<void> {
    const supabase = createSupabaseAdminClient()
    
    const bannedUntil = durationDays 
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year default
    
    const { error } = await supabase
      .from('users')
      .update({ 
        banned_until: bannedUntil,
        ban_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (error) throw error
  },
  
  // Unban user
  async unbanUser(userId: string): Promise<void> {
    const supabase = createSupabaseAdminClient()
    
    const { error } = await supabase
      .from('users')
      .update({ 
        banned_until: null,
        ban_reason: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (error) throw error
  },
  
  // Grant Pro status
  async grantProStatus(userId: string, durationDays: number): Promise<void> {
    const supabase = createSupabaseAdminClient()
    
    const proUntil = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
    
    const { error } = await supabase
      .from('users')
      .update({ 
        is_pro: true,
        pro_until: proUntil,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (error) throw error
  },
  
  // Revoke Pro status
  async revokeProStatus(userId: string): Promise<void> {
    const supabase = createSupabaseAdminClient()
    
    const { error } = await supabase
      .from('users')
      .update({ 
        is_pro: false,
        pro_until: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (error) throw error
  },
  
  // Delete user (hard delete)
  async deleteUser(userId: string): Promise<void> {
    const supabase = createSupabaseAdminClient()
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)
    
    if (error) throw error
  },

  // Soft delete user (disable account)
  async softDeleteUser(userId: string): Promise<void> {
    const supabase = await createSupabaseServerClient()
    
    const { error } = await supabase
      .from('users')
      .update({ 
        is_active: false,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (error) throw error
  },

}