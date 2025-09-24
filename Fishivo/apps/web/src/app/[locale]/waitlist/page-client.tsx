"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { GlowingCard } from "@/components/ui/glowing-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Mail, ArrowLeft, Users, Star, Crown, Instagram, Youtube } from "lucide-react"
import { motion } from "framer-motion"
import { TypographyH1, TypographyH2, TypographyH3, TypographyP, TypographyMuted } from "@/lib/typography"
import { FishivoLogo } from "@/components/ui/fishivo-logo"
import { SparklesCore } from "@/components/ui/sparkles"
import { LocalizedLink } from "@/components/ui/localized-link"
import { XIcon } from "@/components/icons/x-icon"
import { PrivacyDialog } from "@/components/ui/privacy-dialog"
import { TermsDialog } from "@/components/ui/terms-dialog"
import { CommunityGuidelinesDialog } from "@/components/ui/community-guidelines-dialog"

interface TranslationProps {
  translations: {
    title: string
    subtitle: string
    form: {
      email: {
        placeholder: string
        error: string
      }
      submit: string
      submitting: string
      success: {
        title: string
        description: string
        backButton: string
      }
    }
    benefits: {
      earlyAccess: {
        title: string
        description: string
      }
      specialBenefits: {
        title: string
        description: string
      }
      vipCommunity: {
        title: string
        description: string
      }
    }
    footer: {
      copyright: string
      privacyPolicy: string
      termsOfService: string
    }
  }
  locale: 'en' | 'tr'
}

