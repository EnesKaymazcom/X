import nodemailer, { Transporter } from 'nodemailer'
import { 
  EmailConfig, 
  EmailSendResult, 
  ContactEmailData,
  EmailLanguage
} from '@fishivo/types'
import { enTemplates, trTemplates } from './templates'

export class WebEmailService {
  private transporter: Transporter
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth
    })
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      console.log('SMTP connection verified successfully')
      return true
    } catch (error) {
      console.error('SMTP connection failed:', error)
      return false
    }
  }

  async sendContactConfirmationEmail(
    data: ContactEmailData & { subject: string; message: string }, 
    language: EmailLanguage = 'tr'
  ): Promise<EmailSendResult> {
    try {
      const template = language === 'en' 
        ? enTemplates.createContactConfirmationEmail(data)
        : trTemplates.createContactConfirmationEmail(data)
      
      const info = await this.transporter.sendMail({
        from: `"${this.config.from.name}" <${this.config.from.address}>`,
        to: data.to,
        subject: template.subject,
        text: template.text,
        html: template.html
      })

      console.log('Contact confirmation email sent:', info.messageId)

      return {
        success: true,
        messageId: info.messageId
      }
    } catch (error) {
      console.error('Failed to send contact confirmation email:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email gönderilirken hata oluştu'
      }
    }
  }

  async sendEmailVerificationEmail(
    to: string,
    data: { userName: string; verificationUrl: string },
    language: EmailLanguage = 'tr'
  ): Promise<EmailSendResult> {
    try {
      const template = language === 'en' 
        ? enTemplates.createEmailVerificationEmail(data)
        : trTemplates.createEmailVerificationEmail(data)
      
      const info = await this.transporter.sendMail({
        from: `"${this.config.from.name}" <${this.config.from.address}>`,
        to,
        subject: template.subject,
        text: template.text,
        html: template.html
      })

      console.log('Email verification email sent:', info.messageId)

      return {
        success: true,
        messageId: info.messageId
      }
    } catch (error) {
      console.error('Failed to send email verification email:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email doğrulama email\'i gönderilirken hata oluştu'
      }
    }
  }

  async sendContactNotificationEmail(
    to: string,
    data: { senderName: string; senderEmail: string; subject: string; message: string; submittedAt: string },
    language: EmailLanguage = 'tr'
  ): Promise<EmailSendResult> {
    try {
      const template = language === 'en' 
        ? enTemplates.createContactNotificationEmail(data)
        : trTemplates.createContactNotificationEmail(data)
      
      const info = await this.transporter.sendMail({
        from: `"${this.config.from.name}" <${this.config.from.address}>`,
        to,
        subject: template.subject,
        text: template.text,
        html: template.html
      })

      console.log('Contact notification email sent:', info.messageId)

      return {
        success: true,
        messageId: info.messageId
      }
    } catch (error) {
      console.error('Failed to send contact notification email:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'İletişim bildirim email\'i gönderilirken hata oluştu'
      }
    }
  }

  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<EmailSendResult> {
    try {
      const info = await this.transporter.sendMail({
        from: `"${this.config.from.name}" <${this.config.from.address}>`,
        to,
        subject,
        text,
        html
      })

      return {
        success: true,
        messageId: info.messageId
      }
    } catch (error) {
      console.error('Failed to send email:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email gönderilirken hata oluştu'
      }
    }
  }
}

// Singleton instance
let emailServiceInstance: WebEmailService | null = null

export function createWebEmailService(config: EmailConfig): WebEmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new WebEmailService(config)
  }
  return emailServiceInstance
}

export function getWebEmailService(): WebEmailService | null {
  return emailServiceInstance
}