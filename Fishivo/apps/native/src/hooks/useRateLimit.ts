import { useRef } from 'react'
import { useTranslation } from '@/contexts/LanguageContext'

interface UseRateLimitOptions {
  limit?: number
  windowMs?: number
}

export const useRateLimit = (key: string, options?: UseRateLimitOptions) => {
  const { t } = useTranslation()
  const { limit = 10, windowMs = 60000 } = options || {}
  
  const attempts = useRef<Map<string, number[]>>(new Map())
  
  const checkLimit = (actionKey?: string): boolean => {
    const finalKey = actionKey || key
    const now = Date.now()
    
    // Get or create attempts array for this key
    const keyAttempts = attempts.current.get(finalKey) || []
    
    // Filter out old attempts outside the window
    const recentAttempts = keyAttempts.filter(timestamp => now - timestamp < windowMs)
    
    // Check if limit exceeded
    if (recentAttempts.length >= limit) {
      const timeRemaining = Math.ceil((recentAttempts[0] + windowMs - now) / 1000)
      throw new Error(
        t('errors.rateLimitExceeded', { seconds: timeRemaining }) || 
        `Çok fazla istek. ${timeRemaining} saniye bekleyin.`
      )
    }
    
    // Add current attempt
    recentAttempts.push(now)
    attempts.current.set(finalKey, recentAttempts)
    
    return true
  }
  
  const reset = (actionKey?: string) => {
    const finalKey = actionKey || key
    attempts.current.delete(finalKey)
  }
  
  const getRemainingAttempts = (actionKey?: string): number => {
    const finalKey = actionKey || key
    const now = Date.now()
    const keyAttempts = attempts.current.get(finalKey) || []
    const recentAttempts = keyAttempts.filter(timestamp => now - timestamp < windowMs)
    return Math.max(0, limit - recentAttempts.length)
  }
  
  return {
    checkLimit,
    reset,
    getRemainingAttempts
  }
}