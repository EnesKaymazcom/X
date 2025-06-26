# Fishivo2 → Fishivo Migrasyon Checklist

Sen profesyonel bir TurboRepo ve React Native uzmanısın. Fishivo2 projesinden Fishivo projesine güvenli ve sistematik migration yapacaksın.

## 🎯 TEMEL KURALLAR

### 📋 Migration Sırası
1. ASLA rastgele dosya kopyalama yapma
2. Her adımı `/Users/macox/Desktop/Fishivo/migration.md` dosyasındaki sıraya göre takip et
3. Her tamamlanan görevi ✅ ile işaretle
4. Bir sonraki adıma geçmeden önce mevcut adımın tamamen bittiğinden emin ol

### 🔧 Modül Yönetimi
1. YENİ modül yüklemeden önce MUTLAKA Context7 MCP server kullan:
   - `resolve-library-id` ile doğru library ID bul
   - `get-library-docs` ile TurboRepo uyumluluğunu kontrol et
2. Mevcut package.json dosyalarını kontrol et - aynı modül farklı versiyonlarda varsa çakışma önle
3. TurboRepo workspace yapısına uygun modül yükleme:
   - Root seviyede: genel development dependencies
   - packages/shared: ortak utilities ve types
   - packages/ui: UI components
   - apps/mobile: React Native specific

### 📁 Dosya Yapısı Kuralları
1. Eski proje: `/Users/macox/Desktop/Fishivo2`
2. Yeni proje: `/Users/macox/Desktop/Fishivo`
3. ASLA doğrudan kopyala-yapıştır yapma
4. Her dosyayı yeni proje yapısına uygun şekilde adapte et
5. Import/export path'lerini TurboRepo monorepo yapısına göre güncelle

### 🚨 Kritik Kontrol Noktaları
1. **Tema Sistemi**: Önce packages/shared/src/theme/ oluştur, sonra UI componentlerde kullan
2. **TypeScript Types**: packages/shared/src/types/ altında organize et
3. **Navigation**: React Navigation v6 uyumluluğunu kontrol et
4. **Context Providers**: Doğru seviyede (shared vs mobile) yerleştir
5. **API Services**: packages/shared/src/services/ altında merkezi yönetim

### 📊 İlerleme Takibi
1. Her başladığın task için migration.md'de 🔄 işareti koy
2. Tamamladığın task için ✅ işareti koy
3. Hata ile karşılaştığın task için ❌ işareti koy ve sorunu açıkla
4. Her 5 task'te bir genel durum raporu ver

### 🔍 Kod Kalitesi
1. ESLint ve TypeScript hatalarını düzelt
2. Unused imports temizle
3. Console.log'ları production'a uygun logging ile değiştir
4. Hardcoded değerleri config dosyalarına taşı

### 🧪 Test Stratejisi
1. Her major component migration'dan sonra test et
2. Navigation flow'ları kontrol et
3. API integration'ları verify et
4. Build process'i test et (yarn build)

### 📦 Dependency Management
1. Peer dependencies'leri kontrol et
2. Version conflicts'i çöz
3. TurboRepo cache'i optimize et
4. Bundle size'ı monitor et

## 🎯 BAŞLANGIÇ KOMUTU
"Migration.md dosyasındaki FAZ 1'den başlayarak sistematik olarak Fishivo2'den Fishivo'ya migration yapacağım. İlk olarak tema sistemini oluşturacağım."

## ⚠️ UYARILAR
- ASLA tüm dosyaları aynı anda kopyalama
- ASLA modül versiyonları ile oynama
- ASLA migration.md sırasını bozma
- Her adımda TurboRepo yapısını koru
- Context7 kullanmadan modül yükleme

Bu kurallara sıkı sıkıya uyarak migration işlemini başlat.

## 📋 KAPSAMLI MİGRASYON PLANI
### 🎯 FAZ 1: TEMEL ALTYAPI (1-2 Gün) 
✅ 1.1 Tema Sistemi ✅
- ✅packages/shared/src/theme/index.ts oluştur ✅
- ✅Tema dosyasını kopyala (100 satır - colors, spacing, typography, shadows) ✅
- ✅packages/shared/package.json güncelle - tema export ekle ✅
- ✅packages/ui/src içinde tema import et ✅
- ✅Button component'ini tema sistemi ile güncelle ✅

