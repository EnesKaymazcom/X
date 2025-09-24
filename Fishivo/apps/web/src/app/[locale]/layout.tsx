import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { locales, type Locale } from '@/lib/i18n'
import { Providers } from '@/app/providers'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: localeParam } = await params
  const locale = locales.includes(localeParam as Locale) ? localeParam as Locale : 'tr'
  
  return {
    title: locale === 'tr' ? 'Fishivo - Balıkçılık Sosyal Platformu' : 'Fishivo - Fishing Social Platform',
    description: locale === 'tr' 
      ? 'Türkiye\'nin en büyük balıkçılık sosyal platformu' 
      : 'Turkey\'s largest fishing social platform',
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      ],
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale: localeParam } = await params
  const locale = locales.includes(localeParam as Locale) ? localeParam as Locale : 'tr'
  
  // If locale is invalid, show 404
  if (!locales.includes(locale)) {
    notFound()
  }
  
  const htmlLang = locale === 'tr' ? 'tr' : 'en'

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang = '${htmlLang}';`,
        }}
      />
      <Providers locale={locale}>
        {children}
      </Providers>
    </>
  )
}
