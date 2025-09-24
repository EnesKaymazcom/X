import { createBaseEmail } from './baseTemplate'

export interface EmailVerificationData {
  userName: string
  verificationUrl: string
}

export function createEmailVerificationEmail(data: EmailVerificationData) {
  const { userName, verificationUrl } = data

  const subject = 'Verify Your Email Address - Fishivo'
  
  const content = `
    <p style="color: #b3b3b3; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
      Verify your email address to start using your Fishivo account.
    </p>
    
    <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0;">
        <strong>Welcome to the Fishivo community.</strong>
      </p>
    </div>
  `

  const textContent = `
Welcome, ${userName}!

Thank you for joining Fishivo! Please click the link below to activate your account:

${verificationUrl}

This link is valid for 24 hours. If you didn't request this email, please ignore it.

---
Fishivo Team
https://fishivo.com
  `

  const template = createBaseEmail({
    title: 'Account Activation',
    userName,
    content,
    buttonText: 'Activate My Account',
    buttonUrl: verificationUrl
  })
  
  return {
    ...template,
    subject,
    text: textContent
  }
}