✅ 1.2 TypeScript Types ✅
- ✅packages/shared/src/types/navigation.ts oluştur (33 satır) ✅
- ✅packages/shared/src/types/api.ts oluştur ✅
- ✅packages/shared/src/types/units.ts oluştur ✅
- ✅packages/shared/src/types/user.ts oluştur ✅
- ✅packages/shared/src/types/fishing.ts oluştur ✅
- ✅packages/shared/src/types/index.ts güncelle ✅
### 🎯 FAZ 2: CORE UI COMPONENTS (2-3 Gün) ✅ 2.1 Temel UI Components ✅
- ✅packages/ui/src/components/Button.tsx güncelle (194 satır - 6 variant, 3 size) ✅
- ✅packages/ui/src/components/Icon.tsx oluştur (211 satır - 50+ icon) ✅
- ✅packages/ui/src/components/IconButton.tsx oluştur ✅
- ✅packages/ui/src/components/Avatar.tsx oluştur (61 satır) ✅
- ✅packages/ui/src/components/DefaultAvatar.tsx oluştur ✅
- ✅packages/ui/src/components/FishingIcons.tsx oluştur ✅
- ✅packages/ui/src/index.ts güncelle - component export'ları ekle ✅ ✅ 2.2 Layout Components ✅
- ✅ packages/ui/src/components/ScreenContainer.tsx oluştur (48 satır)
- ✅ packages/ui/src/components/AppHeader.tsx oluştur (96 satır)
- ✅ packages/ui/src/components/TabSelector.tsx oluştur (80 satır)
- ✅ packages/ui/src/components/FloatingActionMenu.tsx oluştur (215 satır)
- ✅ packages/ui/src/components/BottomSheetModal.tsx oluştur (116 satır)
- ✅ packages/ui/src/index.ts'e export'ları ekle
### 🎯 FAZ 3: ÖZELLEŞMIŞ COMPONENTS (3-4 Gün) ✅ 3.1 Balıkçılık Components ✅
- ✅ packages/ui/src/components/CatchCard.tsx oluştur (359 satır - ana feed component)
- ✅ packages/ui/src/components/FishSpeciesCard.tsx oluştur (150 satır)
- ✅ packages/ui/src/components/EquipmentCard.tsx oluştur (98 satır)
- ✅ packages/ui/src/index.ts'e export'ları ekle ✅ 3.2 Social Components ✅
- ✅ packages/ui/src/components/FeedPost.tsx oluştur
- ✅ packages/ui/src/components/LikeSystem.tsx oluştur
- ✅ packages/ui/src/components/UserProfileLayout.tsx oluştur
- ✅ packages/ui/src/components/ProBadge.tsx oluştur
- ✅ packages/ui/src/components/UserDisplayName.tsx oluştur
- ✅ packages/ui/src/components/ProfileHeader.tsx oluştur
- ✅ packages/ui/src/components/CrownIcon.tsx oluştur
- ✅ packages/ui/src/index.ts'e export'ları ekle ✅ 3.3 Modal Components
- ✅ packages/ui/src/components/ConfirmModal.tsx oluştur
- ✅ packages/ui/src/components/SuccessModal.tsx oluştur
- LoadingModal.tsx bulunamadı
- ✅ index.ts'e export ekle

### 3.4 Selector Components ✅
- ✅ packages/ui/src/components/CountryCitySelector.tsx oluştur
- ✅ packages/ui/src/components/FishSpeciesSelectorModal.tsx oluştur
- packages/ui/src/components/EquipmentSelectorModal.tsx oluştur (bulunamadı)
- packages/ui/src/components/FishingTechniqueSelectorModal.tsx oluştur (bulunamadı)
- packages/ui/src/components/WeatherSelectorModal.tsx oluştur (bulunamadı)
- ✅ index.ts'e export ekle

