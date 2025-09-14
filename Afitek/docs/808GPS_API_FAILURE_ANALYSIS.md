# 808GPS API Hata Analiz Raporu

## Test Tarihi: 12 Eylül 2025
## Sunucu: 120.79.58.1:8088
## Hesap: ULVschool / 11223344

## YENİ BULUNAN ÇALIŞAN API'LER

### ✅ Yeni Keşfedilen Çalışan API'ler
1. **Araç Alarmı** - `/StandardApiAction_vehicleAlarm.action`
   - Boş alarm listesi döndürüyor
   - Yanıt: `{"alarmlist": [], "result": 0}`

2. **Araç Durumu** - `/StandardApiAction_vehicleStatus.action`
   - Detaylı araç konum bilgisi döndürüyor
   - GPS koordinatları, hız, yön bilgilerini içeriyor

3. **Araçtan Cihaz Bilgisi Alma** - `/StandardApiAction_getDeviceByVehicle.action`
   - Cihaz GB kodları ve kanal bilgilerini döndürüyor
   - Yanıt kanal eşleşmelerini içeriyor (CH1-CH4)

## API HATA KÖK NEDENLERİ

### 1. YANLIŞ PARAMETRE HATALARI
**Hata Kodu 7**: "Request parameter is incorrect!" (İstek parametresi yanlış!)

#### Etkilenen API'ler:
- `StandardApiAction_runMileage.action`
- `StandardApiAction_parkDetail.action`
- `StandardApiAction_queryAccessAreaInfo.action`
- `StandardApiAction_getVideoFileInfo.action`
- `StandardApiAction_getVideoHistoryFile.action`
- `StandardApiAction_addDownloadTask.action`
- `StandardApiAction_capturePicture.action`
- `StandardApiAction_downloadTasklist.action`
- `StandardApiAction_userMediaRateOfFlow.action`
- `StandardApiAction_catalogSummaryApi.action`

#### Olası Sebepler:
1. **Eksik Zorunlu Parametreler**: API'ler dokümante edilmemiş özel parametreler istiyor
2. **Yanlış Tarih Formatı**: Birden fazla format denendi (yyyy-MM-dd HH:mm:ss, yyyyMMddHHmmss)
3. **Cihaz Çevrimdışı**: 888811118888 cihazı çevrimdışı, bazı API'ler çevrimiçi cihaz gerektirebilir
4. **Yetki Sorunları**: Kullanıcının belirli işlemler için yetkisi olmayabilir
5. **Yanlış Parametre İsimleri**: API dokümantasyondakinden farklı parametre isimleri bekliyor

### 2. HTTP 404 HATALARI (Endpoint Bulunamadı)
**Hata**: Sunucuda endpoint bulunamadı

#### Etkilenen API'ler (Yanlış İsimler):
- `/StandardApiAction_getLiveAddress.action` → Muhtemelen mevcut değil
- `/StandardApiAction_getRtspAddress.action` → Muhtemelen mevcut değil
- `/StandardApiAction_sendTTS.action` → Muhtemelen mevcut değil
- `/StandardApiAction_vehicleControl.action` → Muhtemelen mevcut değil
- `/StandardApiAction_getAreaInfo.action` → Muhtemelen mevcut değil

#### Kök Neden:
- **Dokümantasyon Uyumsuzluğu**: Dokümante edilen API isimleri gerçek sunucu uygulamasıyla eşleşmiyor
- **Versiyon Farkı**: Sunucu dokümantasyondan farklı bir API versiyonu çalıştırıyor olabilir

### 3. HTTP METOD SORUNLARI
- Hem GET hem POST metodları test edildi
- Her iki metodda da aynı hata sonuçları alındı
- Sunucu her ikisini de kabul ediyor ama parametre doğrulaması başarısız

## PARAMETRE ARAŞTIRMASI

### Tarih Formatı Testleri
| Format | Örnek | Sonuç |
|--------|---------|--------|
| yyyy-MM-dd HH:mm:ss | 2025-06-01 00:00:00 | ❌ Hata 7 |
| yyyyMMddHHmmss | 20250601000000 | ❌ Hata 7 |
| URL Encoded | 2025-06-01%2000:00:00 | ❌ Hata 7 |

### Eksik Parametre Analizi
"Parametre yanlış" hatası veren API'ler şunları gerektirebilir:
- Ek kimlik doğrulama token'ları
- Özel kullanıcı yetkileri
- Çevrimiçi cihaz gereksinimi
- Dokümante edilmemiş ek parametreler
- Farklı parametre isimleri (btime vs begintime)

## ÇALIŞAN API DESENLERİ

### Başarılı API'lerin Ortak Özellikleri:
1. Basit parametre gereksinimleri (jsession + devIdno)
2. Sadece okuma işlemleri
3. Temel araç/cihaz sorguları
4. Zaman aralığı gerektirmeyen

### Başarısız API'lerin Ortak Özellikleri:
1. Karmaşık parametre gereksinimleri
2. Zaman aralığı parametreleri (begintime/endtime)
3. Yazma/kontrol işlemleri
4. Medya/video ilgili fonksiyonlar
5. Yönetim işlemleri

