/**
 * KVKK/GDPR Compliant Consent Management System
 * Manages user consent for cookies and data processing
 */

export type ConsentCategory = 'essential' | 'analytics' | 'marketing'

export interface ConsentData {
  version: string
  timestamp: number
  consent: {
    essential: boolean
    analytics: boolean
    marketing: boolean
  }
  userInfo?: {
    country?: string
    language?: string
  }
}

export interface ConsentSettings {
  essential: {
    name: string
    description: string
    required: boolean
    cookies: string[]
  }
  analytics: {
    name: string
    description: string
    required: boolean
    cookies: string[]
  }
  marketing: {
    name: string
    description: string
    required: boolean
    cookies: string[]
  }
}

// Default consent settings
const DEFAULT_CONSENT_SETTINGS: ConsentSettings = {
  essential: {
    name: 'Zorunlu Çerezler',
    description: 'Web sitesinin temel işlevleri için gerekli çerezler',
    required: true,
    cookies: ['fishivo-auth-token', 'fishivo-session', 'fishivo-theme', 'fishivo-locale']
  },
  analytics: {
    name: 'Analitik Çerezler',
    description: 'Web sitesi kullanımını analiz etmek için kullanılan çerezler',
    required: false,
    cookies: ['_ga', '_gid', '_gat', 'hotjar', 'mixpanel']
  },
  marketing: {
    name: 'Pazarlama Çerezleri',
    description: 'Kişiselleştirilmiş reklamlar göstermek için kullanılan çerezler',
    required: false,
    cookies: ['_fbp', '_fbc', 'fr', 'tr', 'ads_session']
  }
}

export class ConsentManager {
  private static readonly STORAGE_KEY = 'fishivo-consent'
  private static readonly CONSENT_VERSION = '1.0'
  private static readonly RETENTION_DAYS = 365 // 1 year

