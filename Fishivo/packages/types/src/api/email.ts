export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  from: {
    name: string
    address: string
  }
}

// Email Verification Template Data
export interface EmailVerificationTemplateData {
  userName: string
  verificationUrl: string
}

// Password Reset Template Data  
export interface PasswordResetTemplateData {
  userName: string
  resetUrl: string
}

// Contact Notification Template Data
export interface ContactNotificationTemplateData {
  senderName: string
  senderEmail: string
  subject: string
  message: string
  submittedAt: string
}

// Legacy interfaces (keep for backward compatibility)
export interface PasswordResetEmailData {
  to: string
  resetToken: string
  redirectUrl: string
  userName?: string
  tokenHash?: string
  siteUrl?: string
}

export interface EmailVerificationData {
  to: string
  userName?: string
  confirmationUrl?: string
  token?: string
  tokenHash?: string
  userId?: string
  siteUrl?: string
  redirectTo?: string
}

export interface ContactEmailData {
  to: string
  userName?: string
  userEmail?: string
  message?: string
  siteUrl?: string
}

export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

export interface BaseEmailData {
  title: string
  greeting?: string
  userName?: string
  content: string
  buttonText?: string
  buttonUrl?: string
  footerText?: string
  unsubscribeUrl?: string
}

export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
}

export type EmailLanguage = 'en' | 'tr'