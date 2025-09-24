import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'
import { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // Handle errors from Supabase
  if (error) {
    console.error('Auth confirm error:', error, error_description)
    const errorUrl = new URL('/auth/error', origin)
    errorUrl.searchParams.set('error', error_description || error)
    return NextResponse.redirect(errorUrl)
  }

  // Verify required parameters
  if (!token_hash || !type) {
    console.error('Missing required parameters:', { token_hash: !!token_hash, type })
    const errorUrl = new URL('/auth/error', origin)
    errorUrl.searchParams.set('error', 'missing_parameters')
    return NextResponse.redirect(errorUrl)
  }

  try {
    const supabase = await createSupabaseServerClient()

    // Verify the OTP token
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (verifyError) {
      console.error('OTP verification failed:', verifyError)
      const errorUrl = new URL('/auth/error', origin)
      errorUrl.searchParams.set('error', verifyError.message)
      
      // Özel hata mesajları
      if (verifyError.message.includes('expired')) {
        errorUrl.searchParams.set('error', 'Link süresi dolmuş. Lütfen yeni bir şifre sıfırlama isteği gönderin.')
      } else if (verifyError.message.includes('invalid')) {
        errorUrl.searchParams.set('error', 'Geçersiz veya kullanılmış link. Lütfen yeni bir şifre sıfırlama isteği gönderin.')
      }
      
      return NextResponse.redirect(errorUrl)
    }

    // Successful verification
    console.log('OTP verification successful:', {
      type,
      user: data.user?.email,
      session: !!data.session
    })

    // For recovery type, verify session exists before redirecting
    if (type === 'recovery') {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.error('No session after recovery OTP verification')
        const errorUrl = new URL('/auth/error', origin)
        errorUrl.searchParams.set('error', 'Oturum oluşturulamadı. Lütfen tekrar deneyin.')
        return NextResponse.redirect(errorUrl)
      }
      
      console.log('Recovery session established for:', session.user.email)
    }

    // Redirect to the appropriate page
    const redirectUrl = new URL(next, origin)
    console.log('Redirecting to:', redirectUrl.toString())
    
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Unexpected error in auth confirm:', error)
    const errorUrl = new URL('/auth/error', origin)
    errorUrl.searchParams.set('error', 'Beklenmeyen bir hata oluştu')
    return NextResponse.redirect(errorUrl)
  }
}