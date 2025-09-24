import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getServerTranslation, getLocaleFromPathname, type Locale } from '@/lib/i18n'
import { TypographyH1, TypographyH2, TypographyP } from '@/lib/typography'
import { headers } from 'next/headers'

export default async function NotFound() {
  // Get current locale from headers
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || '/'
  const locale = getLocaleFromPathname(pathname)
  
  const t = getServerTranslation(locale)

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="text-center px-4 py-16 sm:px-6 lg:px-8">
        {/* 404 Text */}
        <TypographyH1 className="text-8xl sm:text-9xl mb-4">
          404
        </TypographyH1>
        
        {/* Error message */}
        <TypographyH2 className="mb-4">
          {t('errors.404title')}
        </TypographyH2>
        
        <TypographyP className="text-muted-foreground mb-8 max-w-md mx-auto">
          {t('errors.404description')}
        </TypographyP>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={locale === 'tr' ? '/tr' : '/'}>
            <Button size="lg" className="min-w-[160px]">
              {t('errors.backToHome')}
            </Button>
          </Link>
          <Link href={locale === 'tr' ? '/tr/fish-species' : '/fish-species'}>
            <Button size="lg" variant="outline" className="min-w-[160px]">
              {t('errors.exploreFishSpecies')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
