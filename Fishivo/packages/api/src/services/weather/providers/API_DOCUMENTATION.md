# 🎣 Meteo.fishivo.com API Dokümantasyonu

## 📍 Genel Bilgiler

- **Base URL**: `https://meteo.fishivo.com`
- **API Key**: `sk_fishivo_wx_7k9m2n8q4x6v1z3c5b8a9d2f7h1j4l6p`
- **Koruma**: Cloudflare WAF (API key zorunlu)
- **Format**: JSON
- **Timezone**: Otomatik veya manuel ayarlanabilir

## 🔑 Authentication

Tüm isteklerde header olarak API key gönderilmelidir:

```bash
x-api-key: sk_fishivo_wx_7k9m2n8q4x6v1z3c5b8a9d2f7h1j4l6p
```

## 📊 Endpoint'ler

### 1. Hava Durumu Tahmini

```
GET /v1/forecast
```

#### Zorunlu Parametreler:
- `latitude`: Enlem (-90 ile 90 arası)
- `longitude`: Boylam (-180 ile 180 arası)

#### Opsiyonel Parametreler:
- `current`: Anlık veriler (virgülle ayrılmış)
- `hourly`: Saatlik veriler (virgülle ayrılmış)
- `daily`: Günlük veriler (virgülle ayrılmış)
- `timezone`: Saat dilimi (auto, UTC, Europe/Istanbul vb.)
- `past_days`: Geçmiş gün sayısı (0-92)
- `forecast_days`: Tahmin gün sayısı (1-16)

### 2. Marine/Dalga Verileri

```
GET /v1/marine
```

Deniz ve dalga verileri için özel endpoint.

## 🌡️ Mevcut Parametreler (Current)

### Temel Atmosferik Veriler
| Parametre | Birim | Açıklama | Durum |
|-----------|--------|----------|-------|
| `temperature_2m` | °C | 2 metre yükseklikte sıcaklık | ✅ Aktif |
| `relative_humidity_2m` | % | 2 metre yükseklikte nem | ✅ Aktif |
| `dew_point_2m` | °C | Çiğ noktası sıcaklığı | ✅ Aktif |
| `apparent_temperature` | °C | Hissedilen sıcaklık | ⏳ Sync |
| `precipitation` | mm | Yağış miktarı | ✅ Aktif |
| `rain` | mm | Yağmur miktarı | ⏳ Sync |
| `snowfall` | cm | Kar yağışı | ⏳ Sync |
| `snow_depth` | cm | Kar derinliği | ⏳ Sync |
| `weather_code` | WMO code | Hava durumu kodu | ✅ Aktif |

### Basınç ve Bulut
| Parametre | Birim | Açıklama | Durum |
|-----------|--------|----------|-------|
| `pressure_msl` | hPa | Deniz seviyesi basıncı | ⏳ Sync |
| `surface_pressure` | hPa | Yüzey basıncı | ⏳ Sync |
| `cloud_cover` | % | Toplam bulut örtüsü | ✅ Aktif |
| `cloud_cover_low` | % | Alçak bulut (0-2km) | ✅ Aktif |
| `cloud_cover_mid` | % | Orta bulut (2-7km) | ✅ Aktif |
| `cloud_cover_high` | % | Yüksek bulut (>7km) | ✅ Aktif |

### Rüzgar Verileri
| Parametre | Birim | Açıklama | Durum |
|-----------|--------|----------|-------|
| `wind_speed_10m` | km/h | 10m yükseklikte rüzgar hızı | ⏳ Sync |
| `wind_direction_10m` | ° | 10m yükseklikte rüzgar yönü | ⏳ Sync |
| `wind_gusts_10m` | km/h | Rüzgar hamleleri | ⏳ Sync |

### Diğer Parametreler
| Parametre | Birim | Açıklama | Durum |
|-----------|--------|----------|-------|
| `visibility` | m | Görüş mesafesi | ⏳ Sync |
| `uv_index` | - | UV indeksi | ✅ Aktif |
| `cape` | J/kg | Konvektif enerji (fırtına) | ⏳ Sync |
| `freezing_level_height` | m | Donma seviyesi yüksekliği | ⏳ Sync |
| `evapotranspiration` | mm | Buharlaşma-terleme | ✅ Aktif |

## 🌊 Marine Parametreleri

| Parametre | Birim | Açıklama | Durum |
|-----------|--------|----------|-------|
| `wave_height` | m | Dalga yüksekliği | ⏳ Sync |
| `wave_direction` | ° | Dalga yönü | ⏳ Sync |
| `wave_period` | s | Dalga periyodu | ⏳ Sync |
| `wind_wave_height` | m | Rüzgar dalgası yüksekliği | ⏳ Sync |
| `swell_wave_height` | m | Düzenli dalga yüksekliği | ⏳ Sync |

