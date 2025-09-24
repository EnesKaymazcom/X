'use client'

import { useI18n } from '@/lib/i18n'
import { HoverBorderGradient } from './hover-border-gradient'
import { AppDownloadButtons } from './app-download-buttons'

interface AppDownloadPromptProps {
  customMessage?: string
  customSubtitle?: string
  showSubtitle?: boolean
}

export function AppDownloadPrompt({ customMessage, customSubtitle, showSubtitle = true }: AppDownloadPromptProps) {
  const { t } = useI18n()

  return (
    <HoverBorderGradient
      containerClassName="rounded-xl w-full"
      className="bg-background text-foreground w-full"
      as="div"
      duration={2}
    >
      <div className="p-6 text-center space-y-4">
        {showSubtitle && (
          <p className="text-base text-muted-foreground">
            {customSubtitle || t('common.wantToKnowMore')}
          </p>
        )}
        <h3 className="text-xl font-bold text-foreground">
          {customMessage || t('common.downloadAppNow')}
        </h3>
        <AppDownloadButtons 
          size="md"
          noLinks={true}
          className="mt-4"
        />
      </div>
    </HoverBorderGradient>
  )
}