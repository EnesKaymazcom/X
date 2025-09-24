import { EmailTemplate, BaseEmailData } from '@fishivo/types'

interface TemplateStrings {
  greeting: string
  copyright: string
  allRightsReserved: string
  unsubscribe: string
  socialMedia: string
  website: string
}

const templateStrings: Record<'en' | 'tr', TemplateStrings> = {
  en: {
    greeting: 'Hello',
    copyright: '© 2025 Fishivo.',
    allRightsReserved: 'All rights reserved.',
    unsubscribe: 'Unsubscribe',
    socialMedia: 'Social Media:',
    website: 'Website:'
  },
  tr: {
    greeting: 'Merhaba',
    copyright: '© 2025 Fishivo.',
    allRightsReserved: 'Tüm hakları saklıdır.',
    unsubscribe: 'Abonelikten çık',
    socialMedia: 'Sosyal Medya:',
    website: 'Web sitesi:'
  }
}

export function createBaseEmailTemplate(
  data: BaseEmailData, 
  language: 'en' | 'tr' = 'en'
): EmailTemplate {
  const strings = templateStrings[language]
  const {
    title,
    greeting = strings.greeting,
    userName,
    content,
    buttonText,
    buttonUrl,
    footerText,
    unsubscribeUrl
  } = data

  const html = `<!DOCTYPE html>
<html lang="${language}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${title} - Fishivo</title>
<style>
body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none;}
body{margin:0!important;padding:0!important;background-color:#ffffff!important;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#ffffff;}
@media screen and (max-width:600px){
.email-container{width:100%!important;}
.content-padding{padding:24px 16px!important;}
.button{width:auto!important;display:block!important;text-align:center!important;}
.header-title{font-size:20px!important;}
}
.button:hover{background-color:#cccccc!important;color:#000000!important;}
</style>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#ffffff;">
<tr>
<td align="left" style="padding:32px 16px;">
<table class="email-container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin:0;background-color:#0d0d0d;border:1px solid #1a1a1a;border-radius:8px;overflow:hidden;">
<tr>
<td style="background-color:#0d0d0d;padding:32px 24px;text-align:left;border-bottom:1px solid #1a1a1a;">
<h1 style="color:#ffffff;font-size:24px;font-weight:600;margin:0;letter-spacing:-0.025em;">Fishivo</h1>
<h2 class="header-title" style="color:#b3b3b3;font-size:18px;font-weight:500;margin:4px 0 0 0;letter-spacing:-0.025em;">${title}</h2>
</td>
</tr>
<tr>
<td class="content-padding" style="background-color:#0d0d0d;padding:32px 24px;">
${userName ? `<p style="font-size:16px;color:#ffffff;margin:0 0 24px 0;line-height:1.5;">${greeting} <strong style="color:#ffffff;font-weight:600;">${userName}</strong>,</p>` : `<p style="font-size:16px;color:#ffffff;margin:0 0 24px 0;line-height:1.5;">${greeting},</p>`}
<div style="color:#b3b3b3;font-size:15px;line-height:1.7;">${content}</div>
${buttonText && buttonUrl ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:24px auto 0;"><tr><td style="border-radius:6px;background-color:#ffffff;"><a href="${buttonUrl}" class="button" target="_blank" style="background-color:#ffffff;border:1px solid #ffffff;font-size:14px;font-weight:500;line-height:1;text-decoration:none;padding:12px 24px;color:#000000;display:inline-block;border-radius:6px;">${buttonText}</a></td></tr></table>` : ''}
${footerText ? `<div style="margin-top:16px;padding-top:16px;border-top:1px solid #1a1a1a;"><p style="color:#999999;font-size:14px;margin:0;line-height:1.6;">${footerText}</p></div>` : ''}
</td>
</tr>
<tr>
<td style="background-color:#ffffff;border-top:1px solid #1a1a1a;padding:24px;text-align:center;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 16px;">
<tr>
<td style="padding:0 12px;"><a href="https://instagram.com/fishivo" target="_blank" style="color:#666666;text-decoration:none;font-size:14px;">Instagram</a></td>
<td style="padding:0 12px;color:#808080;">•</td>
<td style="padding:0 12px;"><a href="https://twitter.com/fishivoapp" target="_blank" style="color:#666666;text-decoration:none;font-size:14px;">X</a></td>
<td style="padding:0 12px;color:#808080;">•</td>
<td style="padding:0 12px;"><a href="https://fishivo.com" target="_blank" style="color:#666666;text-decoration:none;font-size:14px;">${strings.website.replace(':', '')}</a></td>
</tr>
</table>
<p style="color:#4d4d4d;font-size:12px;margin:0 0 8px 0;">${strings.copyright} ${strings.allRightsReserved}</p>
${unsubscribeUrl ? `<p style="margin:0;"><a href="${unsubscribeUrl}" target="_blank" style="color:#4d4d4d;font-size:12px;text-decoration:underline;">${strings.unsubscribe}</a></p>` : ''}
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`

  // Plain text version
  const text = `
${title}
${'='.repeat(title.length)}

${greeting}${userName ? ` ${userName}` : ''},

${content.replace(/<[^>]*>/g, '')}

${buttonText ? `\n${buttonText}: ${buttonUrl}\n` : ''}

${footerText ? `\n${footerText.replace(/<[^>]*>/g, '')}\n` : ''}

---
${strings.copyright} ${strings.allRightsReserved}

${strings.socialMedia}
Instagram: @fishivo
X: @fishivoapp
${strings.website} fishivo.com

${unsubscribeUrl ? `\n${strings.unsubscribe}: ${unsubscribeUrl}` : ''}
`.trim()

  return {
    subject: title,
    html,
    text
  }
}