## 💻 Örnek Kodlar

### Python

```python
import requests
import json

# API ayarları
API_URL = "https://meteo.fishivo.com/v1/forecast"
API_KEY = "sk_fishivo_wx_7k9m2n8q4x6v1z3c5b8a9d2f7h1j4l6p"

# İstanbul koordinatları
params = {
    "latitude": 41.0082,
    "longitude": 28.9784,
    "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m",
    "hourly": "temperature_2m,precipitation,wind_speed_10m",
    "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum",
    "timezone": "auto"
}

headers = {
    "x-api-key": API_KEY
}

# İstek gönder
response = requests.get(API_URL, params=params, headers=headers)

if response.status_code == 200:
    data = response.json()
    
    # Anlık veriler
    current = data["current"]
    print(f"🌡️ Sıcaklık: {current['temperature_2m']}°C")
    print(f"💧 Nem: {current['relative_humidity_2m']}%")
    print(f"🌧️ Yağış: {current['precipitation']}mm")
    print(f"💨 Rüzgar: {current.get('wind_speed_10m', 'N/A')}km/h")
    
    # Günlük tahmin
    daily = data["daily"]
    for i in range(3):  # İlk 3 gün
        date = daily["time"][i]
        max_temp = daily["temperature_2m_max"][i]
        min_temp = daily["temperature_2m_min"][i]
        precip = daily["precipitation_sum"][i]
        print(f"\n📅 {date}")
        print(f"   Max: {max_temp}°C, Min: {min_temp}°C")
        print(f"   Yağış: {precip}mm")
else:
    print(f"Hata: {response.status_code}")
```

### JavaScript (Node.js)

```javascript
const axios = require('axios');

const API_URL = 'https://meteo.fishivo.com/v1/forecast';
const API_KEY = 'sk_fishivo_wx_7k9m2n8q4x6v1z3c5b8a9d2f7h1j4l6p';

async function getWeather(latitude, longitude) {
    try {
        const response = await axios.get(API_URL, {
            params: {
                latitude: latitude,
                longitude: longitude,
                current: 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m',
                hourly: 'temperature_2m,precipitation',
                daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
                timezone: 'auto'
            },
            headers: {
                'x-api-key': API_KEY
            }
        });

        const data = response.data;
        
        // Anlık veriler
        console.log('🌡️ Sıcaklık:', data.current.temperature_2m + '°C');
        console.log('💧 Nem:', data.current.relative_humidity_2m + '%');
        console.log('🌧️ Yağış:', data.current.precipitation + 'mm');
        
        // Günlük özet
        const today = data.daily;
        console.log('\n📅 Bugün:');
        console.log('   Max:', today.temperature_2m_max[0] + '°C');
        console.log('   Min:', today.temperature_2m_min[0] + '°C');
        console.log('   Yağış:', today.precipitation_sum[0] + 'mm');
        
    } catch (error) {
        console.error('Hata:', error.message);
    }
}

// İstanbul için hava durumu
getWeather(41.0082, 28.9784);
```

### cURL (Terminal)

```bash
# Basit sorgu
curl -H "x-api-key: sk_fishivo_wx_7k9m2n8q4x6v1z3c5b8a9d2f7h1j4l6p" \
  "https://meteo.fishivo.com/v1/forecast?latitude=41.0082&longitude=28.9784&current=temperature_2m,precipitation&timezone=auto"

# Detaylı sorgu (formatlanmış)
curl -s -H "x-api-key: sk_fishivo_wx_7k9m2n8q4x6v1z3c5b8a9d2f7h1j4l6p" \
  "https://meteo.fishivo.com/v1/forecast?latitude=41.0082&longitude=28.9784&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,pressure_msl,cloud_cover&hourly=temperature_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto" \
  | jq '.'
```

### PHP

```php
<?php
$apiUrl = 'https://meteo.fishivo.com/v1/forecast';
$apiKey = 'sk_fishivo_wx_7k9m2n8q4x6v1z3c5b8a9d2f7h1j4l6p';

$params = [
    'latitude' => 41.0082,
    'longitude' => 28.9784,
    'current' => 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m',
    'daily' => 'temperature_2m_max,temperature_2m_min,precipitation_sum',
    'timezone' => 'auto'
];

$headers = [
    'x-api-key: ' . $apiKey
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl . '?' . http_build_query($params));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode == 200) {
    $data = json_decode($response, true);
    
    echo "🌡️ Sıcaklık: " . $data['current']['temperature_2m'] . "°C\n";
    echo "💧 Nem: " . $data['current']['relative_humidity_2m'] . "%\n";
    echo "🌧️ Yağış: " . $data['current']['precipitation'] . "mm\n";
    
    // Günlük tahmin
    echo "\n📅 Bugün:\n";
    echo "   Max: " . $data['daily']['temperature_2m_max'][0] . "°C\n";
    echo "   Min: " . $data['daily']['temperature_2m_min'][0] . "°C\n";
    echo "   Yağış: " . $data['daily']['precipitation_sum'][0] . "mm\n";
} else {
    echo "Hata: HTTP " . $httpCode;
}
?>
```

