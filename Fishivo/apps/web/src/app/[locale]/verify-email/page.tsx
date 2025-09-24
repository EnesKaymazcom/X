'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Mail, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useTranslation, useLocale } from '@/lib/i18n'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || localStorage.getItem('pendingVerificationEmail')
  const { t } = useTranslation()
  const { locale } = useLocale()
  
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState('')

  const handleResendEmail = async () => {
    if (!email || resendLoading) return

    setResendLoading(true)
    setResendError('')
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setResendSuccess(true)
        // Success message will auto-hide after 5 seconds
        setTimeout(() => setResendSuccess(false), 5000)
      } else {
        setResendError(data.error || t('auth.verifyEmail.resendFailed'))
      }
    } catch (error) {
      setResendError(t('auth.verifyEmail.resendFailed'))
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">{t('auth.verifyEmail.title')}</CardTitle>
          <CardDescription>
            {t('auth.verifyEmail.subtitle')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Email info */}
          {email && (
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">{t('auth.verifyEmail.emailSentTo')}</p>
              <p className="font-medium">{email}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">{t('auth.verifyEmail.whatNext')}</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                  1
                </div>
                <p className="text-sm text-muted-foreground">{t('auth.verifyEmail.step1')}</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                  2
                </div>
                <p className="text-sm text-muted-foreground">{t('auth.verifyEmail.step2')}</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                  3
                </div>
                <p className="text-sm text-muted-foreground">{t('auth.verifyEmail.step3')}</p>
              </div>
            </div>
          </div>

          {/* Resend success message */}
          {resendSuccess && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {t('auth.verifyEmail.resendSuccess')}
              </AlertDescription>
            </Alert>
          )}

          {/* Resend error message */}
          {resendError && (
            <Alert variant="destructive">
              <AlertDescription>{resendError}</AlertDescription>
            </Alert>
          )}


          {/* Help section */}
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">{t('auth.verifyEmail.notReceived')}</p>
              <ul className="text-sm space-y-1">
                <li>• {t('auth.verifyEmail.checkSpam')}</li>
                <li>• {t('auth.verifyEmail.checkEmail')}</li>
                <li>• {t('auth.verifyEmail.waitFewMinutes')}</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={handleResendEmail}
            disabled={resendLoading || !email}
            className="w-full"
            variant="default"
          >
            {resendLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {t('auth.verifyEmail.resending')}
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                {t('auth.verifyEmail.resendEmail')}
              </>
            )}
          </Button>

          <Button variant="outline" className="w-full" asChild>
            <Link href={`/${locale}/login`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('auth.verifyEmail.backToLogin')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  )
}