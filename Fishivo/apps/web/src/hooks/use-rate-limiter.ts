import { useState, useEffect, useCallback } from 'react'

interface RateLimiterOptions {
  maxAttempts?: number          // Maksimum deneme sayısı (varsayılan: 4)
  timeWindow?: number           // Zaman penceresi ms cinsinden (varsayılan: 10000ms = 10 saniye)
  blockDuration?: number        // Engelleme süresi ms cinsinden (varsayılan: 24 saat)
  minDelay?: number            // Minimum bekleme süresi ms cinsinden (varsayılan: 1000ms = 1 saniye)
  storageKey?: string          // LocalStorage key (varsayılan: 'rateLimiterBlock')
}

interface RateLimiterReturn {
  isBlocked: boolean
  isAllowed: () => boolean
  handleAction: (action: () => void | Promise<void>) => Promise<void>
  getRemainingBlockTime: () => number // Saat cinsinden kalan süre
  reset: () => void
}

export function useRateLimiter(options: RateLimiterOptions = {}): RateLimiterReturn {
  const {
    maxAttempts = 4,
    timeWindow = 10000,
    blockDuration = 24 * 60 * 60 * 1000,
    minDelay = 1000,
    storageKey = 'rateLimiterBlock'
  } = options

  const [isBlocked, setIsBlocked] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)

  // Block durumunu kontrol et
  useEffect(() => {
    const checkBlockStatus = () => {
      const blockData = localStorage.getItem(storageKey)
      if (blockData) {
        try {
          const { blockedUntil } = JSON.parse(blockData)
          const now = Date.now()
          if (now < blockedUntil) {
            setIsBlocked(true)
          } else {
            // Block süresi dolmuş, localStorage'ı temizle
            localStorage.removeItem(storageKey)
            setIsBlocked(false)
          }
        } catch (error) {
          // Hatalı veri varsa temizle
          localStorage.removeItem(storageKey)
          setIsBlocked(false)
        }
      } else {
        setIsBlocked(false)
      }
    }
    
    checkBlockStatus()
    // Her 10 saniyede bir kontrol et
    const interval = setInterval(checkBlockStatus, 10000)
    return () => clearInterval(interval)
  }, [storageKey])

  // İzin verilip verilmediğini kontrol et
  const isAllowed = useCallback((): boolean => {
    if (isBlocked) return false

    const now = Date.now()
    const timeSinceLastClick = now - lastClickTime
    
    // Minimum bekleme süresi kontrolü
    if (timeSinceLastClick < minDelay) {
      return false
    }

    // Zaman penceresi içinde çok fazla tıklama kontrolü
    if (timeSinceLastClick < timeWindow) {
      if (clickCount >= maxAttempts - 1) {
        // Block uygula
        const blockedUntil = now + blockDuration
        localStorage.setItem(storageKey, JSON.stringify({
          blockedUntil,
          blockedAt: now,
          reason: 'rate_limit_exceeded'
        }))
        setIsBlocked(true)
        return false
      }
    }

    return true
  }, [isBlocked, lastClickTime, clickCount, minDelay, timeWindow, maxAttempts, blockDuration, storageKey])

  // Aksiyonu handle et
  const handleAction = useCallback(async (action: () => void | Promise<void>) => {
    if (!isAllowed()) {
      return
    }

    const now = Date.now()
    const timeSinceLastClick = now - lastClickTime

    // Sayacı güncelle
    if (timeSinceLastClick < timeWindow) {
      setClickCount(prev => prev + 1)
    } else {
      // Zaman penceresi dışındaysa sayacı sıfırla
      setClickCount(1)
    }

    setLastClickTime(now)

    // Aksiyonu çalıştır
    try {
      await action()
    } catch (error) {
      console.error('Rate limited action error:', error)
      throw error
    }
  }, [isAllowed, lastClickTime, timeWindow])

  // Kalan block süresini al (saat cinsinden)
  const getRemainingBlockTime = useCallback((): number => {
    if (!isBlocked) return 0

    const blockData = localStorage.getItem(storageKey)
    if (!blockData) return 0

    try {
      const { blockedUntil } = JSON.parse(blockData)
      const remainingMs = blockedUntil - Date.now()
      if (remainingMs <= 0) return 0
      return Math.ceil(remainingMs / 1000 / 60 / 60) // Saat cinsinden
    } catch {
      return 0
    }
  }, [isBlocked, storageKey])

  // Reset fonksiyonu
  const reset = useCallback(() => {
    localStorage.removeItem(storageKey)
    setIsBlocked(false)
    setClickCount(0)
    setLastClickTime(0)
  }, [storageKey])

  return {
    isBlocked,
    isAllowed,
    handleAction,
    getRemainingBlockTime,
    reset
  }
}