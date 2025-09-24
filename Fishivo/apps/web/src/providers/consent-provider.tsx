'use client'

import { useEffect } from 'react'
import { KVKKConsentBanner } from '@/components/consent/kvkk-consent-banner'
import { ConsentManager } from '@/lib/consent/consent-manager'

interface ConsentProviderProps {
  children: React.ReactNode
}

export function ConsentProvider({ children }: ConsentProviderProps) {
  useEffect(() => {
    // Initialize consent manager
    const consent = ConsentManager.getConsent()
    
    // Setup event listeners for third-party scripts
    const handleConsentChange = (event: CustomEvent) => {
      const { detail } = event
      
      // Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        if (detail.analytics) {
          // Enable GA
          (window as any).gtag('consent', 'update', {
            'ad_storage': 'granted',
            'analytics_storage': 'granted'
          })
        } else {
          // Disable GA
          (window as any).gtag('consent', 'update', {
            'ad_storage': 'denied',
            'analytics_storage': 'denied'
          })
        }
      }
      
      // Facebook Pixel
      if (typeof window !== 'undefined' && (window as any).fbq) {
        if (detail.marketing) {
          // Enable FB Pixel
          (window as any).fbq('consent', 'grant')
        } else {
          // Disable FB Pixel
          (window as any).fbq('consent', 'revoke')
        }
      }
    }
    
    // Apply initial consent state
    if (consent) {
      handleConsentChange(new CustomEvent('consentChanged', { detail: consent.consent }))
    }
    
    // Listen for consent changes
    window.addEventListener('consentChanged', handleConsentChange as EventListener)
    
    return () => {
      window.removeEventListener('consentChanged', handleConsentChange as EventListener)
    }
  }, [])
  
  return (
    <>
      {children}
      <KVKKConsentBanner />
    </>
  )
}