'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useConsent } from '@/hooks/use-consent'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'
import Link from 'next/link'
import { TypographyH3, TypographySmall } from '@/lib/typography'

export function KVKKConsentBanner() {
  const { t, locale } = useTranslation()
  const {
    shouldShowBanner,
    showDetails,
    setShowDetails,
    acceptAll,
    rejectAll,
    isSaving
  } = useConsent()

  // Don't render on server
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !shouldShowBanner) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4"
      >
        {/* Banner content */}
        <div className={cn(
          "mx-auto max-w-5xl overflow-hidden rounded-lg border shadow-2xl",
          "bg-background/80 backdrop-blur-xl backdrop-saturate-150"
        )}>
            {/* Header */}
            <div className="px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                </div>
                <div className="flex-1">
                  <TypographySmall className="font-semibold leading-5">
                    {t('consent.kvkk.title')}
                  </TypographySmall>
                  <TypographySmall className="mt-1 text-muted-foreground leading-5">
                    {t('consent.kvkk.description')}
                  </TypographySmall>
                  <TypographySmall className="mt-2 text-muted-foreground">
                    {locale === 'tr' ? 'Detaylı bilgi için ' : 'For detailed information, please see our '}
                    <Link href={`/${locale}/privacy`} className="text-primary hover:underline">
                      {t('consent.links.privacy')}
                    </Link>
                    {locale === 'tr' ? ' ve ' : ' and '}
                    <Link href={`/${locale}/terms`} className="text-primary hover:underline">
                      {t('consent.links.terms')}
                    </Link>
                    {locale === 'tr' ? ' inceleyebilirsiniz.' : '.'}
                  </TypographySmall>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4 border-t">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1 text-primary hover:underline p-0 h-auto bg-transparent border-none"
              >
                <ChevronDown className={cn(
                  "h-3 w-3 transition-transform",
                  showDetails && "rotate-180"
                )} />
                {t('consent.showDetails')}
              </button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={rejectAll}
                  disabled={isSaving}
                  size="sm"
                >
                  {t('consent.reject')}
                </Button>
                <Button
                  onClick={acceptAll}
                  disabled={isSaving}
                  size="sm"
                >
                  {t('consent.acceptAll')}
                </Button>
              </div>
            </div>

            {/* Detailed information (collapsible) */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t bg-muted/30"
                >
                  <div className="px-4 py-2 sm:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1">
                      <TypographySmall className="text-muted-foreground">
                        <span className="font-medium">{t('consent.details.identity.title')}</span>
                        <span className="ml-1">{t('consent.details.identity.description')}</span>
                      </TypographySmall>
                      <TypographySmall className="text-muted-foreground">
                        <span className="font-medium">{t('consent.details.contact.title')}</span>
                        <span className="ml-1">{t('consent.details.contact.description')}</span>
                      </TypographySmall>
                      <TypographySmall className="text-muted-foreground">
                        <span className="font-medium">{t('consent.details.security.title')}</span>
                        <span className="ml-1">{t('consent.details.security.description')}</span>
                      </TypographySmall>
                      <TypographySmall className="text-muted-foreground">
                        <span className="font-medium">{t('consent.details.usage.title')}</span>
                        <span className="ml-1">{t('consent.details.usage.description')}</span>
                      </TypographySmall>
                    </div>
                    <TypographySmall className="mt-2 pt-2 border-t text-muted-foreground">
                      <span className="font-medium">{t('consent.details.commitment.title')}</span>
                      <span className="ml-1">{t('consent.details.commitment.description')}</span>
                    </TypographySmall>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}