"use client"

import { TypographyH1, TypographyH2, TypographyP } from '@/lib/typography'
import { PageContainer } from '@/components/ui/page-container'
import { useI18n } from '@/lib/i18n'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function FAQPage() {
  const { t, locale } = useI18n()

  const faqs = locale === 'tr' ? [
    {
      question: "Fishivo uygulaması ücretsiz mi?",
      answer: "Evet, Fishivo uygulamasının temel özellikleri tamamen ücretsizdir. Premium özellikler için aylık abonelik seçenekleri mevcuttur."
    },
    {
      question: "Avımı nasıl paylaşabilirim?",
      answer: "Ana ekrandaki '+' butonuna tıklayarak yeni bir av kaydı oluşturabilirsiniz. Fotoğraf ekleyin, lokasyon bilgilerini girin ve detayları doldurun."
    },
    {
      question: "Lokasyon bilgilerimi kimler görebilir?",
      answer: "Lokasyon paylaşımınızı gizlilik ayarlarınızdan kontrol edebilirsiniz. Sadece arkadaşlarınızla, herkesle veya hiç kimseyle paylaşmama seçenekleri bulunur."
    },
    {
      question: "Offline kullanım mümkün mü?",
      answer: "Harita verilerini önceden indirerek sınırlı offline kullanım mümkündür. Ancak sosyal özellikler internet bağlantısı gerektirir."
    },
    {
      question: "Hesabımı nasıl silebilirim?",
      answer: "Ayarlar > Hesap > Hesabı Sil seçeneğini kullanarak hesabınızı kalıcı olarak silebilirsiniz. Bu işlem geri alınamaz."
    },
    {
      question: "Teknik destek nasıl alabilirim?",
      answer: "Uygulama içindeki 'Destek' bölümünden veya support@fishivo.com adresinden bizimle iletişime geçebilirsiniz."
    }
  ] : [
    {
      question: "Is Fishivo app free?",
      answer: "Yes, the basic features of Fishivo app are completely free. Monthly subscription options are available for premium features."
    },
    {
      question: "How can I share my catch?",
      answer: "You can create a new catch record by clicking the '+' button on the main screen. Add photos, enter location information and fill in the details."
    },
    {
      question: "Who can see my location information?",
      answer: "You can control your location sharing from your privacy settings. There are options to share only with friends, with everyone or not share at all."
    },
    {
      question: "Is offline usage possible?",
      answer: "Limited offline usage is possible by downloading map data in advance. However, social features require internet connection."
    },
    {
      question: "How can I delete my account?",
      answer: "You can permanently delete your account using Settings > Account > Delete Account option. This action cannot be undone."
    },
    {
      question: "How can I get technical support?",
      answer: "You can contact us through the 'Support' section in the app or at support@fishivo.com."
    }
  ]

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <TypographyH1>{t('support.faq.title')}</TypographyH1>
          <TypographyP className="text-muted-foreground">
            {t('support.faq.subtitle')}
          </TypographyP>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 p-6 bg-muted rounded-lg text-center space-y-4">
          <TypographyH2>{t('support.faq.stillHaveQuestions')}</TypographyH2>
          <TypographyP className="text-muted-foreground">
            {locale === 'tr' ? 'Başka sorularınız için bizimle iletişime geçebilirsiniz.' : 'You can contact us for any other questions.'}
          </TypographyP>
          <Button asChild>
            <Link href={`/${locale}/support`}>
              {t('support.faq.contactUs')}
            </Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}