# 🔐 GÜVENLİK AYARLARI - ÇOK ÖNEMLİ!

## 1️⃣ Keystore Şifreleri İçin

**Terminal'de şu komutu çalıştır:**
```bash
nano ~/.gradle/gradle.properties
```

**Bu satırları ekle:**
```
FISHIVO_RELEASE_STORE_FILE=fishivo-release-keystore.jks
FISHIVO_RELEASE_STORE_PASSWORD=Fishivok52n.,,
FISHIVO_RELEASE_KEY_ALIAS=fishivo-key-alias
FISHIVO_RELEASE_KEY_PASSWORD=Fishivok52n.,,
```

**Kaydet:** Ctrl+X, Y, Enter

## 2️⃣ Mapbox Token'ları İçin

**Aynı dosyaya bunları da ekle:**
```
MAPBOX_DOWNLOADS_TOKEN=sk.eyJ1IjoiZmlzaGl2byIsImEiOiJjbWZhYWkxZmIxajh6MmxzOWFrankzbG1uIn0.350LAO2iO8-Vh1FNlL-VLw
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiZmlzaGl2byIsImEiOiJjbWJsaWphZWwwbjdpMmtxeTMwaGU5Zm4yIn0.LUiv6j3SGgFjTAJfpuuwDA
```

## ✅ Artık Güvendesin!

- Bu dosya (`~/.gradle/gradle.properties`) senin bilgisayarında kalıyor
- Git'e commit edilmiyor
- APK'ya dahil olmuyor
- Kimse bu şifreleri göremiyor

## 🚀 Build Komutları

**Developer mode (Metro ile):**
```bash
yarn android
```

**Production APK:**
```bash
yarn apk
```

**Google Play Store AAB:**
```bash
yarn aab
```

## ⚠️ ÖNEMLİ NOTLAR

1. `~/.gradle/gradle.properties` dosyası sadece senin bilgisayarında olmalı
2. Bu dosyayı ASLA Git'e ekleme
3. Başka bir bilgisayarda build alacaksan, orada da aynı dosyayı oluştur
4. CI/CD kullanıyorsan, environment variable olarak tanımla