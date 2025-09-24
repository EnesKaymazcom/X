import { TypographyH1, TypographyH2, TypographyH3, TypographyP } from '@/lib/typography'
import { Card, CardContent } from '@/components/ui/card'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="text-center border-b pb-8">
                <TypographyH1 className="mb-4">Kullanım Şartları</TypographyH1>
                <TypographyP className="text-muted-foreground">
                  Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
                </TypographyP>
              </div>

              <div className="space-y-6">
                <section>
                  <TypographyH2 className="mb-4">1. Giriş ve Kabul</TypographyH2>
                  <TypographyP>
                    Bu Kullanım Şartları ("Şartlar"), Fishivo mobil uygulaması ve web sitesi 
                    (fishivo.com) kullanımınızı düzenler. Fishivo'yu kullanarak bu şartları 
                    kabul etmiş sayılırsınız. Şartları kabul etmiyorsanız, lütfen hizmetimizi 
                    kullanmayın.
                  </TypographyP>
                </section>

                <section>
                  <TypographyH2 className="mb-4">2. Hizmet Tanımı</TypographyH2>
                  <TypographyP>
                    Fishivo, balık tutma deneyimlerini paylaşmak, balıkçılık lokasyonları keşfetmek 
                    ve balıkçı topluluğu ile etkileşime geçmek için tasarlanmış bir sosyal platform ve 
                    mobil uygulamadır. Hizmetimiz şunları içerir:
                  </TypographyP>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Balık tutma deneyimlerini paylaşma</li>
                    <li>Fotoğraf ve video yükleme</li>
                    <li>Lokasyon keşfi ve paylaşımı</li>
                    <li>Sosyal etkileşim özellikleri</li>
                    <li>Hava durumu bilgileri</li>
                    <li>Topluluk forumları</li>
                  </ul>
                </section>

                <section>
                  <TypographyH2 className="mb-4">3. Kullanıcı Hesabı ve Kayıt</TypographyH2>
                  
                  <TypographyH3 className="mb-2">3.1 Hesap Oluşturma</TypographyH3>
                  <TypographyP className="mb-4">
                    Fishivo'yu kullanmak için bir hesap oluşturmanız gerekir. Kayıt sırasında 
                    doğru ve güncel bilgiler sağlamalısınız.
                  </TypographyP>

                  <TypographyH3 className="mb-2">3.2 Hesap Güvenliği</TypographyH3>
                  <TypographyP className="mb-4">
                    Hesap bilgilerinizin güvenliğinden sorumlusunuz. Şifrenizi güvenli tutmalı 
                    ve yetkisiz erişim şüphesi durumunda derhal bize bildirmelisiniz.
                  </TypographyP>

                  <TypographyH3 className="mb-2">3.3 Yaş Sınırı</TypographyH3>
                  <TypographyP>
                    Fishivo'yu kullanmak için en az 13 yaşında olmalısınız. 18 yaşından küçük 
                    kullanıcılar ebeveyn veya vasi iznini almalıdır.
                  </TypographyP>
                </section>

                <section>
                  <TypographyH2 className="mb-4">4. Kullanım Kuralları</TypographyH2>
                  
                  <TypographyH3 className="mb-2">4.1 İzin Verilen Kullanım</TypographyH3>
                  <TypographyP className="mb-4">
                    Fishivo'yu yasal amaçlarla ve bu şartlara uygun olarak kullanabilirsiniz:
                  </TypographyP>
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Kişisel balık tutma deneyimlerinizi paylaşmak</li>
                    <li>Diğer kullanıcılarla etkileşime geçmek</li>
                    <li>Balıkçılık bilgilerini öğrenmek ve paylaşmak</li>
                    <li>Lokasyon bilgilerini keşfetmek</li>
                  </ul>

                  <TypographyH3 className="mb-2">4.2 Yasaklı Davranışlar</TypographyH3>
                  <TypographyP className="mb-4">
                    Aşağıdaki davranışlar kesinlikle yasaktır:
                  </TypographyP>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Yasadışı avlanan balıkları paylaşmak</li>
                    <li>Özel mülklerde izinsiz balık tutmayı teşvik etmek</li>
                    <li>Nefret söylemi, taciz veya zorbalık</li>
                    <li>Spam, sahte hesap veya bot kullanımı</li>
                    <li>Telif hakkı ihlali</li>
                    <li>Kişisel bilgileri izinsiz paylaşmak</li>
                    <li>Hizmetin güvenliğini tehdit etmek</li>
                  </ul>
                </section>

                <section>
                  <TypographyH2 className="mb-4">5. İçerik ve Fikri Mülkiyet</TypographyH2>
                  
                  <TypographyH3 className="mb-2">5.1 Kullanıcı İçeriği</TypographyH3>
                  <TypographyP className="mb-4">
                    Paylaştığınız tüm içerikler (fotoğraflar, videolar, yazılar) sizin 
                    mülkiyetinizde kalır. Ancak, Fishivo'da paylaşarak bu içerikleri 
                    platformumuzda kullanmamıza lisans vermiş olursunuz.
                  </TypographyP>

                  <TypographyH3 className="mb-2">5.2 Platform İçeriği</TypographyH3>
                  <TypographyP>
                    Fishivo'nun arayüzü, logosu, tasarımı ve özellikleri bizim fikri 
                    mülkiyetimizdir ve telif hakları ile korunmaktadır.
                  </TypographyP>
                </section>

                <section>
                  <TypographyH2 className="mb-4">6. Gizlilik</TypographyH2>
                  <TypographyP>
                    Kişisel verilerinizin korunması bizim için önemlidir. Veri toplama, 
                    kullanma ve paylaşma uygulamalarımız hakkında detaylı bilgi için 
                    Gizlilik Politikamızı inceleyin.
                  </TypographyP>
                </section>

                <section>
                  <TypographyH2 className="mb-4">7. Hizmet Kesintileri</TypographyH2>
                  <TypographyP>
                    Fishivo hizmetini geliştirmek, güncellemek veya bakım yapmak için 
                    geçici olarak kesintiye uğratabilir veya sınırlandırabiliriz. 
                    Mümkün olduğunda önceden bildirimde bulunmaya çalışacağız.
                  </TypographyP>
                </section>

                <section>
                  <TypographyH2 className="mb-4">8. Hesap Sonlandırma</TypographyH2>
                  <TypographyP>
                    Bu şartları ihlal etmeniz durumunda hesabınızı askıya alabilir veya 
                    sonlandırabiliriz. Hesabınızı istediğiniz zaman kendiniz de kapatabilirsiniz.
                  </TypographyP>
                </section>

                <section>
                  <TypographyH2 className="mb-4">9. Sorumluluk Reddi</TypographyH2>
                  <TypographyP>
                    Fishivo "olduğu gibi" sunulmaktadır. Hizmetin kesintisiz, hatasız veya 
                    güvenli olacağını garanti etmiyoruz. Balık tutma faaliyetlerinizde 
                    yerel yasalara ve çevre kurallarına uymanız sizin sorumluluğunuzdadır.
                  </TypographyP>
                </section>

                <section>
                  <TypographyH2 className="mb-4">10. Değişiklikler</TypographyH2>
                  <TypographyP>
                    Bu Kullanım Şartlarını zaman zaman güncelleyebiliriz. Önemli değişiklikler 
                    hakkında kullanıcılarımızı bilgilendireceğiz. Değişikliklerden sonra 
                    hizmeti kullanmaya devam etmeniz yeni şartları kabul ettiğiniz anlamına gelir.
                  </TypographyP>
                </section>

                <section>
                  <TypographyH2 className="mb-4">11. Uygulanacak Hukuk</TypographyH2>
                  <TypographyP>
                    Bu Kullanım Şartları Türkiye Cumhuriyeti yasalarına tabidir. 
                    Anlaşmazlıklar Türkiye mahkemelerinde çözümlenir.
                  </TypographyP>
                </section>

                <section>
                  <TypographyH2 className="mb-4">12. İletişim</TypographyH2>
                  <TypographyP>
                    Kullanım şartları hakkında sorularınız için:
                  </TypographyP>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>E-posta: legal@fishivo.com</li>
                    <li>Destek: fishivo.com/support</li>
                    <li>Adres: Türkiye</li>
                  </ul>
                </section>

                <div className="border-t pt-6 text-center">
                  <TypographyP className="text-muted-foreground">
                    Bu belge Türkiye Cumhuriyeti yasalarına uygun olarak hazırlanmıştır.
                  </TypographyP>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}