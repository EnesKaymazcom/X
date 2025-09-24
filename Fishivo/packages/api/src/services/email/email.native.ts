import { 
  EmailSendResult, 
  ContactEmailData,
  EmailLanguage
} from '@fishivo/types'

export class NativeEmailService {
  private apiUrl: string

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl
  }

  async sendContactConfirmationEmail(
    data: ContactEmailData & { subject: string; message: string }, 
    language: EmailLanguage = 'tr'
  ): Promise<EmailSendResult> {
    try {
      const response = await fetch(`${this.apiUrl}/api/email/contact-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          language
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
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
      const response = await fetch(`${this.apiUrl}/api/email/verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          ...data,
          language
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Failed to send email verification email:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email doğrulama email\'i gönderilirken hata oluştu'
      }
    }
  }

  async sendPasswordResetEmail(
    to: string,
    data: { userName: string; resetUrl: string },
    language: EmailLanguage = 'tr'
  ): Promise<EmailSendResult> {
    try {
      const response = await fetch(`${this.apiUrl}/api/email/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          ...data,
          language
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Failed to send password reset email:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Şifre sıfırlama email\'i gönderilirken hata oluştu'
      }
    }
  }

  async sendEmail(
    to: string, 
    subject: string, 
    content: string, 
    language: EmailLanguage = 'tr'
  ): Promise<EmailSendResult> {
    try {
      const response = await fetch(`${this.apiUrl}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          content,
          language
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Failed to send email:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email gönderilirken hata oluştu'
      }
    }
  }
}

export function createNativeEmailService(apiUrl: string): NativeEmailService {
  return new NativeEmailService(apiUrl)
}