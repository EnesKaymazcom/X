// Email service is server-only
// Do not import this in client components!
// Use API routes instead for email operations

// Re-export types only (safe for client)
export type {
  EmailConfig,
  EmailSendResult,
  ContactEmailData,
  EmailLanguage,
  EmailTemplate,
  BaseEmailData
} from '@fishivo/types'

// Server-only exports - use direct imports:
// import { createWebEmailService } from '@fishivo/api/services/email/email.web'
// import { defaultEmailConfig } from '@fishivo/api/services/email/config'