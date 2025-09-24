import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token = searchParams.get('token')
  const provider = searchParams.get('provider')
  const lang = searchParams.get('lang')
  
  // Locale belirleme
  const locale = lang && ['tr', 'en'].includes(lang) ? lang : 'tr'
  
  // Create supabase client with cookie support
  const supabase = await createSupabaseServerClient()

  // Handle backend OAuth callbacks (with token from Passport.js)
  if (token && provider) {
    console.log(`OAuth callback from ${provider} with token`)
    
    try {
      // Verify the token is valid by decoding it (basic validation)
      const tokenParts = token.split('.')
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format')
      }

      // Store the token in a cookie or handle as needed
      // For now, redirect to success page with token
      return NextResponse.redirect(`${origin}/auth/success?redirect=${encodeURIComponent(`/${locale}/`)}`)
    } catch (error) {
      console.error('OAuth token validation error:', error)
      return NextResponse.redirect(`${origin}/${locale}/login?error=oauth_token_invalid`)
    }
  }
  
  if (code) {
    console.log('[Auth Callback] Processing OAuth code exchange')
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && sessionData?.session) {
      console.log('[Auth Callback] Session exchange successful', {
        userId: sessionData.session.user.id,
        email: sessionData.session.user.email,
        accessToken: sessionData.session.access_token?.substring(0, 20) + '...'
      })
      
      // Verify session is active
      const { data: { session: verifySession } } = await supabase.auth.getSession()
      console.log('[Auth Callback] Session verification:', !!verifySession)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // User'ın public.users'taki bilgilerini kontrol et
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('username, id, email')
          .eq('id', user.id)
          .single()
        
        if (userData?.username) {
          console.log('[Auth Callback] User found, redirecting to home:', userData.username)
          // User var, ana sayfaya yönlendir
          const redirectUrl = `${origin}/auth/success?redirect=${encodeURIComponent(`/${locale}`)}`
          return NextResponse.redirect(redirectUrl)
        } else {
          // User yok, oluştur
          const baseUsername = user.email?.split('@')[0] || 'user'
          const cleanUsername = baseUsername.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 20)
          
          const newUserData = {
            id: user.id,
            email: user.email,
            username: cleanUsername,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_active_at: new Date().toISOString()
          }

          const { data: createdUser, error: createError } = await supabase
            .from('users')
            .insert(newUserData)
            .select('username')
            .single()

          if (!createError && createdUser?.username) {
            console.log('[Auth Callback] New user created:', createdUser.username)
            const redirectUrl = `${origin}/auth/success?redirect=${encodeURIComponent(`/${locale}`)}`
            return NextResponse.redirect(redirectUrl)
          } else if (createError?.code === '23505') {
            // Username conflict, generate unique username
            let attempts = 0
            let uniqueUsername = ''
            
            while (attempts < 3) {
              const suffix = attempts === 0 ? Date.now().toString().slice(-4) : Math.random().toString(36).slice(-4)
              uniqueUsername = `${cleanUsername}_${suffix}`
              
              const { data: retryUser, error: retryError } = await supabase
                .from('users')
                .insert({ ...newUserData, username: uniqueUsername })
                .select('username')
                .single()

              if (!retryError && retryUser?.username) {
                console.log('[Auth Callback] User created with unique username:', retryUser.username)
                const redirectUrl = `${origin}/auth/success?redirect=${encodeURIComponent(`/${locale}`)}`
                return NextResponse.redirect(redirectUrl)
              }
              
              attempts++
            }
          }
          
          // Başarısız olursa profil setup'a yönlendir
          console.log('[Auth Callback] Redirecting to profile setup')
          const redirectUrl = `${origin}/auth/success?redirect=${encodeURIComponent(`/${locale}/profile/edit?setup=true`)}`
          return NextResponse.redirect(redirectUrl)
        }
      }
    } else {
      console.error('[Auth Callback] Session exchange failed:', error)
    }
  }
  
  console.error('[Auth Callback] OAuth failed, redirecting to login')
  return NextResponse.redirect(`${origin}/${locale}/login?error=oauth_failed`)
}
