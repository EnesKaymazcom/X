import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'
import { redirect } from 'next/navigation'
import { GlowingCard } from '@/components/ui/glowing-card'
import { LoginForm } from './login-form'
import { LoginPageClient } from './login-page-client'

export const dynamic = 'force-dynamic'

export default async function LoginPage(
  props: {
    params: Promise<{ locale: string }>
    searchParams: Promise<{ message?: string; error?: string }>
  }
) {
  const { locale } = await props.params
  const searchParams = await props.searchParams;
  const supabase = await createSupabaseServerClient()

  const { data: { session } } = await supabase.auth.getSession()

  if (session?.user) {
    const { data: userData } = await supabase
      .from('users')
      .select('username')
      .eq('id', session.user.id)
      .single()
    
    if (userData?.username) {
      return redirect(`/${locale}/${userData.username}`)
    } else {
      return redirect(`/${locale}/profile/edit?setup=true`)
    }
  }

  return (
    <LoginPageClient>
      <GlowingCard className="w-full max-w-md mx-auto">
        <LoginForm 
          locale={locale}
          searchParams={searchParams}
        />
      </GlowingCard>
    </LoginPageClient>
  )
}