## GERÇEK vs DOKÜMANTE EDİLEN API'LER

### Bulunan Dokümantasyon Sorunları:
1. **Yanlış Endpoint İsimleri**: Birçok dokümante edilmiş endpoint 404 döndürüyor
2. **Eksik Parametre Detayları**: Gerekli parametreler tam dokümante edilmemiş
3. **Yanlış Parametre İsimleri**: Bazı API'ler farklı parametre isimleri kullanıyor
4. **Hata Kodu Dokümantasyonu Yok**: Hata 7'nin detayları açıklanmamış

### Doğrulanmış Çalışan Endpoint'ler:
```
✅ /StandardApiAction_login.action
✅ /StandardApiAction_loginEx.action
✅ /StandardApiAction_logout.action
✅ /StandardApiAction_queryUserVehicle.action
✅ /StandardApiAction_getDeviceStatus.action
✅ /StandardApiAction_getDeviceOlStatus.action
✅ /StandardApiAction_getVehicleStatus.action
✅ /StandardApiAction_queryTrackDetail.action
✅ /StandardApiAction_vehicleAlarm.action
✅ /StandardApiAction_vehicleStatus.action
✅ /StandardApiAction_getDeviceByVehicle.action
✅ /StandardApiAction_queryDriverList.action
```

## ÖNERİLER

### Parametre Hatalarını Düzeltmek İçin:
1. **API Sağlayıcısıyla İletişim**: Doğru parametre dokümantasyonunu alın
2. **Cihaz Durumunu Kontrol**: Belirli işlemler için cihazın çevrimiçi olduğundan emin olun
3. **Yetkileri Doğrula**: Kullanıcının gerekli yetkilere sahip olup olmadığını kontrol edin
4. **Farklı Cihazla Test**: Çevrimiçi bir cihazla deneyin
5. **Çalışan İsteği Yakala**: Web arayüzünde tarayıcı geliştirici araçlarını kullanın

### Doğru Endpoint'leri Bulmak İçin:
1. **Web Arayüzünü İzle**: Gerçek API çağrılarını yakalamak için tarayıcı DevTools kullanın
2. **Sunucu Loglarını Kontrol**: Erişilebilirse, doğru URL'ler için sunucu loglarını inceleyin
3. **API Keşfi**: Endpoint isimlerinin yaygın varyasyonlarını deneyin
4. **Versiyon Kontrolü**: API versiyon uyumluluğunu doğrulayın

## ÖZET

### İstatistikler:
- **Test Edilen Toplam API**: 50+
- **Çalışan API'ler**: 12 (%24)
- **Parametre Hataları**: 15 (%30)
- **404 Hataları**: 23 (%46)

### Ana Bulgular:
1. **Çoğu API Başarısız**: Dokümante edilen API'lerin %76'sı beklendiği gibi çalışmıyor
2. **Parametre Sorunları**: Ana başarısızlık nedeni yanlış/eksik parametreler
3. **Dokümantasyon Boşluğu**: Dokümantasyon ve uygulama arasında önemli uyumsuzluk
4. **Temel Fonksiyonlar Çalışıyor**: Çekirdek takip özellikleri işlevsel, gelişmiş özellikler erişilebilir değil

### Cihaz Durumu Etkisi:
- Cihaz 888811118888 **ÇEVRİMDIŞI**
- Bu durum video, kontrol ve gerçek zamanlı işlemleri engelleyebilir
- Geçmiş veri sorguları çalışıyor
- Canlı işlemler muhtemelen çevrimiçi cihaz gerektiriyor

## HATA AYIKLAMA İÇİN TEST KOMUTLARI

```bash
# Çalışan API Örneği
curl -s "http://120.79.58.1:8088/StandardApiAction_vehicleAlarm.action?jsession=SESSION&devIdno=888811118888&begintime=2025-01-01%2000:00:00&endtime=2025-09-12%2023:59:59"

# Cihaz Kanallarını Kontrol
curl -s "http://120.79.58.1:8088/StandardApiAction_getDeviceByVehicle.action?jsession=SESSION&vehiIdno=888811118888"

# Ağ Trafiğini İzle
# Çalışan API çağrılarını yakalamak için web arayüzünü kullanırken Chrome DevTools Network sekmesini kullanın
```

## SONRAKİ ADIMLAR

1. **Web Arayüzünü Kullan**: http://120.79.58.1:8088 adresine giriş yapın ve gerçek API çağrılarını izleyin
2. **Çevrimiçi Cihazla Test**: Video/kontrol API'lerini test etmek için çevrimiçi bir cihaz bulun
3. **Destek ile İletişim**: Güncel API dokümantasyonunu talep edin
4. **Tersine Mühendislik**: Doğru parametre formatları için JavaScript dosyalarını analiz edin
5. **Alternatif Portları Dene**: Farklı portların farklı API versiyonları olup olmadığını test edin