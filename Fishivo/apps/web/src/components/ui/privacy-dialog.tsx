'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PrivacyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: 'en' | 'tr'
}

export function PrivacyDialog({ open, onOpenChange, locale }: PrivacyDialogProps) {
  const isEnglish = locale === 'en'
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] bg-black border-white/20 text-white p-0 [&>button]:text-white/70 [&>button]:hover:text-white [&>button]:hover:bg-white/10">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/20">
          <DialogTitle className="text-2xl font-bold">
            {isEnglish ? 'Privacy Policy' : 'Gizlilik Politikası'}
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
                {isEnglish ? '1. Introduction' : '1. Giriş'}
              </h2>
              <p className="text-white/80 leading-relaxed text-sm mb-3">
                {isEnglish
                  ? 'Welcome to Fishivo ("we," "our," or "us"). We are committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, share, and protect information when you use the Fishivo mobile application, website (fishivo.com), and related services (collectively, the "Services").'
                  : 'Fishivo\'ya hoş geldiniz ("biz", "bizim"). Gizliliğinizi ve kişisel verilerinizi korumaya kararlıyız. Bu Gizlilik Politikası, Fishivo mobil uygulaması, web sitesi (fishivo.com) ve ilgili hizmetleri (topluca "Hizmetler") kullandığınızda bilgileri nasıl topladığımızı, kullandığımızı, paylaştığımızı ve koruduğumuzu açıklar.'
                }
              </p>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'By using our Services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our Services.'
                  : 'Hizmetlerimizi kullanarak, bilgilerinizin bu politikaya uygun olarak toplanmasını ve kullanılmasını kabul etmiş olursunuz. Politika ve uygulamalarımızı kabul etmiyorsanız, lütfen Hizmetlerimizi kullanmayın.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '2. Information We Collect' : '2. Toplanan Bilgiler'}
              </h2>
              
              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '2.1 Personal Information' : '2.1 Kişisel Bilgiler'}
              </h3>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'During your use of Fishivo, we may collect the following personal information:'
                  : 'Fishivo kullanımınız sırasında aşağıdaki kişisel bilgileri toplayabiliriz:'
                }
              </p>
              <ul className="list-disc pl-5 space-y-1 text-white/80 text-sm">
                <li>{isEnglish ? 'Name, surname, and username' : 'Ad, soyad ve kullanıcı adı'}</li>
                <li>{isEnglish ? 'Email address' : 'E-posta adresi'}</li>
                <li>{isEnglish ? 'Profile photo' : 'Profil fotoğrafı'}</li>
                <li>{isEnglish ? 'Fishing experiences and shared content' : 'Balık tutma deneyimleri ve paylaştığınız içerikler'}</li>
                <li>{isEnglish ? 'Location information (with your permission)' : 'Lokasyon bilgileri (izninizle)'}</li>
                <li>{isEnglish ? 'Device information and usage data' : 'Cihaz bilgileri ve kullanım verileri'}</li>
              </ul>

              <h3 className="text-base font-medium mb-2 mt-4">
                {isEnglish ? '2.2 Automatically Collected Information' : '2.2 Otomatik Toplanan Bilgiler'}
              </h3>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'When you use our app, we automatically collect certain technical information to improve service quality: IP address, device type, operating system, app usage statistics, and crash reports.'
                  : 'Uygulamamızı kullandığınızda, hizmet kalitesini artırmak için otomatik olarak bazı teknik bilgiler toplanır: IP adresi, cihaz türü, işletim sistemi, uygulama kullanım istatistikleri ve çökme raporları.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '3. Use of Information' : '3. Bilgilerin Kullanımı'}
              </h2>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'We use your collected personal data for the following purposes:'
                  : 'Toplanan kişisel verilerinizi aşağıdaki amaçlarla kullanırız:'
                }
              </p>
              <ul className="list-disc pl-5 space-y-1 text-white/80 text-sm">
                <li>{isEnglish ? 'To provide and improve Fishivo services' : 'Fishivo hizmetlerini sağlamak ve geliştirmek'}</li>
                <li>{isEnglish ? 'To manage your user account' : 'Kullanıcı hesabınızı yönetmek'}</li>
                <li>{isEnglish ? 'To provide personalized content' : 'Kişiselleştirilmiş içerik sunmak'}</li>
                <li>{isEnglish ? 'To provide customer support' : 'Müşteri desteği sağlamak'}</li>
                <li>{isEnglish ? 'To implement security measures' : 'Güvenlik önlemlerini uygulamak'}</li>
                <li>{isEnglish ? 'To fulfill legal obligations' : 'Yasal yükümlülükleri yerine getirmek'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '4. Data Sharing and Third Parties' : '4. Veri Paylaşımı ve Üçüncü Taraflar'}
              </h2>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'We may share your information in the following circumstances:'
                  : 'Bilgilerinizi aşağıdaki durumlarda paylaşabiliriz:'
                }
              </p>
              <ul className="list-disc pl-5 space-y-1 text-white/80 text-sm mb-4">
                <li>{isEnglish ? 'With your consent or at your direction' : 'Sizin onayınız veya talimatınızla'}</li>
                <li>{isEnglish ? 'With service providers who assist in our operations' : 'Operasyonlarımızda yardımcı olan hizmet sağlayıcılarla'}</li>
                <li>{isEnglish ? 'To comply with legal obligations' : 'Yasal yükümlülükleri yerine getirmek için'}</li>
                <li>{isEnglish ? 'To protect rights, safety, and property' : 'Hakları, güvenliği ve mülkiyeti korumak için'}</li>
                <li>{isEnglish ? 'In connection with business transfers' : 'İş transferleri ile bağlantılı olarak'}</li>
              </ul>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'We do not sell, rent, or trade your personal information to third parties for their marketing purposes.'
                  : 'Kişisel bilgilerinizi pazarlama amaçları için üçüncü taraflara satmaz, kiralamaz veya takas etmeyiz.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '5. Data Retention' : '5. Veri Saklama'}
              </h2>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'We retain your personal information for as long as necessary to:'
                  : 'Kişisel bilgilerinizi aşağıdaki amaçlar için gerekli olduğu sürece saklarız:'
                }
              </p>
              <ul className="list-disc pl-5 space-y-1 text-white/80 text-sm mb-4">
                <li>{isEnglish ? 'Provide our Services to you' : 'Size Hizmetlerimizi sağlamak'}</li>
                <li>{isEnglish ? 'Comply with legal obligations' : 'Yasal yükümlülüklere uymak'}</li>
                <li>{isEnglish ? 'Resolve disputes and enforce agreements' : 'Anlaşmazlıkları çözmek ve sözleşmeleri uygulamak'}</li>
                <li>{isEnglish ? 'Conduct research and analytics' : 'Araştırma ve analitik yapmak'}</li>
              </ul>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'When you delete your account, we delete your personal information, though some information may persist in encrypted backups for a limited time.'
                  : 'Hesabınızı sildiğinizde, kişisel bilgilerinizi sileriz, ancak bazı bilgiler şifrelenmiş yedeklerde sınırlı bir süre kalabilir.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '6. Your Rights and Choices' : '6. Haklarınız ve Seçimleriniz'}
              </h2>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'You have the following rights regarding your personal data:'
                  : 'Kişisel verilerinizle ilgili aşağıdaki haklara sahipsiniz:'
                }
              </p>
              <ul className="list-disc pl-5 space-y-1 text-white/80 text-sm mb-4">
                <li>{isEnglish ? 'Access: Request a copy of your personal data' : 'Erişim: Kişisel verilerinizin bir kopyasını talep etme'}</li>
                <li>{isEnglish ? 'Correction: Update or correct inaccurate data' : 'Düzeltme: Yanlış verileri güncelleme veya düzeltme'}</li>
                <li>{isEnglish ? 'Deletion: Request deletion of your personal data' : 'Silme: Kişisel verilerinizin silinmesini talep etme'}</li>
                <li>{isEnglish ? 'Portability: Receive your data in a portable format' : 'Taşınabilirlik: Verilerinizi taşınabilir formatta alma'}</li>
                <li>{isEnglish ? 'Objection: Object to certain processing activities' : 'İtiraz: Belirli işleme faaliyetlerine itiraz etme'}</li>
                <li>{isEnglish ? 'Restriction: Request restriction of processing' : 'Kısıtlama: İşlemenin kısıtlanmasını talep etme'}</li>
              </ul>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'To exercise these rights, please contact us at privacy@fishivo.com. We will respond to your request within 30 days.'
                  : 'Bu hakları kullanmak için lütfen privacy@fishivo.com adresinden bizimle iletişime geçin. Talebinize 30 gün içinde yanıt vereceğiz.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '7. Children\'s Privacy' : '7. Çocukların Gizliliği'}
              </h2>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'Our Services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will take steps to delete such information.'
                  : 'Hizmetlerimiz 13 yaşından küçük çocuklar için tasarlanmamıştır. 13 yaşından küçük çocuklardan bilerek kişisel bilgi toplamayız. 13 yaşından küçük bir çocuktan kişisel bilgi topladığımızı öğrenirsek, bu bilgileri silmek için adımlar atacağız.'
                }
              </p>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'If you are a parent or guardian and believe your child has provided us with personal information, please contact us at privacy@fishivo.com.'
                  : 'Ebeveyn veya vasi iseniz ve çocuğunuzun bize kişisel bilgi sağladığına inanıyorsanız, lütfen privacy@fishivo.com adresinden bizimle iletişime geçin.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '8. Data Security' : '8. Veri Güvenliği'}
              </h2>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction:'
                  : 'Kişisel verilerinizi yetkisiz erişim, değişiklik, ifşa veya imhaya karşı korumak için uygun teknik ve organizasyonel önlemler uyguluyoruz:'
                }
              </p>
              <ul className="list-disc pl-5 space-y-1 text-white/80 text-sm mb-4">
                <li>{isEnglish ? 'SSL/TLS encryption for data transmission' : 'Veri iletimi için SSL/TLS şifreleme'}</li>
                <li>{isEnglish ? 'Secure cloud infrastructure (Supabase)' : 'Güvenli bulut altyapısı (Supabase)'}</li>
                <li>{isEnglish ? 'Regular security audits and updates' : 'Düzenli güvenlik denetimleri ve güncellemeleri'}</li>
                <li>{isEnglish ? 'Access controls and authentication' : 'Erişim kontrolleri ve kimlik doğrulama'}</li>
                <li>{isEnglish ? 'Employee training on data protection' : 'Veri koruma konusunda çalışan eğitimi'}</li>
              </ul>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'However, no method of transmission over the internet is 100% secure. While we strive to protect your personal data, we cannot guarantee absolute security.'
                  : 'Ancak, internet üzerinden hiçbir iletim yöntemi %100 güvenli değildir. Kişisel verilerinizi korumaya çalışsak da, mutlak güvenliği garanti edemeyiz.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '9. Cookies and Tracking Technologies' : '9. Çerezler ve İzleme Teknolojileri'}
              </h2>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'We use cookies and similar tracking technologies to track activity on our Services and hold certain information. Cookies are small text files placed on your device when you visit our website.'
                  : 'Hizmetlerimizdeki aktiviteyi izlemek ve belirli bilgileri tutmak için çerezler ve benzer izleme teknolojileri kullanıyoruz. Çerezler, web sitemizi ziyaret ettiğinizde cihazınıza yerleştirilen küçük metin dosyalarıdır.'
                }
              </p>
              
              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '9.1 Types of Cookies We Use' : '9.1 Kullandığımız Çerez Türleri'}
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-white/80 text-sm mb-4">
                <li>
                  <span className="font-medium">{isEnglish ? 'Essential Cookies:' : 'Zorunlu Çerezler:'}</span>
                  {isEnglish 
                    ? ' Required for the website to function properly (authentication, security, session management)'
                    : ' Web sitesinin düzgün çalışması için gerekli (kimlik doğrulama, güvenlik, oturum yönetimi)'
                  }
                </li>
                <li>
                  <span className="font-medium">{isEnglish ? 'Functional Cookies:' : 'İşlevsel Çerezler:'}</span>
                  {isEnglish 
                    ? ' Enable enhanced functionality and personalization (language preferences, theme settings)'
                    : ' Gelişmiş işlevselliği ve kişiselleştirmeyi sağlar (dil tercihleri, tema ayarları)'
                  }
                </li>
                <li>
                  <span className="font-medium">{isEnglish ? 'Performance Cookies:' : 'Performans Çerezleri:'}</span>
                  {isEnglish 
                    ? ' Help us understand how visitors interact with our Services (analytics, error tracking)'
                    : ' Ziyaretçilerin Hizmetlerimizle nasıl etkileşime girdiğini anlamamiza yardımcı olur (analitik, hata izleme)'
                  }
                </li>
                <li>
                  <span className="font-medium">{isEnglish ? 'Marketing Cookies:' : 'Pazarlama Çerezleri:'}</span>
                  {isEnglish 
                    ? ' Used to track visitors across websites to display relevant advertisements'
                    : ' İlgili reklamları görüntülemek için ziyaretçileri web siteleri arasında izlemek için kullanılır'
                  }
                </li>
              </ul>
              
              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '9.2 Third-Party Services' : '9.2 Üçüncü Taraf Hizmetleri'}
              </h3>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'We use the following third-party services that may set cookies:'
                  : 'Aşağıdaki üçüncü taraf hizmetlerini kullanıyoruz ve bunlar çerez ayarlayabilir:'
                }
              </p>
              <ul className="list-disc pl-5 space-y-1 text-white/80 text-sm mb-4">
                <li>{isEnglish ? 'Google Analytics - For usage analytics' : 'Google Analytics - Kullanım analitiği için'}</li>
                <li>{isEnglish ? 'OpenFreeMap - For free map functionality' : 'OpenFreeMap - Ücretsiz harita işlevselliği için'}</li>
                <li>{isEnglish ? 'Supabase - For authentication' : 'Supabase - Kimlik doğrulama için'}</li>
                <li>{isEnglish ? 'Social Media - For social login features' : 'Sosyal Medya - Sosyal giriş özellikleri için'}</li>
              </ul>
              
              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '9.3 Managing Cookies' : '9.3 Çerezleri Yönetme'}
              </h3>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'You can control and manage cookies in various ways:'
                  : 'Çerezleri çeşitli şekillerde kontrol edebilir ve yönetebilirsiniz:'
                }
              </p>
              <ul className="list-disc pl-5 space-y-1 text-white/80 text-sm mb-4">
                <li>{isEnglish ? 'Browser settings - Most browsers allow you to refuse or delete cookies' : 'Tarayıcı ayarları - Çoğu tarayıcı çerezleri reddetmenize veya silmenize olanak tanır'}</li>
                <li>{isEnglish ? 'Cookie preferences - We show a consent banner when you first visit' : 'Çerez tercihleri - İlk ziyaretinizde bir onay bannerı gösteririz'}</li>
                <li>{isEnglish ? 'Mobile settings - Manage cookies in app settings under Privacy' : 'Mobil ayarlar - Gizlilik altında uygulama ayarlarında çerezleri yönetin'}</li>
              </ul>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'Please note that disabling certain cookies may impact the functionality of our Services. For more detailed information about cookies, please see our full Cookie Policy.'
                  : 'Belirli çerezleri devre dışı bırakmanın Hizmetlerimizin işlevselliğini etkileyebileceğini unutmayın. Çerezler hakkında daha ayrıntılı bilgi için lütfen tam Çerez Politikamıza bakın.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '10. International Data Transfers' : '10. Uluslararası Veri Transferleri'}
              </h2>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'Fishivo is operated by a company registered in the United Kingdom. Your personal data may be transferred to, stored, and processed in the UK and other countries where we have facilities or service providers. By using our Services, you consent to the transfer of your information outside of your country of residence.'
                  : 'Fishivo, İngiltere\'de kayıtlı bir şirket tarafından işletilmektedir. Kişisel verileriniz, tesislerimizin veya hizmet sağlayıcılarımızın bulunduğu İngiltere ve diğer ülkelere aktarılabilir, buralarda saklanabilir ve işlenebilir. Hizmetlerimizi kullanarak, bilgilerinizin ikamet ettiğiniz ülke dışına aktarılmasına onay vermiş olursunuz.'
                }
              </p>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'We ensure appropriate safeguards are in place for international data transfers, including:'
                  : 'Uluslararası veri transferleri için aşağıdakiler dahil uygun güvenlik önlemlerinin alınmasını sağlarız:'
                }
              </p>
              <ul className="list-disc pl-5 space-y-1 text-white/80 text-sm mb-4">
                <li>{isEnglish ? 'Standard contractual clauses approved by relevant authorities' : 'İlgili makamlar tarafından onaylı standart sözleşme maddeleri'}</li>
                <li>{isEnglish ? 'Ensuring recipients provide adequate data protection' : 'Alıcıların yeterli veri koruması sağlamasını temin etme'}</li>
                <li>{isEnglish ? 'Compliance with UK GDPR and Turkish KVKK where applicable' : 'Uygulanabilir olduğu yerlerde UK GDPR ve Türkiye KVKK\'ya uyum'}</li>
              </ul>
              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '10.1 Turkish Users\' Rights' : '10.1 Türk Kullanıcıların Hakları'}
              </h3>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'If you are a Turkish resident, you have additional rights under the Turkish Personal Data Protection Law (KVKK). You may contact us at privacy@fishivo.com to exercise your rights under KVKK, including the right to object to international data transfers in certain circumstances.'
                  : 'Türkiye\'de ikamet ediyorsanız, Türk Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında ek haklara sahipsiniz. Belirli durumlarda uluslararası veri transferlerine itiraz hakkı dahil olmak üzere KVKK kapsamındaki haklarınızı kullanmak için privacy@fishivo.com adresinden bizimle iletişime geçebilirsiniz.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '11. Changes to This Policy' : '11. Bu Politikadaki Değişiklikler'}
              </h2>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this policy.'
                  : 'Gizlilik Politikamızı zaman zaman güncelleyebiliriz. Herhangi bir değişikliği, yeni Gizlilik Politikasını bu sayfada yayınlayarak ve bu politikanın başındaki "Son güncelleme" tarihini güncelleyerek size bildireceğiz.'
                }
              </p>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'For significant changes, we will provide a more prominent notice (including, for certain services, email notification of privacy policy changes).'
                  : 'Önemli değişiklikler için, daha belirgin bir bildirim sağlayacağız (belirli hizmetler için gizlilik politikası değişikliklerinin e-posta bildirimi dahil).'
                }
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '12. Contact Us' : '12. Bize Ulaşın'}
              </h2>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:'
                  : 'Bu Gizlilik Politikası veya veri uygulamalarımız hakkında herhangi bir sorunuz, endişeniz veya talebiniz varsa, lütfen bizimle iletişime geçin:'
                }
              </p>
              <ul className="list-disc pl-5 space-y-1 text-white/80 text-sm mb-4">
                <li>{isEnglish ? 'Email: privacy@fishivo.com' : 'E-posta: privacy@fishivo.com'}</li>
                <li>{isEnglish ? 'Support: support@fishivo.com' : 'Destek: support@fishivo.com'}</li>
                <li>{isEnglish ? 'Website: fishivo.com/contact' : 'Web sitesi: fishivo.com/contact'}</li>
              </ul>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'Data Protection Officer: For privacy-related inquiries, you may also contact our Data Protection Officer at dpo@fishivo.com.'
                  : 'Veri Koruma Görevlisi: Gizlilikle ilgili sorularınız için, Veri Koruma Görevlimiz ile dpo@fishivo.com adresinden iletişime geçebilirsiniz.'
                }
              </p>
            </section>

            <div className="border-t border-white/20 pt-4 mt-6">
              <p className="text-white/50 text-xs text-center">
                {isEnglish
                  ? 'This Privacy Policy is governed by the laws of the United Kingdom. We also comply with applicable data protection laws in the countries where we operate, including the Turkish Personal Data Protection Law (KVKK) for our Turkish users.'
                  : 'Bu Gizlilik Politikası İngiltere yasalarına tabidir. Ayrıca, Türk kullanıcılarımız için Türk Kişisel Verilerin Korunması Kanunu (KVKK) dahil olmak üzere faaliyet gösterdiğimiz ülkelerdeki geçerli veri koruma yasalarına uyum sağlarız.'
                }
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}