### 3.5 Weather Components ✅
- ✅ packages/ui/src/components/weather/CurrentWeatherCard.tsx oluşturuldu
- ✅ packages/ui/src/components/weather/DailyForecastCard.tsx oluşturuldu
- ✅ packages/ui/src/components/weather/FishingConditionsCard.tsx oluşturuldu
- ✅ packages/ui/src/components/weather/HourlyForecast.tsx oluşturuldu
- ✅ packages/ui/src/components/weather/WeatherDetailsGrid.tsx oluşturuldu
- ✅ packages/ui/src/components/weather/WeatherErrorState.tsx oluşturuldu
- ✅ packages/ui/src/components/weather/WeatherLoadingState.tsx oluşturuldu
- ✅ packages/ui/src/components/weather/WeatherMapComponent.tsx oluşturuldu (basitleştirilmiş versiyon)
- ✅ Tüm weather component'leri index.ts'e export edildi

### 3.6 Utility Components ✅
- ✅ packages/ui/src/components/AddButton.tsx oluştur
- ✅ packages/ui/src/components/MoreButton.tsx oluştur
- ✅ packages/ui/src/components/CountryFlag.tsx oluştur
- ✅ packages/ui/src/components/CrownIcon.tsx oluştur
- ✅ packages/ui/src/components/PostsGrid.tsx oluştur
- ✅ packages/ui/src/components/UserProfileSkeleton.tsx oluştur
- ✅ Tüm utility component'leri index.ts'e export edildi
### 🎯 FAZ 4: NAVIGATION SETUP (2 Gün) ✅ 4.1 Navigation Structure ✅
- ✅ apps/mobile/src/navigation/AppNavigator.tsx oluştur (76 satır) ✅
- ✅ apps/mobile/src/navigation/TabNavigator.tsx oluştur (168 satır) ✅
- ✅ apps/mobile/src/navigation/index.ts oluştur ✅
- ✅ Navigation dependencies yükle ✅
  - ✅ @react-navigation/native
  - ✅ @react-navigation/stack
  - ✅ @react-navigation/bottom-tabs
  - ✅ react-native-curved-bottom-bar
  - ✅ react-native-screens
  - ✅ react-native-gesture-handler
  - ✅ react-native-reanimated
  - ✅ react-native-svg