  /**
   * Get current consent status
   */
  static getConsent(): ConsentData | null {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null
      
      const consent = JSON.parse(stored) as ConsentData
      
      // Check if consent is expired
      const expirationTime = consent.timestamp + (this.RETENTION_DAYS * 24 * 60 * 60 * 1000)
      if (Date.now() > expirationTime) {
        this.clearConsent()
        return null
      }
      
      // Check version compatibility
      if (consent.version !== this.CONSENT_VERSION) {
        this.clearConsent()
        return null
      }
      
      return consent
    } catch (error) {
      console.error('Error reading consent:', error)
      return null
    }
  }

  /**
   * Save user consent choices
   */
  static saveConsent(consent: Partial<ConsentData['consent']>): void {
    if (typeof window === 'undefined') return
    
    const consentData: ConsentData = {
      version: this.CONSENT_VERSION,
      timestamp: Date.now(),
      consent: {
        essential: true, // Always required
        analytics: consent.analytics || false,
        marketing: consent.marketing || false
      },
      userInfo: {
        country: this.detectCountry(),
        language: navigator.language
      }
    }
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(consentData))
      
      // Apply consent choices
      this.applyConsentChoices(consentData.consent)
      
      // Log consent for KVKK compliance
      this.logConsentChoice(consentData)
    } catch (error) {
      console.error('Error saving consent:', error)
    }
  }

  /**
   * Check if user has given consent for specific category
   */
  static hasConsent(category: ConsentCategory): boolean {
    const consent = this.getConsent()
    if (!consent) return category === 'essential' // Essential always allowed
    
    return consent.consent[category] || false
  }

  /**
   * Clear all consent data
   */
  static clearConsent(): void {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(this.STORAGE_KEY)
    this.clearNonEssentialCookies()
  }

  /**
   * Update consent for specific category
   */
  static updateConsent(category: ConsentCategory, value: boolean): void {
    const current = this.getConsent()
    if (!current) return
    
    current.consent[category] = value
    this.saveConsent(current.consent)
  }

  /**
   * Clear all non-essential cookies
   */
  static clearNonEssentialCookies(): void {
    if (typeof window === 'undefined') return
    
    const allCookies = document.cookie.split(';')
    const essentialCookies = DEFAULT_CONSENT_SETTINGS.essential.cookies
    
    allCookies.forEach(cookie => {
      const [name] = cookie.split('=').map(c => c.trim())
      
      // Skip essential cookies
      if (essentialCookies.some(essential => name.includes(essential))) {
        return
      }
      
      // Delete cookie
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`
    })
  }

  /**
   * Apply consent choices (enable/disable tracking scripts)
   */
  private static applyConsentChoices(consent: ConsentData['consent']): void {
    // Clear non-essential cookies if not consented
    if (!consent.analytics || !consent.marketing) {
      this.clearNonEssentialCookies()
    }
    
    // Dispatch custom event for other scripts to listen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('consentChanged', { 
        detail: consent 
      }))
    }
  }

  /**
   * Detect user's country (for KVKK compliance)
   */
  private static detectCountry(): string {
    // This should be replaced with actual geolocation service
    // For now, check timezone as a simple heuristic
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return timezone.includes('Istanbul') ? 'TR' : 'OTHER'
  }

  /**
   * Log consent choice for compliance
   */
  private static async logConsentChoice(consent: ConsentData): Promise<void> {
    try {
      // In production, this should send to your backend
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/consent/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            consent: consent.consent,
            timestamp: consent.timestamp,
            userInfo: consent.userInfo
          })
        })
      }
    } catch (error) {
      console.error('Error logging consent:', error)
    }
  }

  /**
   * Check if user should see consent banner
   */
  static shouldShowBanner(): boolean {
    // Already has consent
    if (this.getConsent()) return false
    
    // Check if Turkish language
    const language = navigator.language.toLowerCase()
    const isTurkish = language.startsWith('tr')
    
    // Check if from Turkey (IP-based)
    const isFromTurkey = this.isFromTurkey()
    
    return isTurkish || isFromTurkey
  }

  /**
   * Check if user is from Turkey based on IP
   */
  private static isFromTurkey(): boolean {
    if (typeof window === 'undefined') return false
    
    // Check stored country info
    const storedCountry = localStorage.getItem('fishivo-user-country')
    if (storedCountry) {
      return storedCountry === 'TR'
    }
    
    // If no stored info, assume needs check
    this.detectUserCountry()
    return true // Show banner while detecting
  }

  /**
   * Detect user country and store it
   */
  private static async detectUserCountry(): Promise<void> {
    if (typeof window === 'undefined') return
    
    try {
      // Try to get country from IP
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      
      if (data.country_code) {
        localStorage.setItem('fishivo-user-country', data.country_code)
        
        // If user is from Turkey and hasn't seen banner, trigger re-render
        if (data.country_code === 'TR' && !this.getConsent()) {
          window.dispatchEvent(new CustomEvent('countryDetected', { 
            detail: { country: data.country_code } 
          }))
        }
      }
    } catch (error) {
      console.warn('Failed to detect user country:', error)
      // Fallback: assume Turkey if detection fails (better safe than sorry for KVKK)
      localStorage.setItem('fishivo-user-country', 'TR')
    }
  }

  /**
   * Get consent settings for UI
   */
  static getConsentSettings(): ConsentSettings {
    return DEFAULT_CONSENT_SETTINGS
  }

  /**
   * Generate KVKK compliance report
   */
  static generateComplianceReport(): string {
    const consent = this.getConsent()
    const now = new Date().toLocaleString('tr-TR')
    
    return `
KVKK Uyumluluk Raporu
Oluşturulma Tarihi: ${now}

Consent Durumu:
- Zorunlu Çerezler: ✓ Aktif
- Analitik Çerezler: ${consent?.consent.analytics ? '✓ Aktif' : '✗ Pasif'}
- Pazarlama Çerezleri: ${consent?.consent.marketing ? '✓ Aktif' : '✗ Pasif'}

Consent Tarihi: ${consent ? new Date(consent.timestamp).toLocaleString('tr-TR') : 'Yok'}
Kullanıcı Ülkesi: ${consent?.userInfo?.country || 'Bilinmiyor'}
Tarayıcı Dili: ${consent?.userInfo?.language || 'Bilinmiyor'}
    `.trim()
  }
}

// Export for convenience
export const {
  getConsent,
  saveConsent,
  hasConsent,
  clearConsent,
  updateConsent,
  shouldShowBanner,
  getConsentSettings,
  generateComplianceReport
} = ConsentManager