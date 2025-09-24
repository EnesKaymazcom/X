import { TypographyH1, TypographyH2, TypographyH3, TypographyP } from '@/lib/typography'
import { Card, CardContent } from '@/components/ui/card'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="text-center border-b pb-8">
                <TypographyH1 className="mb-4">Gizlilik Politikası</TypographyH1>
                <TypographyP className="text-muted-foreground">
                  Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
                </TypographyP>
              </div>

              <div className="space-y-6">
                <section>
                  <TypographyH2 className="mb-4">1. Giriş</TypographyH2>
                  <TypographyP>
                    Fishivo olarak, kullanıcılarımızın gizlilik haklarına saygı duyuyor ve kişisel verilerinizi 
                    korumak için gerekli tüm önlemleri alıyoruz. Bu Gizlilik Politikası, Fishivo mobil uygulaması 
                    ve web sitesi (fishivo.com) kullanımınız sırasında toplanan, kullanılan ve korunan kişisel 
                    verilere ilişkin uygulamalarımızı açıklamaktadır.
                  </TypographyP>
                </section>

                <section>
                  <TypographyH2 className="mb-4">2. Toplanan Bilgiler</TypographyH2>
                  
                  <TypographyH3 className="mb-2">2.1 Kişisel Bilgiler</TypographyH3>
                  <TypographyP className="mb-4">
                    Fishivo kullanımınız sırasında aşağıdaki kişisel bilgileri toplayabiliriz:
                  </TypographyP>
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Ad, soyad ve kullanıcı adı</li>
                    <li>E-posta adresi</li>
                    <li>Profil fotoğrafı</li>
                    <li>Balık tutma deneyimleri ve paylaştığınız içerikler</li>
                    <li>Lokasyon bilgileri (izninizle)</li>
                    <li>Cihaz bilgileri ve kullanım verileri</li>
                  </ul>

                  <TypographyH3 className="mb-2">2.2 Otomatik Toplanan Bilgiler</TypographyH3>
                  <TypographyP>
                    Uygulamamızı kullandığınızda, hizmet kalitesini artırmak için otomatik olarak 
                    bazı teknik bilgiler toplanır: IP adresi, cihaz türü, işletim sistemi, 
                    uygulama kullanım istatistikleri ve çökme raporları.
                  </TypographyP>
                </section>

                <section>
                  <TypographyH2 className="mb-4">3. Bilgilerin Kullanımı</TypographyH2>
                  <TypographyP className="mb-4">
                    Toplanan kişisel verilerinizi aşağıdaki amaçlarla kullanırız:
                  </TypographyP>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Fishivo hizmetlerini sağlamak ve geliştirmek</li>
                    <li>Kullanıcı hesabınızı yönetmek</li>
                    <li>Kişiselleştirilmiş içerik sunmak</li>
                    <li>Müşteri desteği sağlamak</li>
                    <li>Güvenlik önlemlerini uygulamak</li>
                    <li>Yasal yükümlülükleri yerine getirmek</li>
                  </ul>
                </section>

                <section>
                  <TypographyH2 className="mb-4">4. Bilgi Paylaşımı</TypographyH2>
                  <TypographyP>
                    Kişisel verilerinizi üçüncü taraflarla paylaşmayız, satmayız veya kiralamayız. 
                    Ancak aşağıdaki durumlararda bilgi paylaşımı yapabiliriz:
                  </TypographyP>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Yasal zorunluluklar gereği</li>
                    <li>Güvenlik tehditlerine karşı koruma</li>
                    <li>Hizmet sağlayıcılarımızla (veri güvenliği sözleşmeleri ile korunmuş)</li>
                    <li>Açık rızanızla</li>
                  </ul>
                </section>

                <section>
                  <TypographyH2 className="mb-4">5. Veri Güvenliği</TypographyH2>
                  <TypographyP>
                    Kişisel verilerinizi korumak için endüstri standardı güvenlik önlemleri alıyoruz:
                  </TypographyP>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>SSL/TLS şifreleme</li>
                    <li>Güvenli veri depolama (Supabase altyapısı)</li>
                    <li>Düzenli güvenlik güncellemeleri</li>
                    <li>Erişim kontrolü ve yetkilendirme</li>
                  </ul>
                </section>

                <section>
                  <TypographyH2 className="mb-4">6. Kullanıcı Hakları</TypographyH2>
                  <TypographyP className="mb-4">
                    KVKK ve GDPR kapsamında aşağıdaki haklarınız bulunmaktadır:
                  </TypographyP>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                    <li>Kişisel verilerinize erişim talep etme</li>
                    <li>Yanlış verilerin düzeltilmesini isteme</li>
                    <li>Verilerin silinmesini talep etme</li>
                    <li>Veri taşınabilirliği hakkı</li>
                    <li>İşlemeye itiraz etme hakkı</li>
                  </ul>
                </section>

                <section>
                  <TypographyH2 className="mb-4">7. Çerezler (Cookies)</TypographyH2>
                  <TypographyP>
                    Web sitemizde kullanıcı deneyimini iyileştirmek için çerezler kullanıyoruz. 
                    Çerez tercihlerinizi browser ayarlarınızdan yönetebilirsiniz.
                  </TypographyP>
                </section>

                <section>
                  <TypographyH2 className="mb-4">8. Değişiklikler</TypographyH2>
                  <TypographyP>
                    Bu Gizlilik Politikası zaman zaman güncellenebilir. Önemli değişiklikler 
                    hakkında e-posta veya uygulama bildirimi ile haberdar edileceksiniz.
                  </TypographyP>
                </section>

                <section>
                  <TypographyH2 className="mb-4">9. İletişim</TypographyH2>
                  <TypographyP>
                    Gizlilik politikamız hakkında sorularınız için:
                  </TypographyP>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>E-posta: privacy@fishivo.com</li>
                    <li>Web sitesi: fishivo.com/support</li>
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