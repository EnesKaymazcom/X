import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'

// Rate limiting için basit bir memory cache
const rateLimitCache = new Map<string, number>()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email adresi gerekli' },
        { status: 400 }
      )
    }

    // Rate limiting kontrolü (60 saniyede 1 istek)
    const now = Date.now()
    const lastRequest = rateLimitCache.get(email)
    
    if (lastRequest && now - lastRequest < 60000) { // 60 saniye
      const remainingTime = Math.ceil((60000 - (now - lastRequest)) / 1000)
      return NextResponse.json(
        { error: `Lütfen ${remainingTime} saniye bekleyin` },
        { status: 429 }
      )
    }

    const supabase = await createSupabaseServerClient()

    // Email'in kayıtlı olup olmadığını kontrol et
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email_confirmed_at')
      .eq('email', email)
      .single()

    if (userError || !userData) {
      // Güvenlik için generic mesaj
      return NextResponse.json(
        { error: 'İşlem başarısız. Lütfen email adresinizi kontrol edin.' },
        { status: 400 }
      )
    }

    // Email zaten doğrulanmış mı?
    if (userData.email_confirmed_at) {
      return NextResponse.json(
        { error: 'Email adresiniz zaten doğrulanmış. Giriş yapabilirsiniz.' },
        { status: 400 }
      )
    }

    // Yeni doğrulama emaili gönder
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    })

    if (resendError) {
      console.error('Resend verification error:', resendError)
      return NextResponse.json(
        { error: 'Email gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.' },
        { status: 500 }
      )
    }

    // Rate limit cache'i güncelle
    rateLimitCache.set(email, now)

    // Eski cache kayıtlarını temizle (memory leak önleme)
    if (rateLimitCache.size > 1000) {
      const oldestKey = rateLimitCache.keys().next().value
      if (oldestKey) rateLimitCache.delete(oldestKey)
    }

    return NextResponse.json({
      success: true,
      message: 'Doğrulama emaili başarıyla gönderildi.'
    })

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Beklenmeyen bir hata oluştu' },
      { status: 500 }
    )
  }
}