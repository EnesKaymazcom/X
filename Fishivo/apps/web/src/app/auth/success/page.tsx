"use client"

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '@fishivo/api/client/supabase.web'

function AuthSuccessContent() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    console.log('[Auth Success] Processing authentication success')
    
    // First refresh auth context to get latest user data
    const processAuth = async () => {
      try {
        console.log('[Auth Success] Starting auth verification...')
        
        // First check if we have a session
        const { data: { session } } = await supabase.auth.getSession()
        console.log('[Auth Success] Current session:', !!session, session?.user?.email)
        
        // If no session, try to refresh
        if (!session) {
          console.log('[Auth Success] No session found, attempting refresh...')
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
          if (refreshError) {
            console.error('[Auth Success] Session refresh failed:', refreshError)
          } else {
            console.log('[Auth Success] Session refreshed:', !!refreshData.session)
          }
        }
        
        // Auth context will be refreshed automatically via auth state listener
        console.log('[Auth Success] Session ready, auth context will update automatically')
        
        // Wait a bit to ensure state propagation
        setTimeout(() => {
          console.log('[Auth Success] Redirecting to:', redirect)
          
          // Check if this is running in a popup
          if (window.opener) {
            // This is a popup, notify parent and close
            window.opener.postMessage({ type: 'auth-success', redirect }, window.location.origin)
            window.close()
          } else {
            // This is not a popup, redirect directly
            window.location.href = redirect
          }
        }, 500)
      } catch (error) {
        console.error('[Auth Success] Error refreshing auth:', error)
        // Redirect anyway after error
        setTimeout(() => {
          window.location.href = redirect
        }, 1000)
      }
    }
    
    processAuth()
  }, [redirect, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent border-t-current mx-auto mb-4" />
        <p className="text-black dark:text-white">Giriş başarılı! Yönlendiriliyorsunuz...</p>
      </div>
    </div>
  )
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent border-t-current mx-auto mb-4" />
          <p className="text-black dark:text-white">Yükleniyor...</p>
        </div>
      </div>
    }>
      <AuthSuccessContent />
    </Suspense>
  )
}