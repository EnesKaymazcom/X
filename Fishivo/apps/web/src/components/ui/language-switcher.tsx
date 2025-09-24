'use client'

import * as React from 'react'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLocale, localeNames, locales, type Locale } from '@/lib/i18n'

interface LanguageSwitcherProps {
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showLabel?: boolean
  className?: string
}

export function LanguageSwitcher({ 
  variant = 'ghost',
  size = 'default',
  showLabel = false,
  className 
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale()
  const [isChanging, setIsChanging] = React.useState(false)

  // Simple locale config
  const localeConfig = {
    tr: { flag: '🇹🇷', label: 'Türkçe' },
    en: { flag: '🇺🇸', label: 'English' }
  }
  
  const currentLocaleConfig = localeConfig[locale]

  const handleLocaleChange = React.useCallback((newLocale: Locale) => {
    if (newLocale === locale || isChanging) return
    
    setIsChanging(true)
    setLocale(newLocale)
    
    // Reset changing state after a short delay
    setTimeout(() => {
      setIsChanging(false)
    }, 500)
  }, [locale, setLocale, isChanging])

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          aria-label="Change language"
          disabled={isChanging}
        >
          {isChanging ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          {showLabel && !isChanging && (
            <>
              <span className="ml-2">{currentLocaleConfig.flag}</span>
              <span className="ml-1">{currentLocaleConfig.label}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {locales.map((supportedLocale) => {
          const config = localeConfig[supportedLocale]
          const isActive = locale === supportedLocale
          
          return (
            <DropdownMenuItem
              key={supportedLocale}
              onClick={() => handleLocaleChange(supportedLocale)}
              className="cursor-pointer"
              disabled={isChanging}
            >
              <span className="mr-2 text-lg">{config.flag}</span>
              <span className={isActive ? 'font-medium' : ''}>{config.label}</span>
              {isActive && (
                <span className="ml-auto">
                  <svg
                    className="h-4 w-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Compact version for mobile/small spaces
export function LanguageSwitcherCompact({ className }: { className?: string }) {
  return (
    <LanguageSwitcher 
      variant="outline" 
      size="icon" 
      showLabel={false}
      className={className}
    />
  )
}

// Full version with label for desktop
export function LanguageSwitcherFull({ className }: { className?: string }) {
  return (
    <LanguageSwitcher 
      variant="ghost" 
      size="default" 
      showLabel={true}
      className={className}
    />
  )
}
