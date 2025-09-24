import { EmailTemplate, ContactEmailData } from '@fishivo/types'
import { createBaseEmail } from './baseTemplate'

export function createContactConfirmationEmail(data: ContactEmailData & { subject: string; message: string }): EmailTemplate {
  const { userName, userEmail, message, subject } = data

  const emailContent = `
    <p style="color: #b3b3b3; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
      Thank you for contacting us through the Fishivo contact form. 
      We have received your message and will <strong style="color: #ffffff;">get back to you within 24 hours</strong>.
    </p>
    
    <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; border-left: 3px solid #ffffff; margin: 20px 0;">
      <h3 style="color: #ffffff; margin: 0 0 8px 0; font-size: 16px;">Your Message:</h3>
      <div style="background-color: #0d0d0d; padding: 16px; border-radius: 6px; margin-top: 12px;">
        <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0;"><strong>Subject:</strong> ${subject}</p>
        <p style="color: #b3b3b3; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
      </div>
    </div>
    
    <p style="color: #b3b3b3; font-size: 15px; line-height: 1.7; margin: 20px 0 0 0;">
      For urgent matters, you can reach us directly at <a href="mailto:contact@fishivo.com" style="color: #ffffff; text-decoration: none;">contact@fishivo.com</a>.
    </p>
  `

  return createBaseEmail({
    title: 'Message Received',
    greeting: 'Hello',
    userName: userName,
    content: emailContent,
    buttonText: 'Visit Fishivo',
    buttonUrl: 'https://fishivo.com'
  })
}