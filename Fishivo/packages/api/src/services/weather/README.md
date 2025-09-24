# Weather Service API Entegrasyonu

## 🚀 Hızlı Başlangıç

Weather service, ücretsiz hava durumu API'lerini kullanarak detaylı hava durumu, astronomi ve balıkçılık verileri sağlar.

## 📋 Özellikler

- ✅ **Ücretsiz** Open-Meteo API (API key gerekmez)
- ✅ **ABD için** National Weather Service (resmi devlet verisi)
- ✅ **Ay evreleri** için IPGeolocation API
- ✅ **Balıkçılık skoru** ve önerileri
- ✅ **Akıllı cache** sistemi
- ✅ **Otomatik fallback** mekanizması

## 🔑 API Key Alma

### 1. IPGeolocation API Key (Astronomi verileri için - OPSİYONEL)

**ÖNEMLİ:** API key olmadan da çalışır! Offline ay evresi hesaplayıcı mevcut.

1. https://ipgeolocation.io/signup adresine gidin
2. Ücretsiz hesap oluşturun
3. Dashboard'dan API key'inizi kopyalayın
4. `.env` dosyasına ekleyin:
   ```
   IPGEOLOCATION_API_KEY=your_api_key_here
   ```

**Ücretsiz Plan:**
- Aylık 30,000 istek
- Astronomi verileri (ay evreleri, gün doğumu/batımı)
- Kredi kartı gerekmez

**Limit Aşımı Durumunda:**
- Sistem otomatik olarak **offline ay evresi hesaplayıcıya** geçer
- John Conway algoritması ile ay evreleri hesaplanır
- Doğruluk: %98+ (1-2 gün sapma olabilir)
- Gün doğumu/batımı da offline hesaplanır

### 2. WeatherAPI.com (Opsiyonel - Yedek)

Sadece Open-Meteo çalışmazsa kullanılır.

1. https://www.weatherapi.com/signup.aspx adresine gidin
2. Ücretsiz hesap oluşturun
3. API key'inizi kopyalayın
4. `.env` dosyasına ekleyin:
   ```
   WEATHERAPI_KEY=your_api_key_here
   ```

**Ücretsiz Plan:**
- Aylık 1 milyon istek
- 14 günlük tahmin
- Astronomi verileri

## 📊 Veri Akışı

```
1. İstek Gelir (lat, lon)
   ↓
2. Cache Kontrolü
   ↓ (Yoksa)
3. Provider Seçimi
   - ABD → NWS
   - Diğer → Open-Meteo
   ↓
4. Paralel Veri Toplama
   - Hava durumu (Primary Provider)
   - Astronomi:
     • API key varsa + limit dolmadıysa → IPGeolocation
     • API key yoksa veya limit dolduysa → Offline Calculator
   ↓
5. Balıkçılık Hesaplamaları
   ↓
6. Cache'e Kaydet
   ↓
7. Veriyi Döndür
```

## 🎣 Balıkçılık Skoru Hesaplaması

Skor 0-100 arasında hesaplanır:

- **Basınç**: 1013-1020 hPa arası ideal (+20 puan)
- **Basınç Trendi**: Yükselen (+10 puan)
- **Ay Evresi**: Yeni/Dolunay (+15 puan)
- **Sıcaklık**: 15-25°C arası ideal (+10 puan)
- **Rüzgar**: <15 km/s ideal (+10 puan)
- **Bulut Örtüsü**: %30-70 arası (+5 puan)

**Değerlendirme:**
- 80+ = Mükemmel
- 60-79 = İyi
- 40-59 = Orta
- 0-39 = Kötü

## 🛠️ Kullanım

```typescript
// Native App'te
import { createNativeApiService } from '@fishivo/api/services/native';

const apiService = createNativeApiService();

// Hava durumu al
const weather = await apiService.getCurrentWeather(41.0082, 28.9784);

// Sadece balıkçılık verileri
const fishing = await apiService.weather.getFishingConditions(lat, lon);

// Sadece astronomi verileri  
const astronomy = await apiService.weather.getAstronomyData(lat, lon);
```

## 📱 WeatherScreen Entegrasyonu

WeatherScreen'de tüm veriler otomatik olarak gösterilir:

- ✅ Güncel hava durumu
- ✅ 7 günlük tahmin
- ✅ Saatlik tahmin
- ✅ Balıkçılık koşulları
- ✅ Astronomi bilgileri (API key varsa)
- ✅ Hava uyarıları (ABD için)

## ⚙️ Konfigürasyon

```env
# apps/native/.env
IPGEOLOCATION_API_KEY=your_key
ENABLE_ASTRONOMY=true
ENABLE_FISHING_CONDITIONS=true
ENABLE_WEATHER_CACHE=true
```

## 🚨 Sorun Giderme

1. **Veri gelmiyor:**
   - Internet bağlantısını kontrol et
   - API key'leri kontrol et (astronomi için)
   - Console'da hata mesajlarına bak

2. **Astronomi verisi yok:**
   - IPGEOLOCATION_API_KEY eklenmiş mi?
   - ENABLE_ASTRONOMY=true mi?

3. **Cache sorunları:**
   - AsyncStorage'ı temizle
   - ENABLE_WEATHER_CACHE=false yap

## 📚 API Limitleri

- **Open-Meteo**: Limitsiz (makul kullanım)
- **NWS**: Limitsiz (ABD kamu hizmeti)
- **IPGeolocation**: 30,000/ay (ücretsiz)
  - Limit dolunca: Offline hesaplayıcı devreye girer
  - Günlük 25,000 istekten sonra otomatik geçiş
- **WeatherAPI**: 1,000,000/ay (ücretsiz)

## 🌙 Offline Ay Evresi Hesaplayıcı

API limiti bittiğinde veya API key yoksa otomatik devreye girer:

- **Algoritma**: John Conway'in ay evresi algoritması
- **Doğruluk**: %98+ (max 1-2 gün sapma)
- **Hesaplananlar**:
  - Ay evresi (8 ana evre)
  - Aydınlanma yüzdesi
  - Gün doğumu/batımı (yaklaşık)
  - Ay doğumu/batımı (yaklaşık)
  - Solunar periyotlar
- **Emoji desteği**: 🌑🌒🌓🌔🌕🌖🌗🌘