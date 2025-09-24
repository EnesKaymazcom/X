import { useState, useEffect, useRef } from 'react'
import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native'
import type { User } from '@supabase/supabase-js'

interface UseSupabaseUserReturn {
  user: User | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
}

// Global session cache - singleton pattern
let globalSessionCache: User | null = null
let globalInitialized = false

export const useSupabaseUser = (): UseSupabaseUserReturn => {
  const [user, setUser] = useState<User | null>(globalSessionCache)
  const [isLoading, setIsLoading] = useState(!globalInitialized)
  const [isInitialized, setIsInitialized] = useState(globalInitialized)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    const supabase = getNativeSupabaseClient()
    let timeoutId: NodeJS.Timeout

    // Get initial user with debounce
    const getInitialUser = async () => {
      // If already initialized globally, use cache
      if (globalInitialized && globalSessionCache !== undefined) {
        setUser(globalSessionCache)
        setIsLoading(false)
        setIsInitialized(true)
        return
      }

      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        
        if (isMountedRef.current) {
          if (error) {
            setError(error.message)
            setUser(null)
            globalSessionCache = null
          } else {
            setUser(currentUser ?? null)
            globalSessionCache = currentUser ?? null
          }
          globalInitialized = true
          setIsInitialized(true)
          setIsLoading(false)
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError('Failed to get user')
          setUser(null)
          globalSessionCache = null
          globalInitialized = true
          setIsInitialized(true)
          setIsLoading(false)
        }
      }
    }

    // Get initial user immediately - no debounce for faster response
    getInitialUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Debounce auth state changes - reduced for faster response
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          if (isMountedRef.current) {
            const newUser = session?.user ?? null
            setUser(newUser)
            globalSessionCache = newUser
            globalInitialized = true
            setIsInitialized(true)
            setIsLoading(false)
            
            if (event === 'SIGNED_OUT') {
              setUser(null)
              globalSessionCache = null
            }
          }
        }, 50)
      }
    )

    return () => {
      isMountedRef.current = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  return {
    user: globalSessionCache ?? user,
    isLoading,
    isInitialized,
    error
  }
}

export default useSupabaseUser