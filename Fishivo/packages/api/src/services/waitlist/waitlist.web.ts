import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'
import type { WaitlistEntry, WaitlistSignupRequest, WaitlistSignupResponse } from './types'

export class WaitlistService {

  async addToWaitlist(
    request: WaitlistSignupRequest,
    userAgent?: string,
    ipAddress?: string
  ): Promise<WaitlistSignupResponse> {
    try {
      const { email, referrer } = request

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return {
          success: false,
          message: 'Geçersiz email formatı',
          error: 'INVALID_EMAIL_FORMAT'
        }
      }

      // Check if email already exists
      const supabase = await createSupabaseServerClient()
      const { data: existingEntry } = await supabase
        .from('waitlist')
        .select('id, email')
        .eq('email', email.toLowerCase())
        .single()

      if (existingEntry) {
        return {
          success: false,
          message: 'Bu email adresi zaten waitlist\'te bulunuyor',
          error: 'EMAIL_ALREADY_EXISTS'
        }
      }

      // Add to waitlist
      const { data, error } = await supabase
        .from('waitlist')
        .insert({
          email: email.toLowerCase(),
          referrer: referrer || null,
          user_agent: userAgent || null,
          ip_address: ipAddress || null
        })
        .select()
        .single()

      if (error) {
        console.error('Waitlist signup error:', error)
        return {
          success: false,
          message: 'Waitlist kaydında hata oluştu',
          error: 'DATABASE_ERROR'
        }
      }

      return {
        success: true,
        message: 'Başarıyla waitlist\'e eklendi!',
        data: {
          id: data.id,
          email: data.email,
          created_at: data.created_at
        }
      }
    } catch (error) {
      console.error('Waitlist service error:', error)
      return {
        success: false,
        message: 'Beklenmeyen bir hata oluştu',
        error: 'UNEXPECTED_ERROR'
      }
    }
  }

  async getWaitlistStats(): Promise<{
    total: number
    thisWeek: number
    thisMonth: number
  }> {
    try {
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const supabase = await createSupabaseServerClient()
      const { count: total } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })

      const { count: thisWeek } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString())

      const { count: thisMonth } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneMonthAgo.toISOString())

      return {
        total: total || 0,
        thisWeek: thisWeek || 0,
        thisMonth: thisMonth || 0
      }
    } catch (error) {
      console.error('Error getting waitlist stats:', error)
      return {
        total: 0,
        thisWeek: 0,
        thisMonth: 0
      }
    }
  }
}

export const waitlistService = new WaitlistService()