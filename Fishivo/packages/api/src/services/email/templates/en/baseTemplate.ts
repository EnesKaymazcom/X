import { EmailTemplate, BaseEmailData } from '@fishivo/types'
import { createBaseEmailTemplate } from '../baseTemplateEngine'

export function createBaseEmail(data: BaseEmailData): EmailTemplate {
  return createBaseEmailTemplate(data, 'en')
}