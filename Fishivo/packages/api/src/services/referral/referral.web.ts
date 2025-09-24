import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'
import type { 
  ReferralStats, 
  ClaimReferralRequest, 
  ClaimReferralResponse 
} from './types'

export class ReferralServiceWeb {
  static async claimReferral(
    userId: string, 
    request: ClaimReferralRequest
  ): Promise<ClaimReferralResponse> {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase.rpc('claim_referral', {
      p_referred_user_id: userId,
      p_referral_code: request.referral_code,
      p_ip_address: request.ip_address || null,
      p_user_agent: request.user_agent || null
    })
    
    if (error) {
      console.error('Error claiming referral:', error)
      return { success: false, error: error.message }
    }
    
    return data as ClaimReferralResponse
  }
  
  static async getReferralStats(userId: string): Promise<ReferralStats | null> {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase.rpc('get_referral_stats', {
      p_user_id: userId
    })
    
    if (error) {
      console.error('Error getting referral stats:', error)
      return null
    }
    
    return data as ReferralStats
  }
  
  static async getUserByReferralCode(referralCode: string) {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('users')
      .select('id, username, full_name, avatar_url')
      .eq('referral_code', referralCode.toUpperCase())
      .single()
    
    if (error || !data) return null
    
    return data
  }
  
  static async generateNewReferralCode(userId: string): Promise<string | null> {
    const supabase = await createSupabaseServerClient()
    
    // Generate unique referral code
    let newCode: string
    let attempts = 0
    const maxAttempts = 10
    
    do {
      newCode = this.generateRandomCode()
      attempts++
      
      // Check if code already exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', newCode)
        .single()
      
      if (!existing) break
      
    } while (attempts < maxAttempts)
    
    if (attempts >= maxAttempts) {
      console.error('Failed to generate unique referral code')
      return null
    }
    
    // Update user with new code
    const { error } = await supabase
      .from('users')
      .update({ referral_code: newCode })
      .eq('id', userId)
    
    if (error) {
      console.error('Error updating referral code:', error)
      return null
    }
    
    return newCode
  }
  
  private static generateRandomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
  
  static async validateReferralCode(code: string): Promise<boolean> {
    if (!code || code.length !== 8) return false
    
    const supabase = await createSupabaseServerClient()
    
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', code.toUpperCase())
      .single()
    
    return !!data
  }
  
  static async getReferralLeaderboard(limit: number = 10) {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('users')
      .select('username, full_name, avatar_url, referral_count')
      .gt('referral_count', 0)
      .order('referral_count', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error getting referral leaderboard:', error)
      return []
    }
    
    return data || []
  }
}