## 📈 Response Örneği

```json
{
  "latitude": 41.0,
  "longitude": 29.0,
  "generationtime_ms": 0.5960464477539062,
  "utc_offset_seconds": 10800,
  "timezone": "Europe/Istanbul",
  "timezone_abbreviation": "+03",
  "elevation": 29.0,
  "current_units": {
    "time": "iso8601",
    "interval": "seconds",
    "temperature_2m": "°C",
    "relative_humidity_2m": "%",
    "precipitation": "mm",
    "wind_speed_10m": "km/h"
  },
  "current": {
    "time": "2025-09-06T14:45",
    "interval": 900,
    "temperature_2m": 20.4,
    "relative_humidity_2m": 64,
    "precipitation": 0.2,
    "wind_speed_10m": null
  },
  "hourly_units": {
    "time": "iso8601",
    "temperature_2m": "°C",
    "precipitation": "mm"
  },
  "hourly": {
    "time": ["2025-09-06T00:00", "2025-09-06T01:00", ...],
    "temperature_2m": [18.2, 17.9, 17.5, ...],
    "precipitation": [0.0, 0.0, 0.1, ...]
  },
  "daily_units": {
    "time": "iso8601",
    "temperature_2m_max": "°C",
    "temperature_2m_min": "°C",
    "precipitation_sum": "mm"
  },
  "daily": {
    "time": ["2025-09-06", "2025-09-07", "2025-09-08"],
    "temperature_2m_max": [22.3, 24.1, 25.6],
    "temperature_2m_min": [16.8, 17.2, 18.1],
    "precipitation_sum": [0.4, 0.0, 0.0]
  }
}
```

## 🎣 Balıkçılık İçin Özel Parametreler

### En Önemli Veriler

1. **Basınç (pressure_msl)**: Balık aktivitesi için kritik
   - Yükselen basınç = Balık dibe iner
   - Düşen basınç = Balık yüzeye çıkar

2. **Rüzgar (wind_speed_10m, wind_direction_10m)**: Tekne güvenliği
   - < 15 km/h: İdeal
   - 15-25 km/h: Dikkatli
   - > 25 km/h: Riskli

3. **Dalga Yüksekliği (wave_height)**: Deniz durumu
   - < 0.5m: Sakin
   - 0.5-1.5m: Normal
   - > 1.5m: Dalgalı

4. **UV İndeksi (uv_index)**: Güneş koruması
   - 0-2: Düşük
   - 3-5: Orta
   - 6-7: Yüksek
   - 8+: Çok yüksek

5. **Bulut Örtüsü (cloud_cover)**: Işık koşulları
   - %0-30: Açık
   - %30-70: Parçalı bulutlu
   - %70-100: Kapalı

## 🔄 Veri Güncelleme Periyotları

| Model | Güncelleme | Kapsam | Çözünürlük |
|-------|------------|--------|------------|
| NCEP GFS | 6 saatte bir | Global | 13km |
| ECMWF IFS | 12 saatte bir | Global | 25km |
| DWD ICON | 3 saatte bir | Avrupa | 7km |
| GFS Wave | 6 saatte bir | Okyanus | 25km |

## ⚠️ Limitler ve Notlar

- **Rate Limit**: Yok (şimdilik)
- **Maksimum forecast_days**: 16 gün
- **Maksimum past_days**: 92 gün
- **Timezone**: Otomatik algılama veya manuel ayar
- **Koordinat hassasiyeti**: 4 ondalık basamak yeterli

## 🆘 Hata Kodları

| Kod | Açıklama |
|-----|----------|
| 200 | Başarılı |
| 400 | Geçersiz parametreler |
| 401 | API key eksik veya hatalı |
| 403 | Cloudflare tarafından engellenmiş |
| 429 | Rate limit aşımı |
| 500 | Sunucu hatası |

## 📞 Destek

- **API Status**: https://meteo.fishivo.com/health
- **GitHub**: https://github.com/EnesKaymazcom/meteo-fishivo
- **E-mail**: contact@fishivo.com

---

*Son güncelleme: 2025-09-06*
*API Version: 1.0*
*Powered by Open-Meteo*