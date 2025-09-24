'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useFormState } from 'react-dom'
import { Eye, EyeOff, Lock, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/lib/i18n'
import { updatePasswordAction } from './actions'
import Link from 'next/link'

interface ResetPasswordFormProps {
  locale: string
  userEmail?: string | null
}

export function ResetPasswordForm({ locale, userEmail }: ResetPasswordFormProps) {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const passwordSchema = z.object({
    password: z
      .string()
      .min(8, t('login.passwordMin'))
      .regex(/[A-Z]/, t('login.passwordUppercase'))
      .regex(/[a-z]/, t('login.passwordLowercase'))
      .regex(/[0-9]/, t('login.passwordNumber')),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('login.passwordMismatch'),
    path: ['confirmPassword'],
  })

  type PasswordFormData = z.infer<typeof passwordSchema>

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  })

  const [state, formAction] = useFormState(updatePasswordAction, {
    errors: {},
    success: false,
  })

  // Password strength indicators
  const password = form.watch('password')
  const hasMinLength = password?.length >= 8
  const hasUppercase = /[A-Z]/.test(password || '')
  const hasLowercase = /[a-z]/.test(password || '')
  const hasNumber = /[0-9]/.test(password || '')

  const handleSubmit = async (data: PasswordFormData) => {
    const formData = new FormData()
    formData.append('password', data.password)
    formData.append('locale', locale)
    
    formAction(formData)
  }

  // Handle success state
  if (state.success || isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>{t('login.passwordUpdated')}</CardTitle>
            <CardDescription>{t('login.passwordUpdateSuccess')}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={`/${locale}/login`}>{t('login.backToLogin')}</Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('login.resetPassword')}</CardTitle>
          <CardDescription>
            {userEmail ? (
              <>
                {t('login.resettingPasswordFor')} <strong>{userEmail}</strong>
              </>
            ) : (
              t('login.enterNewPassword')
            )}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4">
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">{t('login.newPassword')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('login.passwordPlaceholder')}
                  {...form.register('password')}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Password Strength Indicators */}
            {password && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">{t('login.passwordRequirements')}</p>
                <div className="space-y-1">
                  <PasswordRequirement met={hasMinLength} text={t('login.passwordMin')} />
                  <PasswordRequirement met={hasUppercase} text={t('login.passwordUppercase')} />
                  <PasswordRequirement met={hasLowercase} text={t('login.passwordLowercase')} />
                  <PasswordRequirement met={hasNumber} text={t('login.passwordNumber')} />
                </div>
              </div>
            )}

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('login.confirmPassword')}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t('login.confirmPasswordPlaceholder')}
                  {...form.register('confirmPassword')}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Error Alert */}
            <AnimatePresence>
              {state.errors?._form && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Alert variant="destructive">
                    <AlertDescription>
                      {state.errors._form[0]}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-2">
            <Button 
              type="submit" 
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {t('login.updating')}
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  {t('login.updatePassword')}
                </>
              )}
            </Button>
            
            <Button variant="ghost" asChild className="w-full">
              <Link href={`/${locale}/login`}>
                {t('login.backToLogin')}
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs ${met ? 'text-green-600' : 'text-muted-foreground'}`}>
      {met ? (
        <CheckCircle className="h-3 w-3" />
      ) : (
        <XCircle className="h-3 w-3" />
      )}
      <span>{text}</span>
    </div>
  )
}