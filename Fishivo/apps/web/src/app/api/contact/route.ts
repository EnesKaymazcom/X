import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createWebEmailService } from '@fishivo/api/services/email/email.web'
import { defaultEmailConfig } from '@fishivo/api/services/email/config'
import type { EmailLanguage } from '@fishivo/types'

// Request validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  locale: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate request data
    const validationResult = contactSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { name, email, subject, message, locale } = validationResult.data

    // Initialize email service
    const emailService = createWebEmailService(defaultEmailConfig)

    // Determine language based on locale or Accept-Language header
    const acceptLanguage = request.headers.get('accept-language') || ''
    const language: EmailLanguage = (locale === 'en' || locale === 'tr') 
      ? locale 
      : (acceptLanguage.includes('en') ? 'en' : 'tr')
    // Send confirmation email to user
    const confirmationResult = await emailService.sendContactConfirmationEmail({
      to: email,
      userName: name,
      userEmail: email,
      subject,
      message
    }, language)

    if (!confirmationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: language === 'en' 
            ? 'Failed to send confirmation email' 
            : 'Onay e-postası gönderilemedi' 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        message: language === 'en' 
          ? 'Your message has been sent successfully!' 
          : 'Mesajınız başarıyla gönderildi!',
        messageId: confirmationResult.messageId
      }
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}