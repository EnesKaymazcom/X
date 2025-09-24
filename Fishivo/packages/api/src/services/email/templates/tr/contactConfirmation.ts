import { EmailTemplate, ContactEmailData } from '@fishivo/types'
import { createBaseEmail } from './baseTemplate'

export function createContactConfirmationEmail(data: ContactEmailData & { subject: string; message: string }): EmailTemplate {
  const { userName, userEmail, message, subject } = data

  const emailContent = `
    <p style="color: #b3b3b3; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
      Fishivo contact formunu kullanarak bizimle iletişime geçtiğiniz için teşekkür ederiz. 
      Mesajınızı aldık ve <strong style="color: #ffffff;">24 saat içinde</strong> size geri dönüş yapacağız.
    </p>
    
    <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; border-left: 3px solid #ffffff; margin: 20px 0;">
      <h3 style="color: #ffffff; margin: 0 0 8px 0; font-size: 16px;">Gönderdiğiniz Mesaj:</h3>
      <div style="background-color: #0d0d0d; padding: 16px; border-radius: 6px; margin-top: 12px;">
        <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0;"><strong>Konu:</strong> ${subject}</p>
        <p style="color: #b3b3b3; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
      </div>
    </div>
    
    <p style="color: #b3b3b3; font-size: 15px; line-height: 1.7; margin: 20px 0 0 0;">
      Acil durumlar için <a href="mailto:contact@fishivo.com" style="color: #ffffff; text-decoration: none;">contact@fishivo.com</a> 
      adresinden direkt ulaşabilirsiniz.
    </p>
  `

  return createBaseEmail({
    title: 'Mesajınız Alındı',
    greeting: 'Merhaba',
    userName: userName,
    content: emailContent,
    buttonText: 'Fishivo\'ya Git',
    buttonUrl: 'https://fishivo.com'
  })
}