import { getServerTranslation } from "@/lib/i18n/server"
import WaitlistPageClient from "./page-client"

interface WaitlistPageWrapperProps {
  params: {
    locale: string
  }
}

export default async function WaitlistPageWrapper({ params }: WaitlistPageWrapperProps) {
  const { locale } = await params
  const t = getServerTranslation(locale as 'en' | 'tr')
  
  const translations = {
    title: t('pages.waitlist.title'),
    subtitle: t('pages.waitlist.subtitle'),
    form: {
      email: {
        placeholder: t('pages.waitlist.form.email.placeholder'),
        error: t('pages.waitlist.form.email.error')
      },
      submit: t('pages.waitlist.form.submit'),
      submitting: t('pages.waitlist.form.submitting'),
      success: {
        title: t('pages.waitlist.form.success.title'),
        description: t('pages.waitlist.form.success.description'),
        backButton: t('pages.waitlist.form.success.backButton')
      }
    },
    benefits: {
      earlyAccess: {
        title: t('pages.waitlist.benefits.earlyAccess.title'),
        description: t('pages.waitlist.benefits.earlyAccess.description')
      },
      specialBenefits: {
        title: t('pages.waitlist.benefits.specialBenefits.title'),
        description: t('pages.waitlist.benefits.specialBenefits.description')
      },
      vipCommunity: {
        title: t('pages.waitlist.benefits.vipCommunity.title'),
        description: t('pages.waitlist.benefits.vipCommunity.description')
      }
    },
    footer: {
      copyright: t('pages.waitlist.footer.copyright'),
      privacyPolicy: t('pages.waitlist.footer.privacyPolicy'),
      termsOfService: t('pages.waitlist.footer.termsOfService')
    }
  }
  
  return <WaitlistPageClient translations={translations} locale={locale} />
}