export default function WaitlistPageClient({ translations, locale }: TranslationProps) {
  const formSchema = useMemo(() => z.object({
    email: z.string().email(translations.form.email.error),
  }), [translations.form.email.error])
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [waitlistSuccess, setWaitlistSuccess] = useState(false)
  const [message, setMessage] = useState('')
  const [formKey, setFormKey] = useState(0)
  
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined)
  const [cardElement, setCardElement] = useState<HTMLDivElement | null>(null)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [communityOpen, setCommunityOpen] = useState(false)
  
  const form = useForm<{
    email: string
  }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })
  
  useEffect(() => {
    if (formKey > 0) {
      form.reset({
        email: "",
      })
      form.clearErrors()
    }
  }, [formKey, form])

  const cardRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      setCardElement(node)
      setCardHeight(node.scrollHeight)
    }
  }, [waitlistSuccess, message, isSubmitting, formKey])

  useEffect(() => {
    if (cardElement) {
      const updateHeight = () => {
        const newHeight = cardElement.scrollHeight
        setCardHeight(newHeight)
      }
      requestAnimationFrame(updateHeight)
    }
  }, [
    cardElement,
    form.formState.errors,
    waitlistSuccess,
    message,
    isSubmitting,
    formKey
  ])

  async function onSubmit(values: {
    email: string
  }) {
    setIsSubmitting(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          referrer: typeof window !== 'undefined' ? (document.referrer || window.location.href) : undefined,
          referral_code: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('ref') : undefined
        })
      })

      const result = await response.json()
      
      if (!response.ok || !result.success) {
        // Handle specific error cases
        if (result.error === 'EMAIL_ALREADY_EXISTS') {
          throw new Error('Bu email adresi zaten kayıtlı!')
        }
        throw new Error(result.message || 'Kayıt sırasında bir hata oluştu')
      }

      setWaitlistSuccess(true)
      setMessage(result.message || 'Successfully added to waitlist!')
      form.reset()
    } catch (error) {
      setMessage(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const backToForm = () => {
    setWaitlistSuccess(false)
    setMessage('')
    setFormKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen relative w-full bg-black flex flex-col overflow-hidden">
      {/* Background Video */}
      <motion.div 
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.8 }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        >
          <source src="/shark-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/30" />
      </motion.div>
      
      <div className="w-full absolute inset-0 z-10">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>
      
      <div className="w-full flex-1 pt-navbar relative z-20 flex items-center">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full py-16">
        
        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex justify-center mb-16">
              <FishivoLogo size="xl" showText={true} forceWhite={true} />
            </div>
            <TypographyH2 className="text-xl md:text-2xl mb-2 text-white">
              {translations.title}
            </TypographyH2>
            <TypographyP className="text-xl mb-12 max-w-5xl mx-auto text-white/90">
              {translations.subtitle}
            </TypographyP>
          </motion.div>
        </div>

        {/* Form Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-20"
        >
          <div className="w-full max-w-lg mx-auto">
            {waitlistSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-4"
              >
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-green-500/20 p-3">
                    <Mail className="h-7 w-7 text-green-400" />
                  </div>
                </div>
                <p className="text-base text-white/90">
                  {translations.form.success.title}
                </p>
              </motion.div>
            ) : (
              <Form {...form} key={formKey}>
                <form 
                  id="waitlist-form" 
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="w-full"
                >
                  <div className="flex gap-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder={translations.form.email.placeholder} 
                              className="h-10 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20"
                              {...field} 
                              disabled={isSubmitting}
                              autoComplete="email"
                            />
                          </FormControl>
                          <FormMessage className="absolute mt-1 text-red-400" />
                        </FormItem>
                      )}
                    />
                    <LoadingButton
                      type="submit" 
                      className="h-10 px-6 bg-white text-black hover:bg-white/90" 
                      loading={isSubmitting}
                      loadingText={translations.form.submitting}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      <span className="text-sm font-medium">{translations.form.submit}</span>
                    </LoadingButton>
                  </div>
                  
                  {message && (
                    <Alert variant="destructive" className="mt-4 bg-red-500/20 border-red-500/50">
                      <AlertDescription className="text-white">{message}</AlertDescription>
                    </Alert>
                  )}
                </form>
              </Form>
            )}
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20 max-w-6xl mx-auto"
        >
          <div className="text-center">
            <div className="bg-white/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6">
              <Star className="h-[14px] w-[14px] text-primary" />
            </div>
            <TypographyH3 className="text-xl mb-4 text-white">{translations.benefits.earlyAccess.title}</TypographyH3>
            <p className="text-white/70">
              {translations.benefits.earlyAccess.description}
            </p>
          </div>
          <div className="text-center">
            <div className="bg-white/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6">
              <Crown className="h-[14px] w-[14px] text-primary" />
            </div>
            <TypographyH3 className="text-xl mb-4 text-white">{translations.benefits.specialBenefits.title}</TypographyH3>
            <p className="text-white/70">
              {translations.benefits.specialBenefits.description}
            </p>
          </div>
          <div className="text-center">
            <div className="bg-white/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6">
              <Users className="h-[14px] w-[14px] text-primary" />
            </div>
            <TypographyH3 className="text-xl mb-4 text-white">{translations.benefits.vipCommunity.title}</TypographyH3>
            <p className="text-white/70">
              {translations.benefits.vipCommunity.description}
            </p>
          </div>
        </motion.div>

      </div>
      </div>

      {/* Footer - Full Viewport Width */}
      <div className="w-full border-t border-white/20 bg-black/50 backdrop-blur-sm relative z-20 mt-auto">
      <div className="flex flex-col lg:flex-row justify-between items-center px-8 py-8 gap-4">
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 lg:gap-6">
          <span className="text-xs text-white/70">
            {translations.footer.copyright}
          </span>
          <button
            onClick={() => setPrivacyOpen(true)}
            className="text-xs text-white/70 hover:text-white transition-colors"
          >
            {translations.footer.privacyPolicy}
          </button>
          <button
            onClick={() => setTermsOpen(true)}
            className="text-xs text-white/70 hover:text-white transition-colors"
          >
            {translations.footer.termsOfService}
          </button>
          <button
            onClick={() => setCommunityOpen(true)}
            className="text-xs text-white/70 hover:text-white transition-colors"
          >
            {locale === 'en' ? 'Community Guidelines' : 'Topluluk Kuralları'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 mr-4">
            {locale === 'en' ? (
              <>
                <span className="text-xs text-white font-semibold">EN</span>
                <span className="text-xs text-white/70">/</span>
                <a 
                  href="/tr/waitlist" 
                  className="text-xs text-white/70 hover:text-white transition-colors"
                >
                  TR
                </a>
              </>
            ) : (
              <>
                <a 
                  href="/en/waitlist" 
                  className="text-xs text-white/70 hover:text-white transition-colors"
                >
                  EN
                </a>
                <span className="text-xs text-white/70">/</span>
                <span className="text-xs text-white font-semibold">TR</span>
              </>
            )}
          </div>
          <a
            href="https://instagram.com/fishivo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a
            href="https://x.com/fishivoapp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white transition-colors"
            aria-label="X"
          >
            <XIcon className="h-3 w-3" />
          </a>
          <a
            href="https://youtube.com/@fishivo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white transition-colors"
            aria-label="YouTube"
          >
            <Youtube className="h-4 w-4" />
          </a>
        </div>
      </div>
      </div>
      
      {/* Dialogs */}
      <PrivacyDialog 
        open={privacyOpen} 
        onOpenChange={setPrivacyOpen} 
        locale={locale} 
      />
      <TermsDialog 
        open={termsOpen} 
        onOpenChange={setTermsOpen} 
        locale={locale} 
      />
      <CommunityGuidelinesDialog 
        open={communityOpen} 
        onOpenChange={setCommunityOpen} 
        locale={locale} 
      />
    </div>
  )
}