### 🎯 FAZ 5: SCREENS (4-5 Gün) ✅ 5.1 Ana Ekranlar
- ✅apps/mobile/src/screens/HomeScreen.tsx güncelle (413 satır - ana feed)
- ✅apps/mobile/src/screens/AuthScreen.tsx oluştur (292 satır)
- ✅apps/mobile/src/screens/ProfileScreen.tsx oluştur (877 satır)
- ✅apps/mobile/src/screens/MapScreen.tsx oluştur
- ✅apps/mobile/src/screens/WeatherScreen.tsx oluştur ✅ 5.2 Özelleşmiş Ekranlar
- ✅ apps/mobile/src/screens/AddCatchScreen.tsx oluştur
- ✅ apps/mobile/src/screens/AddGearScreen.tsx oluştur
- ✅ apps/mobile/src/screens/AddLocationScreen.tsx oluştur
- ✅ apps/mobile/src/screens/AddSpotScreen.tsx oluştur
- ✅ apps/mobile/src/screens/BlockedUsersScreen.tsx oluştur
- ✅ apps/mobile/src/screens/EditProfileScreen.tsx oluştur
- ✅ apps/mobile/src/screens/EquipmentSelectorScreen.tsx oluştur
- ✅ apps/mobile/src/screens/ExploreSearchScreen.tsx oluştur
- ✅ apps/mobile/src/screens/FishDetailScreen.tsx oluştur
- ✅ apps/mobile/src/screens/FishSpeciesScreen.tsx oluştur
- ✅ apps/mobile/src/screens/LocationManagementScreen.tsx oluştur
- ✅ apps/mobile/src/screens/NotificationSettingsScreen.tsx oluştur
- ✅ apps/mobile/src/screens/NotificationsScreen.tsx oluştur
- ✅ apps/mobile/src/screens/PostDetailScreen.tsx oluştur
- apps/mobile/src/screens/ProDemoScreen.tsx oluştur
- apps/mobile/src/screens/SettingsScreen.tsx oluştur
- apps/mobile/src/screens/UnitsSettingsScreen.tsx oluştur
- apps/mobile/src/screens/UserProfileScreen.tsx oluştur
- apps/mobile/src/screens/YourMapScreen.tsx oluştur
### 🎯 FAZ 6: CONTEXTS & STATE (2-3 Gün) ✅ 6.1 Context Providers
- apps/mobile/src/contexts/AuthContext.tsx oluştur (151 satır)
- apps/mobile/src/contexts/FollowContext.tsx oluştur
- packages/shared/src/contexts/LocationContext.tsx oluştur
- packages/shared/src/contexts/ThemeContext.tsx oluştur
### 🎯 FAZ 7: SERVICES & API (3-4 Gün) ✅ 7.1 API Services
- packages/shared/src/services/api.ts oluştur (769 satır - ana API client)
- packages/shared/src/services/databaseService.ts oluştur
- packages/shared/src/services/googleSignInService.ts oluştur
- packages/shared/src/services/imageUploadService.ts oluştur
- packages/shared/src/services/LocationService.tsx oluştur
- packages/shared/src/services/UnitsApiService.ts oluştur
### 🎯 FAZ 8: HOOKS & UTILS (2 Gün) ✅ 8.1 Custom Hooks
- packages/shared/src/hooks/useUnits.ts oluştur
- packages/shared/src/hooks/useAuth.ts oluştur
- packages/shared/src/hooks/useLocation.ts oluştur ✅ 8.2 Utility Functions
- packages/shared/src/utils/unitConversion.ts oluştur
- packages/shared/src/utils/weatherUtils.ts oluştur
- packages/shared/src/utils/dateUtils.ts oluştur
- packages/shared/src/utils/validationUtils.ts oluştur
### 🎯 FAZ 9: ASSETS & CONFIG (1 Gün) ✅ 9.1 Assets
- apps/mobile/src/assets/default-avatar.png kopyala
- Diğer asset dosyalarını kopyala ✅ 9.2 Configuration
- packages/shared/src/config/index.ts oluştur
- Environment variables setup
### 🎯 FAZ 10: DEPENDENCIES & BUILD (1-2 Gün) ✅ 10.1 Package Dependencies
- @react-navigation/native yoksa yükle
- @react-navigation/stack yoksa yükle
- @react-navigation/bottom-tabs yoksa yükle
- react-native-curved-bottom-bar yoksa yükle
- react-native-maps yoksa yükle
- react-native-vector-icons yoksa yükle
- react-native-image-picker yoksa yükle
- @react-native-async-storage/async-storage yoksa yükle
- react-native-safe-area-context yoksa yükle ✅ 10.2 Configuration Files
- metro.config.js güncelle (monorepo için)
- babel.config.js güncelle
- tsconfig.json paths ayarla
### 🎯 FAZ 11: TESTING & INTEGRATION (2-3 Gün) ✅ 11.1 Component Testing
- Tema sistemi test
- Button component test
- Navigation test
- API integration test ✅ 11.2 Screen Integration
- HomeScreen test
- AuthScreen test
- ProfileScreen test
## 📊 TOPLAM İSTATİSTİKLER
### 📁 Dosya Sayıları:
- Components: 45+ dosya
- Screens: 20+ dosya
- Services: 6 dosya
- Contexts: 4 dosya
- Utils: 4 dosya
- Types: 4 dosya
- Navigation: 3 dosya
### ⏱️ Tahmini Süre: 18-25 Gün
### 🔥 KRİTİK YOLLAR:
1. Tema Sistemi → Tüm componentler buna bağımlı
2. Button & Icon → En çok kullanılan componentler
3. Navigation → Ekranlar arası geçiş için gerekli
4. AuthContext → Kullanıcı yönetimi için kritik
5. API Service → Backend entegrasyonu için gerekli
### 🚀 BAŞLANGIÇ SIRASI:
1. Tema sistemi (packages/shared/src/theme/index.ts)
2. Button component (packages/ui/src/components/Button.tsx)
3. Icon component (packages/ui/src/components/Icon.tsx)
4. ScreenContainer (packages/ui/src/components/ScreenContainer.tsx)
5. Navigation setup (apps/mobile/src/navigation/)
Her tamamladığın dosyanın yanına ✅ koy, böylece ilerlemeyi takip edelim!