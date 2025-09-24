import { NextRequest, NextResponse } from 'next/server'
import { createWebEmailService } from '@fishivo/api/services/email/email.web'
import { defaultEmailConfig } from '@fishivo/api/services/email/config'
import { EmailLanguage } from '@fishivo/types'

export async function POST(request: NextRequest) {
  try {
    const { to, userName, verificationUrl, language = 'tr' } = await request.json()
    
    if (!to || !userName || !verificationUrl) {
      return NextResponse.json(
        { success: false, error: 'Gerekli alanlar eksik' },
        { status: 400 }
      )
    }
    
    const emailService = createWebEmailService(defaultEmailConfig)
    
    const result = await emailService.sendEmailVerificationEmail(
      to,
      { userName, verificationUrl },
      language as EmailLanguage
    )
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Email verification endpoint error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Email gönderilirken hata oluştu' 
      },
      { status: 500 }
    )
  }
}