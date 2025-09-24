'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TermsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: 'en' | 'tr'
}

export function TermsDialog({ open, onOpenChange, locale }: TermsDialogProps) {
  const isEnglish = locale === 'en'
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] bg-black border-white/20 text-white p-0 [&>button]:text-white/70 [&>button]:hover:text-white [&>button]:hover:bg-white/10">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/20">
          <DialogTitle className="text-2xl font-bold">
            {isEnglish ? 'Terms of Service' : 'Kullanım Şartları'}
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
                {isEnglish ? '1. Introduction and Acceptance' : '1. Giriş ve Kabul'}
              </h2>
              <p className="text-white/80 leading-relaxed text-sm mb-3">
                {isEnglish
                  ? 'Welcome to Fishivo. These Terms of Service ("Terms", "Terms of Service") govern your use of the Fishivo mobile application, website located at fishivo.com, and any related services provided by Fishivo (collectively, the "Services").'
                  : 'Fishivo\'ya hoş geldiniz. Bu Kullanım Şartları ("Şartlar", "Kullanım Şartları"), Fishivo mobil uygulaması, fishivo.com adresinde bulunan web sitesi ve Fishivo tarafından sağlanan tüm ilgili hizmetlerin (topluca "Hizmetler") kullanımınızı düzenler.'
                }
              </p>
              <p className="text-white/80 text-sm mb-3">
                {isEnglish
                  ? 'By accessing or using our Services, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Services.'
                  : 'Hizmetlerimize erişerek veya kullanarak, bu Şartlara bağlı olmayı kabul edersiniz. Bu şartların herhangi bir bölümüne katılmıyorsanız, Hizmetlere erişemezsiniz.'
                }
              </p>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'These Terms apply to all visitors, users, and others who access or use the Services. We reserve the right to update and change these Terms at any time without notice.'
                  : 'Bu Şartlar, Hizmetlere erişen veya kullanan tüm ziyaretçiler, kullanıcılar ve diğerleri için geçerlidir. Bu Şartları herhangi bir zamanda bildirimde bulunmadan güncelleme ve değiştirme hakkını saklı tutarız.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '2. Service Description' : '2. Hizmet Tanımı'}
              </h2>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'Fishivo is a social platform and mobile application designed for sharing fishing experiences, discovering fishing locations, and engaging with the fishing community. Our service includes:'
                  : 'Fishivo, balık tutma deneyimlerini paylaşmak, balıkçılık lokasyonları keşfetmek ve balıkçı topluluğu ile etkileşime geçmek için tasarlanmış bir sosyal platform ve mobil uygulamadır. Hizmetimiz şunları içerir:'
                }
              </p>
              <ul className="list-disc pl-5 space-y-1 text-white/80 text-sm">
                <li>{isEnglish ? 'Sharing fishing experiences' : 'Balık tutma deneyimlerini paylaşma'}</li>
                <li>{isEnglish ? 'Uploading photos and videos' : 'Fotoğraf ve video yükleme'}</li>
                <li>{isEnglish ? 'Location discovery and sharing' : 'Lokasyon keşfi ve paylaşımı'}</li>
                <li>{isEnglish ? 'Social interaction features' : 'Sosyal etkileşim özellikleri'}</li>
                <li>{isEnglish ? 'Weather information' : 'Hava durumu bilgileri'}</li>
                <li>{isEnglish ? 'Community forums' : 'Topluluk forumları'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '3. User Account' : '3. Kullanıcı Hesabı'}
              </h2>
              
              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '3.1 Account Creation' : '3.1 Hesap Oluşturma'}
              </h3>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'You must create an account to use Fishivo. You must provide accurate and current information during registration.'
                  : 'Fishivo\'yu kullanmak için bir hesap oluşturmanız gerekir. Kayıt sırasında doğru ve güncel bilgiler sağlamalısınız.'
                }
              </p>

              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '3.2 Age Restriction' : '3.2 Yaş Sınırı'}
              </h3>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'You must be at least 13 years old to use Fishivo. Users under 18 must obtain parental or guardian permission.'
                  : 'Fishivo\'yu kullanmak için en az 13 yaşında olmalısınız. 18 yaşından küçük kullanıcılar ebeveyn veya vasi iznini almalıdır.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '4. Usage Rules' : '4. Kullanım Kuralları'}
              </h2>
              
              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '4.1 Permitted Use' : '4.1 İzin Verilen Kullanım'}
              </h3>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'You may use Fishivo for legal purposes and in accordance with these terms:'
                  : 'Fishivo\'yu yasal amaçlarla ve bu şartlara uygun olarak kullanabilirsiniz:'
                }
              </p>
              <ul className="list-disc pl-5 space-y-1 text-white/80 text-sm mb-4">
                <li>{isEnglish ? 'Share your personal fishing experiences' : 'Kişisel balık tutma deneyimlerinizi paylaşmak'}</li>
                <li>{isEnglish ? 'Interact with other users' : 'Diğer kullanıcılarla etkileşime geçmek'}</li>
                <li>{isEnglish ? 'Learn and share fishing knowledge' : 'Balıkçılık bilgilerini öğrenmek ve paylaşmak'}</li>
                <li>{isEnglish ? 'Explore location information' : 'Lokasyon bilgilerini keşfetmek'}</li>
              </ul>

              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '4.2 Prohibited Behaviors' : '4.2 Yasaklı Davranışlar'}
              </h3>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'The following behaviors are strictly prohibited:'
                  : 'Aşağıdaki davranışlar kesinlikle yasaktır:'
                }
              </p>
              <ul className="list-disc pl-5 space-y-1 text-white/80 text-sm">
                <li>{isEnglish ? 'Sharing illegally caught fish' : 'Yasadışı avlanan balıkları paylaşmak'}</li>
                <li>{isEnglish ? 'Encouraging unauthorized fishing on private property' : 'Özel mülklerde izinsiz balık tutmayı teşvik etmek'}</li>
                <li>{isEnglish ? 'Hate speech, harassment, or bullying' : 'Nefret söylemi, taciz veya zorbalık'}</li>
                <li>{isEnglish ? 'Spam, fake accounts, or bot usage' : 'Spam, sahte hesap veya bot kullanımı'}</li>
                <li>{isEnglish ? 'Copyright infringement' : 'Telif hakkı ihlali'}</li>
                <li>{isEnglish ? 'Sharing personal information without permission' : 'Kişisel bilgileri izinsiz paylaşmak'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '5. Content and Intellectual Property' : '5. İçerik ve Fikri Mülkiyet'}
              </h2>
              
              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '5.1 Your Content' : '5.1 Sizin İçeriğiniz'}
              </h3>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'You retain ownership of all content you submit, post, or display on or through the Services ("User Content"). By posting User Content, you grant Fishivo a worldwide, non-exclusive, royalty-free, transferable, sub-licensable license to use, reproduce, distribute, prepare derivative works of, display, and perform your User Content in connection with the Services.'
                  : 'Hizmetler aracılığıyla gönderdiğiniz, yayınladığınız veya görüntülediğiniz tüm içeriğin ("Kullanıcı İçeriği") mülkiyetini korursunuz. Kullanıcı İçeriği yayınlayarak, Fishivo\'ya Hizmetlerle bağlantılı olarak Kullanıcı İçeriğinizi kullanmak, çoğaltmak, dağıtmak, türev çalışmalar hazırlamak, görüntülemek ve icra etmek için dünya çapında, münhasır olmayan, telif ücretsiz, devredilebilir, alt lisanslanabilir bir lisans vermiş olursunuz.'
                }
              </p>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'This license is for the limited purpose of operating and improving our Services. You may delete your User Content at any time, but copies may remain in backup systems for a reasonable period.'
                  : 'Bu lisans, Hizmetlerimizi işletmek ve geliştirmek için sınırlı amaçla verilmiştir. Kullanıcı İçeriğinizi istediğiniz zaman silebilirsiniz, ancak kopyalar makul bir süre yedekleme sistemlerinde kalabilir.'
                }
              </p>

              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '5.2 Content Standards' : '5.2 İçerik Standartları'}
              </h3>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'You represent and warrant that you own or have the necessary rights to all User Content you post. You agree not to post content that:'
                  : 'Yayınladığınız tüm Kullanıcı İçeriğine sahip olduğunuzu veya gerekli haklara sahip olduğunuzu beyan ve garanti edersiniz. Aşağıdaki içerikleri yayınlamamayı kabul edersiniz:'
                }
              </p>
              <ul className="list-disc pl-5 space-y-1 text-white/80 text-sm mb-4">
                <li>{isEnglish ? 'Infringes any third party\'s intellectual property rights' : 'Üçüncü tarafların fikri mülkiyet haklarını ihlal eden'}</li>
                <li>{isEnglish ? 'Violates any applicable law or regulation' : 'Geçerli yasa veya yönetmelikleri ihlal eden'}</li>
                <li>{isEnglish ? 'Contains false or misleading information' : 'Yanlış veya yanıltıcı bilgiler içeren'}</li>
                <li>{isEnglish ? 'Is defamatory, obscene, or offensive' : 'Hakaret içeren, müstehcen veya saldırgan olan'}</li>
                <li>{isEnglish ? 'Promotes illegal activities' : 'Yasadışı faaliyetleri teşvik eden'}</li>
              </ul>

              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '5.3 Fishivo Content' : '5.3 Fishivo İçeriği'}
              </h3>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'The Services, including all content, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by Fishivo, its licensors, or other providers of such material and are protected by intellectual property laws.'
                  : 'Tüm içerik, özellikler ve işlevselliği dahil olmak üzere Hizmetler (tüm bilgiler, yazılım, metin, görüntüler, resimler, video ve ses ile bunların tasarımı, seçimi ve düzenlenmesi dahil ancak bunlarla sınırlı olmamak üzere) Fishivo, lisans verenleri veya bu tür materyallerin diğer sağlayıcıları tarafından sahiplenilir ve fikri mülkiyet yasalarıyla korunur.'
                }
              </p>

              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '5.4 Copyright Policy' : '5.4 Telif Hakkı Politikası'}
              </h3>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'We respect the intellectual property rights of others and expect our users to do the same. It is our policy to respond to clear notices of alleged copyright infringement that comply with applicable law.'
                  : 'Başkalarının fikri mülkiyet haklarına saygı duyuyoruz ve kullanıcılarımızdan da aynısını bekliyoruz. Geçerli yasalara uygun olarak sunulan açık telif hakkı ihlali bildirimlerine yanıt vermek politikamızdır.'
                }
              </p>
              
              <h4 className="text-sm font-medium mb-2">
                {isEnglish ? 'DMCA Notice Procedure' : 'DMCA Bildirim Prosedürü'}
              </h4>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'To file a copyright infringement notice, please send a written communication to copyright@fishivo.com that includes:'
                  : 'Telif hakkı ihlali bildirimi göndermek için, lütfen copyright@fishivo.com adresine aşağıdakileri içeren yazılı bir iletişim gönderin:'
                }
              </p>
              <ul className="list-disc pl-5 space-y-1 text-white/80 text-sm mb-3">
                <li>{isEnglish ? 'Identification of the copyrighted work' : 'İhlal edilen telif haklı eserin tanımı'}</li>
                <li>{isEnglish ? 'Identification of the infringing material' : 'İhlal eden materyalin tanımı'}</li>
                <li>{isEnglish ? 'Your contact information' : 'İletişim bilgileriniz'}</li>
                <li>{isEnglish ? 'A statement of good faith belief' : 'İyi niyetli inanç beyanı'}</li>
                <li>{isEnglish ? 'A statement of accuracy and authorization' : 'Doğruluk ve yetki beyanı'}</li>
              </ul>
              
              <h4 className="text-sm font-medium mb-2">
                {isEnglish ? 'Repeat Infringer Policy' : 'Tekrarlayan İhlal Politikası'}
              </h4>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'We will terminate the accounts of users who are determined to be repeat infringers. A repeat infringer is a user who has been notified of infringing activity more than twice.'
                  : 'Tekrarlayan ihlalde bulunan kullanıcıların hesaplarını sonlandırırız. Tekrarlayan ihlalci, ihlal faaliyeti hakkında ikiden fazla kez bilgilendirilmiş kullanıcıdır.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '6. Account Termination' : '6. Hesap Sonlandırma'}
              </h2>
              
              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '6.1 By You' : '6.1 Sizin Tarafınızdan'}
              </h3>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'You may terminate your account at any time by contacting us at support@fishivo.com or through the account settings in the app. Upon termination, your right to use the Services will immediately cease.'
                  : 'Hesabınızı istediğiniz zaman support@fishivo.com adresinden bizimle iletişime geçerek veya uygulamadaki hesap ayarları üzerinden sonlandırabilirsiniz. Sonlandırma üzerine, Hizmetleri kullanma hakkınız derhal sona erecektir.'
                }
              </p>

              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '6.2 By Fishivo' : '6.2 Fishivo Tarafından'}
              </h3>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'We may terminate or suspend your account and access to the Services immediately, without prior notice or liability, for any reason, including:'
                  : 'Aşağıdakiler dahil herhangi bir nedenle, önceden bildirimde bulunmadan veya sorumluluk üstlenmeden hesabınızı ve Hizmetlere erişiminizi derhal sonlandırabilir veya askıya alabiliriz:'
                }
              </p>
              <ul className="list-disc pl-5 space-y-1 text-white/80 text-sm mb-4">
                <li>{isEnglish ? 'Breach of these Terms' : 'Bu Şartların ihlali'}</li>
                <li>{isEnglish ? 'Violation of applicable laws' : 'Geçerli yasaların ihlali'}</li>
                <li>{isEnglish ? 'Harmful or illegal activities' : 'Zararlı veya yasadışı faaliyetler'}</li>
                <li>{isEnglish ? 'Creating multiple accounts' : 'Birden fazla hesap oluşturma'}</li>
                <li>{isEnglish ? 'Extended periods of inactivity' : 'Uzun süreli hareketsizlik'}</li>
                <li>{isEnglish ? 'At our sole discretion' : 'Kendi takdirimize bağlı olarak'}</li>
              </ul>

              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '6.3 Effect of Termination' : '6.3 Sonlandırmanın Etkisi'}
              </h3>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'Upon termination, your right to use the Services will cease immediately. All provisions of these Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.'
                  : 'Sonlandırma üzerine, Hizmetleri kullanma hakkınız derhal sona erecektir. Doğası gereği sonlandırmadan sonra da geçerli olması gereken tüm hükümler, mülkiyet hükümleri, garanti red beyanları ve sorumluluk sınırlamaları dahil olmak üzere geçerli olmaya devam edecektir.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '7. Disclaimers and Limitations of Liability' : '7. Sorumluluk Reddi ve Sınırlamaları'}
              </h2>
              
              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '7.1 Service Disclaimer' : '7.1 Hizmet Sorumluluk Reddi'}
              </h3>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. FISHIVO DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.'
                  : 'HİZMETLER, AÇIK VEYA ZİMNİ HİÇBİR GARANTİ OLMAKSIZIN "OLDUĞU GİBİ" VE "MEVCUT OLDUĞU KADAR" TEMELİNDE SAĞLANMAKTADIR. FISHIVO, TİCARİ ELVİRİŞLİLİK, BELİRLİ BİR AMAÇ İÇİN UYGUNLUK VE İHLAL ETMEME DAHİL ANCAK BUNLARLA SINIRLI OLMAMAK ÜZERE TÜM GARANTİLERİ REDDEDER.'
                }
              </p>

              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '7.2 Limitation of Liability' : '7.2 Sorumluluk Sınırlaması'}
              </h3>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, FISHIVO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.'
                  : 'YASALARIN İZİN VERDİĞİ AZAMİ ÖLÇÜDE, FISHIVO DOĞRUDAN VEYA DOLAYLI OLARAK ORTAYA ÇIKAN DOLAYLI, ARIZA, ÖZEL, SONUÇ VEYA CEZAİ ZARARLARDAN VEYA KÂR VEYA GELİR KAYIPLARINDA SORUMLU OLMAYACAKTIR.'
                }
              </p>

              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '7.3 User Responsibilities' : '7.3 Kullanıcı Sorumlulukları'}
              </h3>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'You acknowledge that fishing activities can be dangerous. You are solely responsible for your safety and compliance with all applicable laws, regulations, and safety guidelines. Fishivo is not responsible for any injuries, damages, or legal issues arising from your fishing activities.'
                  : 'Balık tutma faaliyetlerinin tehlikeli olabileceğini kabul edersiniz. Güvenliğinizden ve tüm geçerli yasalar, yönetmelikler ve güvenlik kurallarına uyumunuzdan yalnızca siz sorumlusunuz. Fishivo, balık tutma faaliyetlerinizden kaynaklanan herhangi bir yaralanma, hasar veya yasal sorundan sorumlu değildir.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '8. Indemnification' : '8. Tazminat'}
              </h2>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'You agree to defend, indemnify, and hold harmless Fishivo and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys\' fees, arising out of or in any way connected with your access to or use of the Services, your User Content, or your violation of these Terms.'
                  : 'Hizmetlere erişiminiz veya kullanımınız, Kullanıcı İçeriğiniz veya bu Şartları ihlalinizden kaynaklanan veya herhangi bir şekilde bunlarla bağlantılı olan makul avukatlık ücretleri dahil her türlü iddia, sorumluluk, zarar, kayıp ve masraflara karşı Fishivo\'yu ve görevlilerini, yöneticilerini, çalışanlarını ve temsilcilerini savunmayı, tazmin etmeyi ve zarar vermemeyi kabul edersiniz.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '9. Governing Law and Dispute Resolution' : '9. Uygulanacak Hukuk ve Uyuşmazlık Çözümü'}
              </h2>
              
              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '9.1 Governing Law' : '9.1 Uygulanacak Hukuk'}
              </h3>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions.'
                  : 'Bu Şartlar, kanunlar ihtilafı hükümleri dikkate alınmaksızın İngiltere ve Galler yasalarına göre yönetilecek ve yorumlanacaktır.'
                }
              </p>

              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '9.2 Dispute Resolution' : '9.2 Uyuşmazlık Çözümü'}
              </h3>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'Any disputes arising out of or relating to these Terms or the Services shall be resolved through good faith negotiations. If the dispute cannot be resolved through negotiations, it shall be submitted to the exclusive jurisdiction of the courts of England and Wales.'
                  : 'Bu Şartlar veya Hizmetlerden kaynaklanan veya bunlarla ilgili herhangi bir uyuşmazlık iyi niyetli müzakereler yoluyla çözülecektir. Uyuşmazlık müzakereler yoluyla çözülemezse, İngiltere ve Galler mahkemelerinin münhasır yargı yetkisine sunulacaktır.'
                }
              </p>
              
              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '9.3 Compliance with Local Laws' : '9.3 Yerel Yasalara Uyum'}
              </h3>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'We comply with applicable local laws in the jurisdictions where we operate. For Turkish users, we acknowledge and respect the requirements of Law No. 5651 regarding internet content regulation. We will respond to lawful requests from Turkish authorities regarding content removal within the timeframes specified by law (48 hours for personal rights violations).'
                  : 'Faaliyet gösterdiğimiz yargı bölgelerinde geçerli yerel yasalara uyarız. Türk kullanıcılar için, internet içerik düzenlemesine ilişkin 5651 sayılı Kanun\'un gerekliliklerini kabul eder ve bunlara saygı duyarız. Türk makamlarından gelen içerik kaldırma taleplerine yasada belirtilen süreler içinde (kişilik hakları ihlalleri için 48 saat) yanıt vereceğiz.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '10. Changes to Terms' : '10. Şartlardaki Değişiklikler'}
              </h2>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.'
                  : 'Bu Şartları istediğimiz zaman değiştirme veya değiştirme hakkını saklı tutarız. Revizyon önemli ise, yeni şartların yürürlüğe girmesinden en az 30 gün önce bildirimde bulunacağız.'
                }
              </p>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'Your continued use of the Services after any changes become effective constitutes your acceptance of the revised Terms. If you do not agree to the new terms, please stop using the Services.'
                  : 'Değişikliklerin yürürlüğe girmesinden sonra Hizmetleri kullanmaya devam etmeniz, revize edilmiş Şartları kabul ettiğiniz anlamına gelir. Yeni şartları kabul etmiyorsanız, lütfen Hizmetleri kullanmayı bırakın.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '11. General Terms' : '11. Genel Şartlar'}
              </h2>
              
              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '11.1 Entire Agreement' : '11.1 Sözleşmenin Tamamı'}
              </h3>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'These Terms, together with our Privacy Policy and any other legal notices published by us on the Services, constitute the entire agreement between you and Fishivo.'
                  : 'Bu Şartlar, Gizlilik Politikamız ve Hizmetlerde tarafımızdan yayınlanan diğer yasal bildirimlerle birlikte, sizinle Fishivo arasındaki sözleşmenin tamamını oluşturur.'
                }
              </p>

              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '11.2 Severability' : '11.2 Ayrılabilirlik'}
              </h3>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions will continue in full force and effect.'
                  : 'Bu Şartların herhangi bir hükmünün geçersiz veya uygulanamaz olduğu tespit edilirse, kalan hükümler tam güç ve etkiyle devam edecektir.'
                }
              </p>

              <h3 className="text-base font-medium mb-2">
                {isEnglish ? '11.3 Waiver' : '11.3 Feragat'}
              </h3>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.'
                  : 'Bu Şartların herhangi bir hakkını veya hükmünü uygulamamamız, bu haklardan feragat edildiği anlamına gelmeyecektir.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                {isEnglish ? '12. Contact Information' : '12. İletişim Bilgileri'}
              </h2>
              <p className="text-white/80 mb-3 text-sm">
                {isEnglish
                  ? 'If you have any questions about these Terms of Service, please contact us:'
                  : 'Bu Kullanım Şartları hakkında herhangi bir sorunuz varsa, lütfen bizimle iletişime geçin:'
                }
              </p>
              <ul className="list-disc pl-5 space-y-1 text-white/80 text-sm mb-4">
                <li>{isEnglish ? 'Email: legal@fishivo.com' : 'E-posta: legal@fishivo.com'}</li>
                <li>{isEnglish ? 'Support: support@fishivo.com' : 'Destek: support@fishivo.com'}</li>
                <li>{isEnglish ? 'Website: fishivo.com/contact' : 'Web sitesi: fishivo.com/contact'}</li>
              </ul>
              <p className="text-white/80 text-sm">
                {isEnglish
                  ? 'For copyright infringement claims: copyright@fishivo.com'
                  : 'Telif hakkı ihlali iddiaları için: copyright@fishivo.com'
                }
              </p>
              <p className="text-white/80 text-sm mt-2">
                {isEnglish
                  ? 'For privacy-related inquiries: privacy@fishivo.com'
                  : 'Gizlilikle ilgili sorular için: privacy@fishivo.com'
                }
              </p>
            </section>

            <div className="border-t border-white/20 pt-4 mt-6">
              <p className="text-white/50 text-xs text-center">
                {isEnglish
                  ? 'Fishivo is operated by a company registered in the United Kingdom. These Terms are governed by UK law while respecting applicable local regulations where we operate.'
                  : 'Fishivo, İngiltere\'de kayıtlı bir şirket tarafından işletilmektedir. Bu Şartlar, faaliyet gösterdiğimiz yerlerde geçerli yerel düzenlemelere saygı gösterirken İngiltere yasalarına tabidir.'
                }
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}