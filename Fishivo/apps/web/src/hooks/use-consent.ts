'use client'

import { useState, useEffect, useCallback } from 'react'
import { ConsentManager, ConsentData, ConsentCategory } from '@/lib/consent/consent-manager'

export interface UseConsentReturn {
  // Consent state
  consentData: ConsentData | null
  hasConsent: (category: ConsentCategory) => boolean
  shouldShowBanner: boolean
  
  // Actions
  acceptAll: () => void
  rejectAll: () => void
  acceptSelected: (categories: Partial<ConsentData['consent']>) => void
  updateCategory: (category: ConsentCategory, value: boolean) => void
  clearConsent: () => void
  
  // UI state
  showDetails: boolean
  setShowDetails: (show: boolean) => void
  isSaving: boolean
}

export function useConsent(): UseConsentReturn {
  const [consentData, setConsentData] = useState<ConsentData | null>(null)
  const [shouldShowBanner, setShouldShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load consent on mount
  useEffect(() => {
    const consent = ConsentManager.getConsent()
    setConsentData(consent)
    setShouldShowBanner(ConsentManager.shouldShowBanner())
    
    // Listen for consent changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fishivo-consent' || e.key === 'fishivo-user-country') {
        const newConsent = ConsentManager.getConsent()
        setConsentData(newConsent)
        setShouldShowBanner(ConsentManager.shouldShowBanner())
      }
    }
    
    // Listen for country detection completion
    const handleCountryDetected = (e: CustomEvent) => {
      setShouldShowBanner(ConsentManager.shouldShowBanner())
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('countryDetected', handleCountryDetected as EventListener)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('countryDetected', handleCountryDetected as EventListener)
    }
  }, [])

  // Check if user has consent for category
  const hasConsent = useCallback((category: ConsentCategory): boolean => {
    return ConsentManager.hasConsent(category)
  }, [])

  // Accept all cookies
  const acceptAll = useCallback(() => {
    setIsSaving(true)
    ConsentManager.saveConsent({
      essential: true,
      analytics: true,
      marketing: true
    })
    
    const newConsent = ConsentManager.getConsent()
    setConsentData(newConsent)
    setShouldShowBanner(false)
    setIsSaving(false)
    
    // Close banner with animation
    setTimeout(() => {
      setShowDetails(false)
    }, 300)
  }, [])

  // Reject all non-essential cookies
  const rejectAll = useCallback(() => {
    setIsSaving(true)
    ConsentManager.saveConsent({
      essential: true,
      analytics: false,
      marketing: false
    })
    
    const newConsent = ConsentManager.getConsent()
    setConsentData(newConsent)
    setShouldShowBanner(false)
    setIsSaving(false)
    
    // Close banner with animation
    setTimeout(() => {
      setShowDetails(false)
    }, 300)
  }, [])

  // Accept selected categories
  const acceptSelected = useCallback((categories: Partial<ConsentData['consent']>) => {
    setIsSaving(true)
    ConsentManager.saveConsent({
      essential: true,
      analytics: categories.analytics || false,
      marketing: categories.marketing || false
    })
    
    const newConsent = ConsentManager.getConsent()
    setConsentData(newConsent)
    setShouldShowBanner(false)
    setIsSaving(false)
    
    // Close banner with animation
    setTimeout(() => {
      setShowDetails(false)
    }, 300)
  }, [])

  // Update single category
  const updateCategory = useCallback((category: ConsentCategory, value: boolean) => {
    if (category === 'essential') return // Can't disable essential
    
    ConsentManager.updateConsent(category, value)
    const newConsent = ConsentManager.getConsent()
    setConsentData(newConsent)
  }, [])

  // Clear all consent data
  const clearConsent = useCallback(() => {
    ConsentManager.clearConsent()
    setConsentData(null)
    setShouldShowBanner(true)
  }, [])

  return {
    consentData,
    hasConsent,
    shouldShowBanner,
    acceptAll,
    rejectAll,
    acceptSelected,
    updateCategory,
    clearConsent,
    showDetails,
    setShowDetails,
    isSaving
  }
}