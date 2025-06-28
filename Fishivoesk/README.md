# Fishivo

Fishivo, balık tutma deneyimlerini paylaşmak ve balık tutma noktalarını keşfetmek için geliştirilmiş modern bir monorepo uygulamasıdır.

## 🏗️ Proje Yapısı

apps/mobile/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── index.ts
│   ├── components/
│   │   ├── common/
│   │   └── index.ts
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   └── types.ts
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   └── types/
├── App.tsx
└── ...

```
Fishivo/
├── apps/
│   ├── mobile/          # React Native 0.77 mobil uygulama
│   ├── web/             # Next.js 15 web uygulaması
│   └── backend/         # Node.js Express API
├── packages/
│   ├── shared/          # Ortak tipler ve yardımcı fonksiyonlar
│   └── ui/              # Paylaşılan UI bileşenleri
└── turbo.json           # Turborepo konfigürasyonu
```

## 🚀 Teknoloji Stack

- **Monorepo Yönetimi**: Turborepo
- **Mobil**: React Native 0.77 (CLI)
- **Web**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Paket Yöneticisi**: Yarn Workspaces

## 📦 Kurulum

1. Bağımlılıkları yükleyin:
```bash
yarn install
```

2. Tüm paketleri derleyin:
```bash
yarn build
```

## 🛠️ Geliştirme

### Tüm uygulamaları çalıştırma
```bash
yarn dev
```

### Mobil uygulama
```bash
# Android
yarn mobile:android

# iOS
yarn mobile:ios

# Metro bundler
yarn mobile:start
```

### Web uygulaması
```bash
cd apps/web
yarn dev
```

### Backend API
```bash
cd apps/backend
yarn dev
```

## 📱 Mobil Uygulama Kurulumu

### Android
1. Android Studio ve Android SDK'yı yükleyin
2. Android emulator başlatın veya fiziksel cihaz bağlayın
3. `yarn mobile:android` komutunu çalıştırın

### iOS
1. Xcode'u yükleyin
2. CocoaPods'u yükleyin: `sudo gem install cocoapods`
3. iOS bağımlılıklarını yükleyin:
```bash
cd apps/mobile/ios
bundle install
bundle exec pod install
cd ..
```
4. `yarn mobile:ios` komutunu çalıştırın

## 🧪 Test

```bash
# Tüm testleri çalıştır
yarn test

# Tip kontrolü
yarn type-check

# Linting
yarn lint
```

## 📋 Özellikler

- 🎣 Balık tutma kayıtları
- 📍 Balık tutma noktaları haritası
- 📱 Cross-platform mobil uygulama
- 🌐 Modern web arayüzü
- 🔄 Gerçek zamanlı senkronizasyon
- 📊 İstatistikler ve analizler

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.