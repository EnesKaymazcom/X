'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/loading-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { TypographyH3, TypographyMuted, TypographySmall } from '@/lib/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LogIn, UserPlus, Eye, EyeOff, Check, X, Loader2, ArrowLeft, Mail } from 'lucide-react'
import { GoogleIcon } from '@/components/icons/google-icon'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { signInAction, signUpAction, signInWithOAuthAction, forgotPasswordAction } from './actions'
import { safeDetectLanguage } from '@/lib/language-utils'
import { useTranslation } from '@/lib/i18n'
import { isUsernameValid } from '@/lib/utils'

interface LoginFormProps {
  locale: string
  searchParams?: { message?: string; error?: string }
}

export function LoginForm({ 
  locale,
  searchParams
}: LoginFormProps) {
  const { t } = useTranslation()
  const [isSignup, setIsSignup] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')
  const [showUrlError, setShowUrlError] = useState(true)
  const [message, setMessage] = useState('')
  const [emailAvailable, setEmailAvailable] = useState<{ available: boolean; message: string } | null>(null)
  const [usernameAvailable, setUsernameAvailable] = useState<{ available: boolean; message: string } | null>(null)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')
  const router = useRouter()

  // Schema definitions with i18n
  const loginSchema = z.object({
    email: z
      .string()
      .min(1, t('login.emailPlaceholder'))
      .email(t('login.invalidEmail')),
    password: z
      .string()
      .min(1, t('common.password'))
      .min(6, t('login.passwordTooShort'))
  })

  const signupSchema = z.object({
    email: z
      .string()
      .min(1, t('login.emailPlaceholder'))
      .email(t('login.invalidEmail')),
    username: z
      .string()
      .min(1, t('common.username'))
      .min(4, t('login.usernameMinLength'))
      .max(15, t('login.usernameMaxLength'))
      .regex(/^[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*$/, t('login.usernameFormat'))
      .refine(val => !val.includes('@'), { message: t('login.usernameNoEmail') })
      .refine(val => !/\.\.|^\.|\.$/.test(val), { message: t('login.usernameNoDots') })
      .refine(val => !/^[0-9]+$/.test(val), { message: t('login.usernameNotOnlyNumbers') })
      .refine(val => /^[a-zA-Z]/.test(val), { message: t('login.usernameMustStartWithLetter') })
      .refine(val => {
        const validation = isUsernameValid(val)
        return validation.isValid
      }, { message: t('login.usernameInappropriate') }),
    password: z
      .string()
      .min(1, t('common.password'))
      .min(8, t('login.passwordMinLength')),
    firstName: z
      .string()
      .min(1, t('login.firstName'))
      .min(2, t('login.firstNameMinLength')),
    lastName: z
      .string()
      .min(1, t('login.lastName'))
      .min(2, t('login.lastNameMinLength')),
    termsAccepted: z
      .boolean()
      .refine(val => val === true, {
        message: t('login.mustAcceptTerms')
      })
  })

  const forgotPasswordSchema = z.object({
    email: z
      .string()
      .min(1, t('login.emailPlaceholder'))
      .email(t('login.invalidEmail'))
  })

  type LoginFormData = z.infer<typeof loginSchema>
  type SignupFormData = z.infer<typeof signupSchema>
  type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
  type FormData = SignupFormData | LoginFormData | ForgotPasswordFormData

  const form = useForm<FormData>({
    resolver: zodResolver(
      showForgotPassword ? forgotPasswordSchema : 
      isSignup ? signupSchema : 
      loginSchema
    ) as any,
    defaultValues: {
      email: '',
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      termsAccepted: false
    }
  })

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setForgotPasswordLoading(true)
    setMessage('')
    
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('locale', locale)
    
    try {
      const result = await forgotPasswordAction(null, formData)
      
      if (result.errors) {
        if (result.errors._form) {
          setMessage(result.errors._form[0])
        } else {
          setMessage('Form hatası oluştu')
        }
      } else if (result.success) {
        setForgotPasswordSuccess(true)
        setMessage('')
      }
    } catch (error) {
      setMessage(t('login.unexpectedError'))
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  const onSubmit = async (data: any) => {
    
    if (showForgotPassword) {
      await handleForgotPassword(data as ForgotPasswordFormData)
      return
    }
    
    setIsLoading(true)
    setMessage('')
    
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)
    
    if (isSignup) {
      formData.append('username', data.username)
      formData.append('firstName', data.firstName)
      formData.append('lastName', data.lastName)
    }

    try {
      let result
      if (isSignup) {
        result = await signUpAction(null, formData)
      } else {
        result = await signInAction(null, formData)
      }

      if (result.errors) {
        if (result.errors._form) {
          setMessage(result.errors._form[0])
        } else {
          setMessage('Form hatası oluştu')
        }
      } else if (result.success) {
        if (isSignup && result.needsVerification) {
          // Email doğrulaması gerekiyor
          setShowVerificationMessage(true)
          setVerificationEmail(data.email)
          // Email'i localStorage'a kaydet (resend için)
          localStorage.setItem('pendingVerificationEmail', data.email)
          setMessage('')
          // Verify-email sayfasına yönlendir
          setTimeout(() => {
            router.push(`/${locale}/verify-email?email=${encodeURIComponent(data.email)}`)
          }, 500)
        } else {
          // Success - redirect will happen automatically
          window.location.href = `/${locale}`
        }
      }
    } catch (error: any) {
      if (error?.digest?.includes('NEXT_REDIRECT')) {
        // This is a redirect, not an error
      } else {
        setMessage('Bir hata oluştu. Lütfen tekrar deneyin.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await signInWithOAuthAction('google')
    } catch (error: any) {
      if (error?.digest?.includes('NEXT_REDIRECT')) {
        // This is a redirect, not an error
      } else {
        setMessage(t('login.googleSignInError'))
        setIsGoogleLoading(false)
      }
    }
  }

  const toggleMode = () => {
    setIsSignup(!isSignup)
    setPasswordValue('')
    setMessage('')
    form.reset()
    form.clearErrors()
    setShowUrlError(false)
    router.replace(`/${locale}/login`)
    
    setTimeout(() => {
      const scrollContainer = document.querySelector('.show-scrollbar')
      if (scrollContainer) {
        scrollContainer.scrollTop = 0
      }
    }, 50)
  }

  const showForgotPasswordMode = () => {
    setShowForgotPassword(true)
    setIsSignup(false)
    setForgotPasswordSuccess(false)
    setMessage('')
    form.reset()
    form.clearErrors()
    setShowUrlError(false)
    router.replace(`/${locale}/login`)
  }

  const backToLogin = () => {
    setShowForgotPassword(false)
    setForgotPasswordSuccess(false)
    setMessage('')
    form.reset()
    form.clearErrors()
    setShowUrlError(false)
    router.replace(`/${locale}/login`)
  }

  // Automatically clear error message from URL
  useEffect(() => {
    if (searchParams?.message || searchParams?.error) {
      setShowUrlError(true)
      
      // Handle specific error messages
      if (searchParams?.error === 'invalid_reset_session') {
        setMessage(t('login.invalidResetSession') || 'Şifre sıfırlama oturumu geçersiz veya süresi dolmuş. Lütfen tekrar deneyin.')
      } else if (searchParams?.message) {
        setMessage(searchParams.message)
      } else if (searchParams?.error) {
        setMessage(searchParams.error)
      }
      
      const timer = setTimeout(() => {
        setShowUrlError(false)
        setMessage('')
        router.replace(`/${locale}/login`)
      }, 7000)
      
      return () => clearTimeout(timer)
    }
  }, [searchParams?.message, searchParams?.error, router, locale, t])

  // Clear error message when form submission is successful
  useEffect(() => {
    if (isLoading) {
      setShowUrlError(false)
    }
  }, [isLoading])

  // Debounced availability check
  const checkAvailability = useCallback(async (email?: string, username?: string) => {
    if (!email && !username) return

    try {
      if (email) setCheckingEmail(true)
      if (username) setCheckingUsername(true)

      const response = await fetch('/api/users/check-availability', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email?.toLowerCase(), 
          username 
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const apiResult = await response.json()
      const result = apiResult.data

      if (email && result.email) {
        setEmailAvailable(result.email)
      }
      if (username && result.username) {
        setUsernameAvailable(result.username)
      }
    } catch (error) {
      // Availability check failed silently
      if (email) {
        setEmailAvailable({ available: false, message: t('login.emailCheckError') })
      }
      if (username) {
        setUsernameAvailable({ available: false, message: t('login.usernameCheckError') })
      }
    } finally {
      if (email) setCheckingEmail(false)
      if (username) setCheckingUsername(false)
    }
  }, [t])

  // Email availability check with debounce
  useEffect(() => {
    if (!isSignup) return
    
    const email = form.watch('email')
    if (!email || email.length < 5) {
      setEmailAvailable(null)
      return
    }

    const timer = setTimeout(() => {
      checkAvailability(email, undefined)
    }, 800)

    return () => clearTimeout(timer)
  }, [form.watch('email'), isSignup, checkAvailability])

  // Username availability check with debounce
  useEffect(() => {
    if (!isSignup) return
    
    const username = form.watch('username')
    if (!username || username.length < 3) {
      setUsernameAvailable(null)
      return
    }

    const timer = setTimeout(() => {
      checkAvailability(undefined, username)
    }, 500)

    return () => clearTimeout(timer)
  }, [form.watch('username'), isSignup, checkAvailability])

  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password)
    }
    
    const score = Object.values(checks).filter(Boolean).length
    return { checks, score }
  }

  // Container height animation system
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined)
  const [cardElement, setCardElement] = useState<HTMLDivElement | null>(null)

  const cardRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      setCardElement(node)
      setCardHeight(node.scrollHeight)
    }
  }, [isSignup, showForgotPassword, forgotPasswordSuccess, form.watch('email'), form.watch('username'), form.watch('password'), form.watch('firstName'), form.watch('lastName')])

  // Recalculate height on form state changes
  useEffect(() => {
    if (cardElement) {
      const updateHeight = () => {
        setCardHeight(cardElement.scrollHeight)
      }
      
      requestAnimationFrame(updateHeight)
    }
  }, [
    cardElement,
    form.formState.errors,
    emailAvailable,
    usernameAvailable,
    checkingEmail,
    checkingUsername,
    showUrlError,
    passwordValue,
    showForgotPassword,
    forgotPasswordSuccess,
    message,
    isSignup
  ])

  return (
    <div className="w-full max-w-md mx-auto relative">
      <motion.div
        animate={{ height: cardHeight ? cardHeight : 'auto' }}
        transition={{ type: 'spring', duration: 0.5, damping: 30, stiffness: 200 }}
        className="w-full"
      >
        <div ref={cardRef}>
        <CardHeader className="space-y-2 w-full pb-3">
          <TypographyH3 className="text-left">
            {showVerificationMessage ? 
              t('login.verificationEmailSent') :
              (showForgotPassword ? 
                (forgotPasswordSuccess ? t('login.emailSent') : t('login.forgotPassword')) :
                (isSignup ? t('login.createAccount') : t('login.signIn'))
              )
            }
          </TypographyH3>
          <TypographyMuted className="text-left text-sm leading-tight">
            {showVerificationMessage ? 
              t('login.checkEmailForVerification') :
              (showForgotPassword ? 
                (forgotPasswordSuccess ? t('login.passwordResetSent') : t('login.enterEmailForReset')) :
                (isSignup 
                  ? t('login.enterDetailsToJoin')
                  : t('login.enterEmailToSignIn'))
              )
            }
          </TypographyMuted>
        </CardHeader>
        
        <form 
          onSubmit={form.handleSubmit(onSubmit)}
          role="form"
          aria-label={isSignup ? t('login.signUpFormAriaLabel') : t('login.signInFormAriaLabel')}
          className="max-h-[90vh] w-full"
        >
          <input type="hidden" name="locale" value={locale} />
          
          <CardContent className="w-full pb-2">
            <div className="flex flex-col gap-3">
              {showVerificationMessage ? (
                <div className="text-center space-y-4">
                  <TypographySmall className="text-muted-foreground hidden">
                    {verificationEmail}
                  </TypographySmall>
                </div>
              ) : forgotPasswordSuccess ? (
                <div className="text-center space-y-4">
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                      <Mail className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <TypographySmall className="text-muted-foreground">
                    {t('login.checkEmailInbox')}
                  </TypographySmall>
                  <TypographySmall className="text-muted-foreground">
                    {t('login.emailNotReceived')}
                  </TypographySmall>
                </div>
              ) : showForgotPassword ? (
                <div className="space-y-2">
                  <Label htmlFor="email">{t('common.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('login.emailPlaceholder')}
                    {...form.register('email')}
                    disabled={forgotPasswordLoading}
                  />
                  {form.formState.errors.email && (
                    <TypographySmall className="text-red-400">
                      {form.formState.errors.email.message}
                    </TypographySmall>
                  )}
                </div>
              ) : isSignup && (
                <>
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full h-10 sm:h-11"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading || isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <TypographySmall>{t('login.connectingWithGoogle')}</TypographySmall>
                      </>
                    ) : (
                      <>
                        <GoogleIcon className="mr-1 h-4 w-4" />
                        <TypographySmall>
                          {t('login.signUpWithGoogle')}
                        </TypographySmall>
                      </>
                    )}
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center">
                      <TypographySmall className="bg-card px-2 text-muted-foreground uppercase">
                        {t('login.or')}
                      </TypographySmall>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="grid gap-1">
                      <Label htmlFor="firstName" >{t('login.firstName')}</Label>
                      <Input
                        id="firstName"
                        {...form.register('firstName')}
                        placeholder={t('login.firstNamePlaceholder')}
                        disabled={isLoading}
                        className="h-10"
                      />
                      {form.formState.errors.firstName && (
                        <TypographySmall className="text-red-400">
                          {form.formState.errors.firstName.message}
                        </TypographySmall>
                      )}
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="lastName" >{t('login.lastName')}</Label>
                      <Input
                        id="lastName"
                        {...form.register('lastName')}
                        placeholder={t('login.lastNamePlaceholder')}
                        disabled={isLoading}
                        className="h-10"
                      />
                      {form.formState.errors.lastName && (
                        <TypographySmall className="text-red-400">
                          {form.formState.errors.lastName.message}
                        </TypographySmall>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              {!showForgotPassword && (
                <>
                  <div className="grid gap-1">
                    <Label htmlFor="email" >{t('common.email')}</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        {...form.register('email')}
                        placeholder={t('login.emailPlaceholder')}
                        disabled={isLoading}
                        className="h-10 pr-10"
                        autoComplete="email"
                      />
                      {isSignup && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {checkingEmail ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : emailAvailable ? (
                            emailAvailable.available ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-400" />
                            )
                          ) : null}
                        </div>
                      )}
                    </div>
                    {form.formState.errors.email && (
                      <TypographySmall className="text-red-400">
                        {form.formState.errors.email.message}
                      </TypographySmall>
                    )}
                    {isSignup && emailAvailable && !emailAvailable.available && !form.formState.errors.email && (
                      <TypographySmall className="text-red-400">
                        {t(`auth.${emailAvailable.message}`) || emailAvailable.message}
                      </TypographySmall>
                    )}
                  </div>
                  
                  {isSignup && (
                    <div className="grid gap-1">
                      <Label htmlFor="username" >{t('common.username')}</Label>
                      <div className="relative">
                        <Input
                          id="username"
                          {...form.register('username')}
                          placeholder={t('login.usernamePlaceholder')}
                          disabled={isLoading}
                          className="h-10 pr-10"
                          autoComplete="username"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {checkingUsername ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : usernameAvailable ? (
                            usernameAvailable.available ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-400" />
                            )
                          ) : null}
                        </div>
                      </div>
                      {form.formState.errors.username && (
                        <TypographySmall className="text-red-400">
                          {form.formState.errors.username.message}
                        </TypographySmall>
                      )}
                      {usernameAvailable && !usernameAvailable.available && !form.formState.errors.username && (
                        <TypographySmall className="text-red-400">
                          {t(`auth.${usernameAvailable.message}`) || usernameAvailable.message}
                        </TypographySmall>
                      )}
                      {usernameAvailable && usernameAvailable.available && !form.formState.errors.username && (
                        <TypographySmall className="text-green-600">
                          {t(`auth.${usernameAvailable.message}`) || usernameAvailable.message}
                        </TypographySmall>
                      )}
                    </div>
                  )}
                  
                  <div className="grid gap-1">
                    <div className="flex items-center">
                      <Label htmlFor="password" >{t('common.password')}</Label>
                      {!isSignup && (
                        <button
                          type="button"
                          onClick={showForgotPasswordMode}
                          className="ml-auto inline-block underline-offset-4 hover:underline bg-transparent border-none cursor-pointer p-0 h-auto"
                        >
                          <TypographySmall>{t('login.forgotPasswordLink')}</TypographySmall>
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        {...form.register('password', {
                          onChange: (e) => setPasswordValue(e.target.value)
                        })}
                        placeholder={t('login.passwordPlaceholder')}
                        disabled={isLoading}
                        className="h-10 pr-12"
                        autoComplete={isSignup ? "new-password" : "current-password"}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    {isSignup && passwordValue && (
                      <div className="mt-2">
                        {(function() {
                          const { score } = getPasswordStrength(passwordValue)
                          const strength = score < 2 ? t('login.passwordWeak') : score < 3 ? t('login.passwordMedium') : t('login.passwordStrong')
                          const strengthColor = score < 2 ? 'text-red-500' : score < 3 ? 'text-yellow-500' : 'text-green-500'
                          
                          return (
                            <TypographySmall className={`font-medium ${strengthColor}`}>
                              {t('login.passwordStrength')}: {strength}
                            </TypographySmall>
                          )
                        })()}
                      </div>
                    )}
                    {form.formState.errors.password && (
                      <TypographySmall className="text-red-400">
                        {form.formState.errors.password.message}
                      </TypographySmall>
                    )}
                  </div>
                  
                  {isSignup && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="termsAccepted"
                        checked={form.watch('termsAccepted')}
                        onCheckedChange={(checked: boolean) => {
                          form.setValue('termsAccepted', checked)
                        }}
                      />
                      <div className="flex-1 -mt-0.5">
                        <Label
                          htmlFor="termsAccepted"
                          className="font-normal cursor-pointer leading-tight"
                        >
                          {locale === 'en' ? (
                            <>
                              I agree to the{' '}
                              <a
                                href={`/${locale}/terms`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-1 hover:text-primary"
                              >
                                {t('login.termsShort')}
                              </a>
                              {' '}{t('login.and')}{' '}
                              <a
                                href={`/${locale}/privacy`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-1 hover:text-primary"
                              >
                                {t('login.privacyShort')}
                              </a>
                            </>
                          ) : (
                            <>
                              <a
                                href={`/${locale}/terms`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-1 hover:text-primary"
                              >
                                {t('login.termsShort')}
                              </a>
                              {' '}{t('login.and')}{' '}
                              <a
                                href={`/${locale}/privacy`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-1 hover:text-primary"
                              >
                                {t('login.privacyShort')}
                              </a>
                              {t('login.iAcceptShort')}
                            </>
                          )}
                        </Label>
                        {form.formState.errors.termsAccepted && (
                          <TypographySmall className="text-red-400 mt-1">
                            {form.formState.errors.termsAccepted.message}
                          </TypographySmall>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {/* Error messages */}
              {message && (
                <Alert variant="destructive">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
              
              {searchParams?.message && showUrlError && (
                <Alert variant={searchParams.message.includes('Error') || searchParams.message.includes('hata') ? 'destructive' : 'default'} className="relative">
                  <AlertDescription className="pr-8">
                    {t(`auth.${decodeURIComponent(searchParams.message)}`) || decodeURIComponent(searchParams.message)}
                  </AlertDescription>
                  <button
                    onClick={() => {
                      setShowUrlError(false)
                      router.replace(`/${locale}/login`)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </Alert>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex-col gap-4 w-full pt-6">
            {forgotPasswordSuccess ? (
              <Button 
                type="button"
                variant="outline"
                className="w-full h-10 sm:h-11"
                onClick={backToLogin}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                <TypographySmall>{t('login.backToLogin')}</TypographySmall>
              </Button>
            ) : showForgotPassword ? (
              <>
                <LoadingButton 
                  type="submit" 
                  className="w-full h-10 sm:h-11"
                  loading={forgotPasswordLoading}
                  loadingText={t('login.sending')}
                >
                  <Mail className="mr-1 h-4 w-4" />
                  <TypographySmall>{t('login.sendPasswordReset')}</TypographySmall>
                </LoadingButton>
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full h-10 sm:h-11"
                  onClick={backToLogin}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  <TypographySmall>{t('login.goBack')}</TypographySmall>
                </Button>
              </>
            ) : (
              <LoadingButton 
                type="submit" 
                className="w-full h-10 sm:h-11"
                loading={isLoading}
                disabled={isGoogleLoading}
                loadingText={isSignup ? t('login.signingUp') : t('login.signingIn')}
              >
                {isSignup ? (
                  <UserPlus className="mr-1 h-4 w-4" />
                ) : (
                  <LogIn className="mr-1 h-4 w-4" />
                )}
                <TypographySmall>
                  {isSignup ? t('login.signUp') : t('login.signIn')}
                </TypographySmall>
              </LoadingButton>
            )}
            
            {!isSignup && !showForgotPassword && !forgotPasswordSuccess && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center">
                    <TypographySmall className="bg-card px-2 text-muted-foreground uppercase">
                      {t('login.or')}
                    </TypographySmall>
                  </div>
                </div>
                <LoadingButton 
                  type="button"
                  variant="outline"
                  className="w-full h-10 sm:h-11"
                  onClick={handleGoogleSignIn}
                  loading={isGoogleLoading}
                  disabled={isLoading}
                  loadingText={t('login.connectingWithGoogle')}
                >
                  <GoogleIcon className="mr-1 h-4 w-4" />
                  <TypographySmall>
                    {t('login.signInWithGoogle')}
                  </TypographySmall>
                </LoadingButton>
              </>
            )}
            
            {!showForgotPassword && !forgotPasswordSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.07, duration: 0.22 }}
                className="text-center mt-3 min-h-[2.5rem] flex items-center justify-center border-t border-border/50 pt-3"
              >
                <TypographySmall className="text-muted-foreground">
                  {isSignup ? t('login.alreadyHaveAccount') : t('login.dontHaveAccount')}{' '}
                  <Button 
                    type="button"
                    variant="link"
                    className="p-0 h-auto underline-offset-4 inline font-medium text-primary hover:text-primary/80"
                    onClick={toggleMode}
                    disabled={isLoading || isGoogleLoading}
                  >
                    {isSignup ? t('login.signIn') : t('login.signUp')}
                  </Button>
                </TypographySmall>
              </motion.div>
            )}
          </CardFooter>
        </form>
      </div>
      </motion.div>
    </div>
  )
}
