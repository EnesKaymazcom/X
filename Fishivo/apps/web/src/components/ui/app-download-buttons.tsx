'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useTranslation } from '@/lib/i18n'

interface AppDownloadButtonsProps {
  appStoreUrl?: string
  googlePlayUrl?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  noLinks?: boolean
}

export function AppDownloadButtons({ 
  appStoreUrl, 
  googlePlayUrl,
  className = "",
  size = "lg",
  noLinks = false
}: AppDownloadButtonsProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { t } = useTranslation()

  // Size configurations
  const sizeConfig = {
    sm: { width: 'w-28', gap: 'gap-2', imgWidth: 106, imgHeight: 31 },
    md: { width: 'w-32', gap: 'gap-2', imgWidth: 128, imgHeight: 38 },
    lg: { width: 'w-36', gap: 'gap-3', imgWidth: 144, imgHeight: 42 }
  }
  const config = sizeConfig[size]

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return light mode as default during SSR
    return (
      <div className={`flex ${config.gap} justify-center ${className}`}>
        {noLinks ? (
          <>
            <div className={`block ${config.width} hover:scale-105 transition-transform cursor-pointer`}>
              <Image 
                src="/App Store, Type=Light.svg" 
                alt={t('common.ui.downloadFromAppStore')} 
                width={config.imgWidth}
                height={config.imgHeight}
                className="w-full h-auto"
              />
            </div>
            <div className={`block ${config.width} hover:scale-105 transition-transform cursor-pointer`}>
              <Image 
                src="/Google Play, Type=Light.svg" 
                alt={t('common.ui.downloadFromGooglePlay')} 
                width={config.imgWidth}
                height={config.imgHeight}
                className="w-full h-auto"
              />
            </div>
          </>
        ) : (
          <>
            <a href={appStoreUrl} className={`block ${config.width} hover:opacity-80 transition-opacity`}>
              <Image 
                src="/App Store, Type=Light.svg" 
                alt={t('common.ui.downloadFromAppStore')} 
                width={config.imgWidth}
                height={config.imgHeight}
                className="w-full h-auto"
              />
            </a>
            <a href={googlePlayUrl} className={`block ${config.width} hover:opacity-80 transition-opacity`}>
              <Image 
                src="/Google Play, Type=Light.svg" 
                alt={t('common.ui.downloadFromGooglePlay')} 
                width={config.imgWidth}
                height={config.imgHeight}
                className="w-full h-auto"
              />
            </a>
          </>
        )}
      </div>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <div className={`flex ${config.gap} justify-center ${className}`}>
      {noLinks ? (
        <>
          <div className={`block ${config.width} hover:scale-105 transition-transform cursor-pointer`}>
            <Image 
              src={isDark ? "/App Store, Type=Dark.svg" : "/App Store, Type=Light.svg"} 
              alt={t('common.ui.downloadFromAppStore')} 
              width={config.imgWidth}
              height={config.imgHeight}
              className="w-full h-auto"
            />
          </div>
          <div className={`block ${config.width} hover:scale-105 transition-transform cursor-pointer`}>
            <Image 
              src={isDark ? "/Google Play, Type=Dark.svg" : "/Google Play, Type=Light.svg"} 
              alt={t('common.ui.downloadFromGooglePlay')} 
              width={config.imgWidth}
              height={config.imgHeight}
              className="w-full h-auto"
            />
          </div>
        </>
      ) : (
        <>
          <a href={appStoreUrl} className={`block ${config.width} hover:opacity-80 transition-opacity`}>
            <Image 
              src={isDark ? "/App Store, Type=Dark.svg" : "/App Store, Type=Light.svg"} 
              alt={t('common.ui.downloadFromAppStore')} 
              width={config.imgWidth}
              height={config.imgHeight}
              className="w-full h-auto"
            />
          </a>
          <a href={googlePlayUrl} className={`block ${config.width} hover:opacity-80 transition-opacity`}>
            <Image 
              src={isDark ? "/Google Play, Type=Dark.svg" : "/Google Play, Type=Light.svg"} 
              alt={t('common.ui.downloadFromGooglePlay')} 
              width={config.imgWidth}
              height={config.imgHeight}
              className="w-full h-auto"
            />
          </a>
        </>
      )}
    </div>
  )
}