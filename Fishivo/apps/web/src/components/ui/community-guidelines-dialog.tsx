'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CommunityGuidelinesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: 'en' | 'tr'
}

export function CommunityGuidelinesDialog({ open, onOpenChange, locale }: CommunityGuidelinesDialogProps) {
  const isEnglish = locale === 'en'
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] bg-black border-white/20 text-white p-0 [&>button]:text-white/70 [&>button]:hover:text-white [&>button]:hover:bg-white/10">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/20">
          <DialogTitle className="text-2xl font-bold">
            {isEnglish ? 'Community Guidelines' : 'Topluluk Kuralları'}
          </DialogTitle>
          <p className="text-white/70 text-sm mt-2">
            {isEnglish 
              ? `Last updated: ${new Date().toLocaleDateString('en-US')}`
              : `Son güncelleme: ${new Date().toLocaleDateString('tr-TR')}`
            }
          </p>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="space-y-6 mt-6">
            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '1. Welcome to Fishivo Community' : '1. Fishivo Topluluğuna Hoş Geldiniz'}
              </h2>
              <p className="text-white/80 leading-relaxed text-sm mb-3">
                {isEnglish
                  ? 'Fishivo is a global community of fishing enthusiasts who share their passion for fishing. These guidelines help us maintain a positive, respectful, and safe environment for all members. By using Fishivo, you agree to follow these community standards.'
                  : 'Fishivo, balık tutma tutkusunu paylaşan balık tutma meraklılarının küresel bir topluluğudur. Bu kurallar, tüm üyeler için olumlu, saygılı ve güvenli bir ortam sürdürmemize yardımcı olur. Fishivo\'yu kullanarak, bu topluluk standartlarını takip etmeyi kabul edersiniz.'
                }
              </p>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'We encourage authentic sharing, meaningful connections, and responsible fishing practices. Together, we can build a community that celebrates our shared love for fishing while respecting nature and each other.'
                  : 'Otantik paylaşımı, anlamlı bağlantıları ve sorumlu balıkçılık uygulamalarını teşvik ediyoruz. Birlikte, doğaya ve birbirimize saygı duyarken balık tutma sevgimizi kutlayan bir topluluk oluşturabiliriz.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '2. Be Authentic' : '2. Otantik Olun'}
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-white/80 text-sm">
                <li>
                  <span className="font-medium">{isEnglish ? 'Share real experiences:' : 'Gerçek deneyimleri paylaşın:'}</span>
                  {isEnglish 
                    ? ' Post genuine fishing experiences, catches, and stories'
                    : ' Gerçek balık tutma deneyimlerini, avları ve hikayeleri paylaşın'
                  }
                </li>
                <li>
                  <span className="font-medium">{isEnglish ? 'Be honest:' : 'Dürüst olun:'}</span>
                  {isEnglish 
                    ? ' Don\'t exaggerate catch sizes or fabricate fishing stories'
                    : ' Av boyutlarını abartmayın veya balıkçılık hikayeleri uydurmayın'
                  }
                </li>
                <li>
                  <span className="font-medium">{isEnglish ? 'Use your real identity:' : 'Gerçek kimliğinizi kullanın:'}</span>
                  {isEnglish 
                    ? ' Create only one personal account and use your real name'
                    : ' Sadece bir kişisel hesap oluşturun ve gerçek adınızı kullanın'
                  }
                </li>
                <li>
                  <span className="font-medium">{isEnglish ? 'Original content:' : 'Orijinal içerik:'}</span>
                  {isEnglish 
                    ? ' Share photos and videos that you have taken yourself'
                    : ' Kendinizin çektiği fotoğraf ve videoları paylaşın'
                  }
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '3. Respect Others' : '3. Başkalarına Saygı Gösterin'}
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-white/80 text-sm">
                <li>
                  <span className="font-medium">{isEnglish ? 'Be respectful:' : 'Saygılı olun:'}</span>
                  {isEnglish 
                    ? ' Treat all community members with respect, regardless of their skill level or experience'
                    : ' Beceri seviyesi veya deneyimleri ne olursa olsun tüm topluluk üyelerine saygıyla davranın'
                  }
                </li>
                <li>
                  <span className="font-medium">{isEnglish ? 'No harassment:' : 'Taciz yok:'}</span>
                  {isEnglish 
                    ? ' Bullying, intimidation, or harassment of any kind is not tolerated'
                    : ' Zorbalık, yıldırma veya her türlü tacize tolerans gösterilmez'
                  }
                </li>
                <li>
                  <span className="font-medium">{isEnglish ? 'Constructive feedback:' : 'Yapıcı geri bildirim:'}</span>
                  {isEnglish 
                    ? ' Offer helpful advice and constructive criticism, not insults'
                    : ' Hakaret değil, yardımcı tavsiyeler ve yapıcı eleştiriler sunun'
                  }
                </li>
                <li>
                  <span className="font-medium">{isEnglish ? 'Privacy matters:' : 'Gizlilik önemlidir:'}</span>
                  {isEnglish 
                    ? ' Don\'t share others\' personal information without permission'
                    : ' Başkalarının kişisel bilgilerini izinsiz paylaşmayın'
                  }
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '4. Keep It Safe' : '4. Güvenli Tutun'}
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-white/80 text-sm">
                <li>
                  <span className="font-medium">{isEnglish ? 'No harmful content:' : 'Zararlı içerik yok:'}</span>
                  {isEnglish 
                    ? ' Don\'t post content that promotes self-harm, suicide, or dangerous activities'
                    : ' Kendine zarar verme, intihar veya tehlikeli aktiviteleri teşvik eden içerik paylaşmayın'
                  }
                </li>
                <li>
                  <span className="font-medium">{isEnglish ? 'Child safety:' : 'Çocuk güvenliği:'}</span>
                  {isEnglish 
                    ? ' We have zero tolerance for content that exploits or endangers minors'
                    : ' Küçükleri istismar eden veya tehlikeye atan içeriklere sıfır tolerans gösteriyoruz'
                  }
                </li>
                <li>
                  <span className="font-medium">{isEnglish ? 'No violence:' : 'Şiddet yok:'}</span>
                  {isEnglish 
                    ? ' Content depicting graphic violence or cruelty to animals is prohibited'
                    : ' Grafik şiddet veya hayvanlara zulmü gösteren içerik yasaktır'
                  }
                </li>
                <li>
                  <span className="font-medium">{isEnglish ? 'Report concerns:' : 'Endişeleri bildirin:'}</span>
                  {isEnglish 
                    ? ' Report any content or behavior that makes you feel unsafe'
                    : ' Kendinizi güvensiz hissettiren herhangi bir içerik veya davranışı bildirin'
                  }
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '5. Respect Nature and Laws' : '5. Doğaya ve Yasalara Saygı'}
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-white/80 text-sm">
                <li>
                  <span className="font-medium">{isEnglish ? 'Follow fishing regulations:' : 'Balıkçılık düzenlemelerine uyun:'}</span>
                  {isEnglish 
                    ? ' Always comply with local fishing laws, licenses, and regulations'
                    : ' Her zaman yerel balıkçılık yasalarına, lisanslara ve düzenlemelere uyun'
                  }
                </li>
                <li>
                  <span className="font-medium">{isEnglish ? 'Conservation first:' : 'Önce koruma:'}</span>
                  {isEnglish 
                    ? ' Practice catch and release when appropriate, respect size and bag limits'
                    : ' Uygun olduğunda yakala-bırak uygulayın, boy ve torba limitlerini dikkate alın'
                  }
                </li>
                <li>
                  <span className="font-medium">{isEnglish ? 'Private property:' : 'Özel mülkiyet:'}</span>
                  {isEnglish 
                    ? ' Only fish where you have permission; respect private property rights'
                    : ' Sadece izniniz olan yerlerde balık tutun; özel mülkiyet haklarına saygı gösterin'
                  }
                </li>
                <li>
                  <span className="font-medium">{isEnglish ? 'Environmental responsibility:' : 'Çevresel sorumluluk:'}</span>
                  {isEnglish 
                    ? ' Leave no trace, properly dispose of fishing line and trash'
                    : ' İz bırakmayın, olta ipini ve çöpü uygun şekilde atın'
                  }
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '6. Content Standards' : '6. İçerik Standartları'}
              </h2>
              <p className="text-white/80 mb-3 text-sm font-medium">
                {isEnglish ? 'Prohibited Content:' : 'Yasaklı İçerik:'}
              </p>
              <ul className="list-disc pl-5 space-y-2 text-white/80 text-sm">
                <li>{isEnglish ? 'Nudity or sexual content' : 'Çıplaklık veya cinsel içerik'}</li>
                <li>{isEnglish ? 'Hate speech or discrimination based on race, ethnicity, religion, gender, or other characteristics' : 'Irk, etnik köken, din, cinsiyet veya diğer özelliklere dayalı nefret söylemi veya ayrımcılık'}</li>
                <li>{isEnglish ? 'False information or misleading content' : 'Yanlış bilgi veya yanıltıcı içerik'}</li>
                <li>{isEnglish ? 'Spam, scams, or deceptive practices' : 'Spam, dolandırıcılık veya aldatıcı uygulamalar'}</li>
                <li>{isEnglish ? 'Content that infringes intellectual property rights' : 'Fikri mülkiyet haklarını ihlal eden içerik'}</li>
                <li>{isEnglish ? 'Illegal fishing methods or poaching' : 'Yasadışı balıkçılık yöntemleri veya kaçak avcılık'}</li>
                <li>{isEnglish ? 'Sale of protected or endangered species' : 'Korunan veya nesli tükenmekte olan türlerin satışı'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '7. Location Sharing' : '7. Konum Paylaşımı'}
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-white/80 text-sm">
                <li>
                  <span className="font-medium">{isEnglish ? 'Be considerate:' : 'Düşünceli olun:'}</span>
                  {isEnglish 
                    ? ' When sharing fishing spots, consider the impact of increased traffic'
                    : ' Balıkçılık noktalarını paylaşırken, artan trafiğin etkisini düşünün'
                  }
                </li>
                <li>
                  <span className="font-medium">{isEnglish ? 'Respect local wishes:' : 'Yerel isteklere saygı gösterin:'}</span>
                  {isEnglish 
                    ? ' Some locations prefer to remain secret; respect these wishes'
                    : ' Bazı lokasyonlar gizli kalmayı tercih eder; bu isteklere saygı gösterin'
                  }
                </li>
                <li>
                  <span className="font-medium">{isEnglish ? 'Accurate information:' : 'Doğru bilgi:'}</span>
                  {isEnglish 
                    ? ' Provide accurate location information and access details'
                    : ' Doğru konum bilgisi ve erişim detayları sağlayın'
                  }
                </li>
                <li>
                  <span className="font-medium">{isEnglish ? 'Safety warnings:' : 'Güvenlik uyarıları:'}</span>
                  {isEnglish 
                    ? ' Include any relevant safety information about locations'
                    : ' Konumlar hakkında ilgili güvenlik bilgilerini ekleyin'
                  }
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '8. Enforcement' : '8. Uygulama'}
              </h2>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'We take violations of these guidelines seriously. Depending on the severity and frequency of violations, we may:'
                  : 'Bu kuralların ihlallerini ciddiye alıyoruz. İhlallerin ciddiyetine ve sıklığına bağlı olarak şunları yapabiliriz:'
                }
              </p>
              <ul className="list-disc pl-5 space-y-1 text-white/80 text-sm mb-4">
                <li>{isEnglish ? 'Remove violating content' : 'İhlal eden içeriği kaldırma'}</li>
                <li>{isEnglish ? 'Issue warnings to users' : 'Kullanıcılara uyarı verme'}</li>
                <li>{isEnglish ? 'Temporarily suspend accounts' : 'Hesapları geçici olarak askıya alma'}</li>
                <li>{isEnglish ? 'Permanently ban repeat offenders' : 'Tekrarlayan ihlalcileri kalıcı olarak yasaklama'}</li>
                <li>{isEnglish ? 'Report illegal activities to authorities' : 'Yasadışı faaliyetleri yetkililere bildirme'}</li>
              </ul>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'We reserve the right to remove any content or suspend any account at our discretion. Our decisions are final.'
                  : 'Kendi takdirimize bağlı olarak herhangi bir içeriği kaldırma veya herhangi bir hesabı askıya alma hakkını saklı tutarız. Kararlarımız nihaidir.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '9. Reporting Violations' : '9. İhlalleri Bildirme'}
              </h2>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'If you see content or behavior that violates these guidelines:'
                  : 'Bu kuralları ihlal eden içerik veya davranış görürseniz:'
                }
              </p>
              <ul className="list-disc pl-5 space-y-1 text-white/80 text-sm mb-4">
                <li>{isEnglish ? 'Use the in-app reporting feature' : 'Uygulama içi bildirim özelliğini kullanın'}</li>
                <li>{isEnglish ? 'Contact us at report@fishivo.com' : 'report@fishivo.com adresinden bize ulaşın'}</li>
                <li>{isEnglish ? 'Include screenshots or links to the content' : 'İçeriğin ekran görüntülerini veya bağlantılarını ekleyin'}</li>
                <li>{isEnglish ? 'Explain why you believe it violates our guidelines' : 'Kurallarımızı neden ihlal ettiğini düşündüğünüzü açıklayın'}</li>
              </ul>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'We review all reports and take appropriate action. Reporter identities are kept confidential.'
                  : 'Tüm raporları inceler ve uygun önlemleri alırız. Bildirimde bulunanların kimlikleri gizli tutulur.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '10. Changes to Guidelines' : '10. Kurallardaki Değişiklikler'}
              </h2>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'We may update these Community Guidelines from time to time. We will notify users of significant changes. Your continued use of Fishivo after changes constitutes acceptance of the updated guidelines.'
                  : 'Bu Topluluk Kurallarını zaman zaman güncelleyebiliriz. Önemli değişiklikleri kullanıcılara bildireceğiz. Değişikliklerden sonra Fishivo\'yu kullanmaya devam etmeniz, güncellenmiş kuralları kabul ettiğiniz anlamına gelir.'
                }
              </p>
            </section>

            <div className="border-t border-white/20 pt-4 mt-6">
              <p className="text-white/50 text-xs text-center">
                {isEnglish
                  ? 'Thank you for helping us maintain a positive and respectful fishing community!'
                  : 'Olumlu ve saygılı bir balıkçılık topluluğu sürdürmemize yardımcı olduğunuz için teşekkürler!'
                }
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}