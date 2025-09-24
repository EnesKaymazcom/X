import { EmailConfig } from '@fishivo/types'

// Get SMTP configuration from environment variables
const getSmtpConfig = () => {
  const host = process.env.SMTP_HOST || 'smtp.hostinger.com'
  const port = parseInt(process.env.SMTP_PORT || '465', 10)
  const secure = process.env.SMTP_SECURE === 'true' || port === 465
  const user = process.env.SMTP_USER || 'contact@fishivo.com'
  const pass = process.env.SMTP_PASSWORD || ''
  
  if (!pass) {
    console.warn('SMTP_PASSWORD environment variable not found')
  }
  
  return { host, port, secure, user, pass }
}

// Default email configuration
export const defaultEmailConfig: EmailConfig = (() => {
  const { host, port, secure, user, pass } = getSmtpConfig()
  
  return {
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    from: {
      name: 'Fishivo',
      address: user
    }
  }
})()

// Admin email address for notifications
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fishivo.com'

// Email config factory
export function createEmailConfig(overrides?: Partial<EmailConfig>): EmailConfig {
  return {
    ...defaultEmailConfig,
    ...overrides,
    auth: {
      ...defaultEmailConfig.auth,
      ...(overrides?.auth || {})
    },
    from: {
      ...defaultEmailConfig.from,
      ...(overrides?.from || {})
    }
  }
}