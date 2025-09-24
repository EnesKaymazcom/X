'use client'

import { Suspense } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Mail, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { TypographyH2, TypographyH4, TypographyP } from '@/lib/typography'

// Translation helper
const getTranslation = (key: string, locale: string) => {
  const translations = {
    tr: {
      'linkExpiredTitle': 'Link Süresi Doldu',
      'linkExpiredDescription': 'Şifre sıfırlama linkinin süresi dolmuş. Lütfen yeni bir link isteyin.',
      'invalidLinkTitle': 'Geçersiz Link',
      'invalidLinkDescription': 'Link geçersiz veya zaten kullanılmış. Lütfen yeni bir şifre sıfırlama isteği gönderin.',
      'alreadyConfirmedTitle': 'Zaten Onaylandı',
      'alreadyConfirmedDescription': 'Bu hesap zaten onaylanmış.',
      'genericTitle': 'Kimlik Doğrulama Hatası',
      'genericDescription': 'Beklenmeyen bir hata oluştu.',
      'resendFailed': 'E-posta gönderilemedi',
      'resendSuccess': 'E-posta başarıyla gönderildi!',
      'helpTitle': 'Yardıma mı ihtiyacınız var?',
      'checkSpam': 'Spam klasörünüzü kontrol edin',
      'checkEmail': 'E-posta adresinin doğru olduğundan emin olun',
      'wait5Minutes': 'Birkaç dakika bekleyip tekrar deneyin',
      'resending': 'Gönderiliyor...',
      'resendEmail': 'E-postayı Tekrar Gönder',
      'backToLogin': 'Giriş Sayfasına Dön'
    },
    en: {
      'linkExpiredTitle': 'Link Expired',
      'linkExpiredDescription': 'The password reset link has expired. Please request a new one.',
      'invalidLinkTitle': 'Invalid Link',
      'invalidLinkDescription': 'The link is invalid or has already been used. Please request a new password reset.',
      'alreadyConfirmedTitle': 'Already Confirmed',
      'alreadyConfirmedDescription': 'This account has already been confirmed.',
      'genericTitle': 'Authentication Error',
      'genericDescription': 'An unexpected error occurred.',
      'resendFailed': 'Failed to resend email',
      'resendSuccess': 'Email sent successfully!',
      'helpTitle': 'Need Help?',
      'checkSpam': 'Check your spam folder',
      'checkEmail': 'Make sure the email address is correct',
      'wait5Minutes': 'Wait a few minutes and try again',
      'resending': 'Sending...',
      'resendEmail': 'Resend Email',
      'backToLogin': 'Back to Login'
    }
  }
  return translations[locale]?.[key] || translations['tr'][key] || key
}

function ErrorPageContent() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const error = searchParams.get('error')
  const error_code = searchParams.get('error_code')
  
  // Simple locale detection from URL or default to 'tr'
  const locale = pathname.includes('/en/') ? 'en' : 'tr'
  const t = (key: string) => getTranslation(key, locale)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState('')

  // Error mesajlarını belirle
  const getErrorMessage = () => {
    if (error_code === 'otp_expired' || error?.includes('expired')) {
      return {
        title: t('linkExpiredTitle'),
        description: t('linkExpiredDescription'),
        showResend: true
      }
    }
    
    if (error?.includes('invalid')) {
      return {
        title: t('invalidLinkTitle'),
        description: t('invalidLinkDescription'),
        showResend: true
      }
    }

    if (error?.includes('already_confirmed')) {
      return {
        title: t('alreadyConfirmedTitle'),
        description: t('alreadyConfirmedDescription'),
        showResend: false
      }
    }

    return {
      title: t('genericTitle'),
      description: error || t('genericDescription'),
      showResend: false
    }
  }

  const errorInfo = getErrorMessage()

  const handleResendEmail = async () => {
    setResendLoading(true)
    setResendError('')
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: localStorage.getItem('pendingVerificationEmail') 
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResendSuccess(true)
      } else {
        setResendError(data.error || t('resendFailed'))
      }
    } catch (error) {
      setResendError(t('resendFailed'))
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>
            <TypographyH2>{errorInfo.title}</TypographyH2>
          </CardTitle>
          <CardDescription>{errorInfo.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Detaylı hata mesajı */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error_code ? `${error_code}: ${error}` : error}
              </AlertDescription>
            </Alert>
          )}

          {/* Resend email başarı mesajı */}
          {resendSuccess && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                {t('resendSuccess')}
              </AlertDescription>
            </Alert>
          )}

          {/* Resend email hata mesajı */}
          {resendError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{resendError}</AlertDescription>
            </Alert>
          )}

          {/* Yardımcı bilgiler */}
          <div className="rounded-lg bg-muted p-4">
            <TypographyH4 className="mb-2">
              {t('helpTitle')}
            </TypographyH4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• {t('checkSpam')}</li>
              <li>• {t('checkEmail')}</li>
              <li>• {t('wait5Minutes')}</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          {errorInfo.showResend && !resendSuccess && (
            <Button
              onClick={handleResendEmail}
              disabled={resendLoading}
              className="w-full"
              variant="default"
            >
              {resendLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {t('resending')}
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  {t('resendEmail')}
                </>
              )}
            </Button>
          )}

          <Button variant="outline" className="w-full" asChild>
            <Link href={`/${locale}/login`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToLogin')}
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
        <TypographyP className="text-muted-foreground">Yükleniyor...</TypographyP>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ErrorPageContent />
    </Suspense>
  )
}