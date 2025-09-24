import { createBaseEmail } from './baseTemplate'

export interface EmailVerificationData {
  userName: string
  verificationUrl: string
}

export function createEmailVerificationEmail(data: EmailVerificationData) {
  const { userName, verificationUrl } = data

  const subject = 'Email Adresinizi Doğrulayın - Fishivo'
  
  const content = `
    <p style="color: #b3b3b3; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
      Fishivo hesabınızı kullanmaya başlamak için e-posta adresinizi doğrulayın.
    </p>
    
    <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0;">
        <strong>Fishivo topluluğuna hoş geldiniz.</strong>
      </p>
    </div>
  `

  const textContent = `
Hoş geldiniz, ${userName}!

Fishivo'ya katıldığınız için teşekkür ederiz! Hesabınızı aktifleştirmek için aşağıdaki linke tıklayın:

${verificationUrl}

Bu link 24 saat geçerlidir. Eğer bu email'i talep etmediyseniz, lütfen dikkate almayın.

---
Fishivo Ekibi
https://fishivo.com
  `

  const template = createBaseEmail({
    title: 'Hesap Aktivasyonu',
    userName,
    content,
    buttonText: 'Hesabımı Aktifleştir',
    buttonUrl: verificationUrl
  })
  
  return {
    ...template,
    subject,
    text: textContent
  }
}