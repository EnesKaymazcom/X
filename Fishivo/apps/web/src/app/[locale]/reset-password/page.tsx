import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'
import { redirect } from 'next/navigation'
import { ResetPasswordForm } from './reset-password-form'
import { I18nProvider } from '@/lib/i18n/context'

export default async function ResetPasswordPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params
  const supabase = await createSupabaseServerClient()
  
  // Check if user has a valid session (from password reset link)
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session) {
    console.log('No valid session for password reset')
    // Redirect to login with error message
    redirect(`/${locale}/login?error=invalid_reset_session`)
  }

  // Check if this is a recovery session
  const isRecoverySession = session.user?.aud === 'authenticated' && 
                           session.user?.recovery_sent_at

  if (!isRecoverySession) {
    console.log('Not a recovery session')
    redirect(`/${locale}/login?error=invalid_reset_session`)
  }

  return (
    <I18nProvider initialLocale={locale as 'tr' | 'en'}>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <ResetPasswordForm locale={locale} userEmail={session.user.email} />
      </div>
    </I18nProvider>
  )
}