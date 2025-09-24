"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { I18nProvider, defaultLocale } from '@/lib/i18n'
import { ConsentProvider } from '@/providers/consent-provider'
import { initImageProtection } from '@/lib/image-protection'
export function Providers({ 
  children, 
  locale 
}: { 
  children: React.ReactNode
  locale?: 'tr' | 'en'
}) {
  const pathname = usePathname()
  
  // Initialize image protection globally
  useEffect(() => {
    initImageProtection()
  }, [])
  
  // Prefer passed locale, fallback to URL detection
  let initialLocale = locale || defaultLocale
  
  if (!locale) {
    // URL'den locale'i detect et
    const urlSegments = pathname.split('/').filter(Boolean)
    const firstSegment = urlSegments[0]
    initialLocale = ['tr', 'en'].includes(firstSegment) ? firstSegment as any : defaultLocale
  }
  
  // Footer'ı göstermeyeceğimiz sayfalar
  const hideFooter = pathname.endsWith('/map') || pathname.includes('/admin') || pathname.endsWith('/waitlist')
  
  // Navbar'ı göstermeyeceğimiz sayfalar
  const hideNavbar = pathname.endsWith('/waitlist')

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <I18nProvider initialLocale={initialLocale}>
        <ConsentProvider>
          <div className="flex flex-col min-h-screen">
            {!hideNavbar && <Navbar />}
            <MainContent>{children}</MainContent>
            {!hideFooter && <Footer />}
          </div>
        </ConsentProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}

function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Full-screen sayfalar için navbar padding'i ekleme (locale-aware)
  const isFullscreenPage = pathname.endsWith('/map')
  const isLoginPage = pathname.endsWith('/login')
  const isSupportPage = pathname.endsWith('/support')
  const isWaitlistPage = pathname.endsWith('/waitlist')
  
  return (
    <main className={`flex-1 ${isFullscreenPage || isLoginPage || isSupportPage || isWaitlistPage ? '' : 'pt-navbar'} w-full`}>
      {children}
    </main>
  )
}
