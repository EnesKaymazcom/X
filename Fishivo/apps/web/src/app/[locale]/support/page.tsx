"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { GlowingCard } from "@/components/ui/glowing-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useI18n } from "@/lib/i18n"
import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Send, Mail, MessageSquare, User, Loader2, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
// Using Next.js API routes instead of external service
import { TypographyH3, TypographyMuted } from "@/lib/typography"
import { I18nText, I18nButtonText } from "@/components/ui/i18n-loader"

export default function ContactPage() {
  const { t, locale } = useI18n()

  // Form schema with i18n validation messages - memoized to update on locale change
  const formSchema = useMemo(() => z.object({
    name: z.string().min(2, t('support.contact.validation.nameMin')),
    email: z.string().email(t('support.contact.validation.emailInvalid')),
    subject: z.string().min(5, t('support.contact.validation.subjectMin')),
    message: z.string().min(10, t('support.contact.validation.messageMin')),
  }), [t])
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)
  const [message, setMessage] = useState('')
  const [formKey, setFormKey] = useState(0) // Key to force form remount
  
  // Container height animation system (like login form)
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined)
  const [cardElement, setCardElement] = useState<HTMLDivElement | null>(null)
  
  // Create form with key dependency to force recreation
  const form = useForm<{
    name: string
    email: string
    subject: string
    message: string
  }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })
  
  // Reset form when formKey changes
  useEffect(() => {
    if (formKey > 0) {
      form.reset({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
      form.clearErrors()
    }
  }, [formKey, form])

  const cardRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      setCardElement(node)
      setCardHeight(node.scrollHeight)
    }
  }, [contactSuccess, message, isSubmitting, formKey])

  // Recalculate height on form state changes
  useEffect(() => {
    if (cardElement) {
      const updateHeight = () => {
        const newHeight = cardElement.scrollHeight
        console.log('Contact form height update:', { newHeight, contactSuccess })
        setCardHeight(newHeight)
      }
      
      requestAnimationFrame(updateHeight)
    }
  }, [
    cardElement,
    form.formState.errors,
    contactSuccess,
    message,
    isSubmitting,
    formKey
  ])

  async function onSubmit(values: {
    name: string
    email: string
    subject: string
    message: string
  }) {
    setIsSubmitting(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          subject: values.subject,
          message: values.message,
          locale // Include current locale for proper email language
        })
      })

      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send message')
      }

      setContactSuccess(true)
      setMessage(result.data?.message || t('support.contact.success.message'))
      form.reset()
    } catch (error) {
      setMessage(
        error instanceof Error 
          ? error.message 
          : t('support.contact.errors.general')
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const backToForm = () => {
    setContactSuccess(false)
    setMessage('')
    // Force form remount to completely clear validation state
    setFormKey(prev => prev + 1)
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-navbar">
      <div className="w-full flex justify-center">
        <GlowingCard className="w-full max-w-md mx-auto">
          <motion.div
            animate={{ height: cardHeight ? cardHeight : 'auto' }}
            transition={{ type: 'spring', duration: 0.5, damping: 30, stiffness: 200 }}
            className="w-full"
          >
            <div ref={cardRef}>
                <CardHeader className="space-y-3 w-full pb-4">
                  <TypographyH3 className={contactSuccess ? "text-center" : "text-left"}>
                    {contactSuccess ? 
                      t('support.contact.titleSuccess') : 
                      t('support.contact.title')
                    }
                  </TypographyH3>
                  <TypographyMuted className={contactSuccess ? "text-center" : "text-left"}>
                    {contactSuccess ? 
                      t('support.contact.descriptionSuccess') : 
                      t('support.contact.subtitle')
                    }
                  </TypographyMuted>
                </CardHeader>
                
                <Form {...form} key={formKey}>
                  <form 
                    id="contact-form" 
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="w-full"
                  >
                    <CardContent className="w-full pb-2">
                      <div className="flex flex-col gap-4">
                        {contactSuccess ? (
                          <div className="text-center space-y-4">
                          <div className="flex justify-center mb-4">
                            <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                              <Mail className="h-8 w-8 text-green-600" />
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t('support.contact.success.message')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('support.contact.success.responseTime')}
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="grid gap-2">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel >{t('support.contact.form.name')}</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder={t('support.contact.form.namePlaceholder')} 
                                      className="h-10"
                                      {...field} 
                                      disabled={isSubmitting}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel >{t('support.contact.form.email')}</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="email"
                                      placeholder={t('support.contact.form.emailPlaceholder')} 
                                      className="h-10"
                                      {...field} 
                                      disabled={isSubmitting}
                                      autoComplete="email"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <FormField
                              control={form.control}
                              name="subject"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel >{t('support.contact.form.subject')}</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder={t('support.contact.form.subjectPlaceholder')} 
                                      className="h-10"
                                      {...field} 
                                      disabled={isSubmitting}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <FormField
                              control={form.control}
                              name="message"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel >{t('support.contact.form.message')}</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder={t('support.contact.form.messagePlaceholder')}
                                      className="min-h-[100px] resize-none"
                                      {...field}
                                      disabled={isSubmitting}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Error message */}
                          {message && (
                            <Alert variant="destructive">
                              <AlertDescription>{message}</AlertDescription>
                            </Alert>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                  
                    <CardFooter className="flex-col gap-4 w-full pt-6">
                      {contactSuccess ? (
                        <Button 
                          type="button"
                          variant="outline"
                          className="w-full h-10 sm:h-11"
                          onClick={backToForm}
                        >
                          <ArrowLeft className="mr-1 h-4 w-4" />
                          <span className="text-sm sm:text-base">{t('support.contact.form.backButton')}</span>
                        </Button>
                      ) : (
                        <LoadingButton
                          type="submit" 
                          className="w-full h-10 sm:h-11" 
                          loading={isSubmitting}
                          loadingText={t('support.contact.form.submitting')}
                        >
                          <Send className="mr-1 h-4 w-4" />
                          <span className="text-sm sm:text-base">{t('support.contact.form.submitButton')}</span>
                        </LoadingButton>
                      )}
                    </CardFooter>
                  </form>
                </Form>
            </div>
          </motion.div>
        </GlowingCard>
      </div>
    </div>
  )
}
