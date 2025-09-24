'use client'

import Link from 'next/link'
import { useLocale } from '@/lib/i18n'
import { ComponentProps, forwardRef } from 'react'

interface LocalizedLinkProps extends Omit<ComponentProps<typeof Link>, 'href'> {
  href: string
}

// URL mapping for localized routes
const routeMapping: Record<string, Record<string, string>> = {
  '/support': {
    'tr': '/support',
    'en': '/support'
  },
  '/faq': {
    'tr': '/faq',
    'en': '/faq'
  }
}

export const LocalizedLink = forwardRef<HTMLAnchorElement, LocalizedLinkProps>(
  function LocalizedLink({ href, ...props }, ref) {
  const { locale } = useLocale()
  
  // If href already has locale prefix, use as is
  if (href.startsWith(`/${locale}/`) || href.startsWith('/tr/') || href.startsWith('/en/')) {
    return <Link ref={ref} href={href} {...props} />
  }
  
  // For external links, use as is
  if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return <Link ref={ref} href={href} {...props} />
  }
  
  // Check if route needs mapping
  let mappedHref = href
  if (routeMapping[href]) {
    mappedHref = routeMapping[href][locale] || href
  }
  
  // Add locale prefix to internal links
  const localizedHref = mappedHref === '/' ? `/${locale}` : `/${locale}${mappedHref}`
  
  return <Link ref={ref} href={localizedHref} {...props} />
})
