import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = await createSupabaseServerClient()

  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Sign out error:', error)
    }

    // Tüm Supabase cookie'lerini temizle
    const response = NextResponse.json({ success: true })
    
    // Supabase ile ilgili tüm cookie'leri bul ve temizle
    const allCookies = cookieStore.getAll()
    allCookies.forEach(cookie => {
      if (cookie.name.startsWith('sb-')) {
        response.cookies.set(cookie.name, '', {
          maxAge: 0,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        })
      }
    })

    return response
  } catch (error) {
    console.error('Sign out error:', error)
    
    // Hata durumunda bile cookie'leri temizlemeye çalış
    const response = NextResponse.json({ error: 'Çıkış sırasında hata oluştu' }, { status: 500 })
    
    const allCookies = cookieStore.getAll()
    allCookies.forEach(cookie => {
      if (cookie.name.startsWith('sb-')) {
        response.cookies.set(cookie.name, '', {
          maxAge: 0,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        })
      }
    })
    
    return response
  }
} 