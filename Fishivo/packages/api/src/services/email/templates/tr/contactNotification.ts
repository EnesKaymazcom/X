import { createBaseEmail } from './baseTemplate'

export interface ContactNotificationData {
  senderName: string
  senderEmail: string
  subject: string
  message: string
  submittedAt: string
}

export function createContactNotificationEmail(data: ContactNotificationData) {
  const { senderName, senderEmail, subject, message, submittedAt } = data

  const emailSubject = `🎣 Yeni İletişim Formu Mesajı - ${senderName}`
  
  const content = `
    <div style="margin: 40px 0;">
      <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 20px; font-weight: 600;">
        📧 Yeni İletişim Formu Mesajı
      </h1>
      
      <div style="background: rgba(59, 130, 246, 0.1); padding: 24px; border-radius: 12px; border-left: 4px solid #3b82f6; margin: 30px 0;">
        <h2 style="color: #3b82f6; font-size: 18px; margin: 0 0 16px 0; font-weight: 600;">
          Gönderen Bilgileri
        </h2>
        
        <div style="margin: 12px 0;">
          <span style="color: #888888; font-size: 14px; font-weight: 500;">İsim:</span>
          <span style="color: #ffffff; font-size: 16px; margin-left: 12px;">${senderName}</span>
        </div>
        
        <div style="margin: 12px 0;">
          <span style="color: #888888; font-size: 14px; font-weight: 500;">Email:</span>
          <a href="mailto:${senderEmail}" style="color: #3b82f6; font-size: 16px; margin-left: 12px; text-decoration: none;">${senderEmail}</a>
        </div>
        
        <div style="margin: 12px 0;">
          <span style="color: #888888; font-size: 14px; font-weight: 500;">Tarih:</span>
          <span style="color: #cccccc; font-size: 14px; margin-left: 12px;">${submittedAt}</span>
        </div>
      </div>
      
      <div style="background: rgba(16, 185, 129, 0.1); padding: 24px; border-radius: 12px; border-left: 4px solid #10b981; margin: 30px 0;">
        <h2 style="color: #10b981; font-size: 18px; margin: 0 0 16px 0; font-weight: 600;">
          Mesaj Konusu
        </h2>
        <p style="color: #ffffff; font-size: 16px; margin: 0; font-weight: 500;">
          ${subject}
        </p>
      </div>
      
      <div style="background: rgba(107, 114, 128, 0.1); padding: 24px; border-radius: 12px; border-left: 4px solid #6b7280; margin: 30px 0;">
        <h2 style="color: #6b7280; font-size: 18px; margin: 0 0 16px 0; font-weight: 600;">
          Mesaj İçeriği
        </h2>
        <div style="color: #cccccc; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
      </div>
      
      <div style="text-align: center; margin: 40px 0; padding: 24px; background: rgba(139, 69, 19, 0.1); border-radius: 12px;">
        <h3 style="color: #d97706; font-size: 16px; margin: 0 0 16px 0;">
          ⚡ Hızlı Eylemler
        </h3>
        
        <div style="margin: 20px 0;">
          <a href="mailto:${senderEmail}?subject=Re: ${encodeURIComponent(subject)}" 
             style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                    color: white; 
                    text-decoration: none; 
                    padding: 12px 24px; 
                    border-radius: 6px; 
                    font-weight: 600; 
                    font-size: 14px; 
                    display: inline-block;
                    margin: 0 8px;
                    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);">
            📧 Yanıtla
          </a>
          
          <a href="https://fishivo.com/admin/contact" 
             style="background: rgba(107, 114, 128, 0.8); 
                    color: white; 
                    text-decoration: none; 
                    padding: 12px 24px; 
                    border-radius: 6px; 
                    font-weight: 600; 
                    font-size: 14px; 
                    display: inline-block;
                    margin: 0 8px;">
            🔧 Admin Panel
          </a>
        </div>
      </div>
      
      <p style="color: #666666; font-size: 12px; text-align: center; margin-top: 40px; line-height: 1.4;">
        Bu otomatik bildirim Fishivo iletişim formundan gönderilmiştir.<br>
        Mesaja 24 saat içinde yanıt vermeyi unutmayın! 🎣
      </p>
    </div>
  `

  const textContent = `
🎣 YENİ İLETİŞİM FORMU MESAJI

GÖNDEREN BİLGİLERİ:
İsim: ${senderName}
Email: ${senderEmail}
Tarih: ${submittedAt}

KONU: ${subject}

MESAJ:
${message}

---

HIZLI EYLEMLER:
- Yanıtla: mailto:${senderEmail}?subject=Re: ${subject}
- Admin Panel: https://fishivo.com/admin/contact

Bu otomatik bildirim Fishivo iletişim formundan gönderilmiştir.
Mesaja 24 saat içinde yanıt vermeyi unutmayın! 🎣

---
Fishivo Admin Sistemi
https://fishivo.com
  `

  const template = createBaseEmail({
    title: 'İletişim Bildirimi',
    content,
    footerText: textContent
  })
  
  return {
    ...template,
    subject: emailSubject,
    text: textContent
  }
}