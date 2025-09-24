/**
 * i18n Middleware utilities
 * For Next.js middleware integration
 */

import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale, type Locale } from '@/lib/i18n/config'

/**
 * Get locale from pathname
 */
export function getLocale(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0] as Locale
  
  if (locales.includes(firstSegment)) {
    return firstSegment
  }
  
  return defaultLocale
}

/**
 * Check if pathname has valid locale prefix
 */
export function hasValidLocale(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0] as Locale
  
  return locales.includes(firstSegment)
}

/**
 * Create i18n middleware for Next.js
 */
export function createI18nMiddleware() {
  return function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname
    
    // Skip middleware for API routes, auth routes, static files, and Next.js internals
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/auth/') ||
      pathname.startsWith('/_next/') ||
      pathname.includes('.') ||
      pathname.startsWith('/favicon')
    ) {
      return NextResponse.next()
    }
    
    // Check if pathname already has a valid locale
    if (hasValidLocale(pathname)) {
      return NextResponse.next()
    }
    
    // Redirect to default locale
    const newUrl = new URL(`/${defaultLocale}${pathname}`, request.url)
    return NextResponse.redirect(newUrl)
  }
}

export default createI18nMiddleware()