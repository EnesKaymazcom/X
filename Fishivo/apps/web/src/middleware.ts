import { type NextRequest, NextResponse } from 'next/server'
import { createI18nMiddleware } from '@/lib/i18n/middleware'
import { createSupabaseMiddlewareClient } from '@fishivo/api/client/supabase.server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Skip middleware for static files, API routes, and auth routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/auth/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }
  
  // Handle i18n routing
  const i18nMiddleware = createI18nMiddleware()
  const i18nResponse = i18nMiddleware(request)
  
  if (i18nResponse) {
    return i18nResponse
  }
  
  // Create response for later use
  let response = NextResponse.next()
  
  // Add pathname header for server-side locale detection
  response.headers.set('x-pathname', request.nextUrl.pathname)
  
  // Coming Soon Mode - Redirect to waitlist
  const isComingSoonMode = process.env.NEXT_PUBLIC_COMING_SOON_MODE === 'true'
  const locale = pathname.split('/')[1] || 'en'
  const isWaitlistPage = pathname.includes('/waitlist')
  const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/` || pathname === '/'
  
  // Redirect to waitlist if coming soon mode is enabled and not already on waitlist page
  if (isComingSoonMode && !isWaitlistPage && isHomePage) {
    const waitlistUrl = new URL(`/${locale}/waitlist`, request.url)
    return NextResponse.redirect(waitlistUrl)
  }
  
  // Protected routes configuration
  const protectedPaths = [
    '/profile/edit',
    '/profile/settings',
    '/admin',
    '/dashboard'
  ]
  
  // Check if the path needs authentication
  const isProtected = protectedPaths.some(path => 
    pathname.includes(path)
  )
  
  if (isProtected) {
    // Only create Supabase client and refresh session for protected routes
    const { supabase, response: supabaseResponse } = createSupabaseMiddlewareClient(request)
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      const locale = pathname.split('/')[1] || 'tr'
      const loginUrl = new URL(`/${locale}/login`, request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Use the response from Supabase client to ensure cookies are updated
    response = supabaseResponse
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
