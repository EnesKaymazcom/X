# Fishivo2 → Fishivo Migrasyon Checklist
## 📋 KAPSAMLI MİGRASYON PLANI
### 🎯 FAZ 1: TEMEL ALTYAPI (1-2 Gün) ✅ 1.1 Tema Sistemi
- packages/shared/src/theme/index.ts oluştur
- Tema dosyasını kopyala (100 satır - colors, spacing, typography, shadows)
- packages/shared/package.json güncelle - tema export ekle
- packages/ui/src içinde tema import et ✅ 1.2 TypeScript Types
- packages/shared/src/types/navigation.ts oluştur (33 satır)
- packages/shared/src/types/api.ts oluştur
- packages/shared/src/types/units.ts oluştur
- packages/shared/src/types/user.ts oluştur
### 🎯 FAZ 2: CORE UI COMPONENTS (2-3 Gün) ✅ 2.1 Temel UI Components
- packages/ui/src/components/Button.tsx güncelle (194 satır - 6 variant, 3 size)
- packages/ui/src/components/Icon.tsx oluştur (211 satır - 50+ icon)
- packages/ui/src/components/IconButton.tsx oluştur
- packages/ui/src/components/Avatar.tsx oluştur (61 satır)
- packages/ui/src/components/DefaultAvatar.tsx oluştur ✅ 2.2 Layout Components
- packages/ui/src/components/ScreenContainer.tsx oluştur (48 satır)
- packages/ui/src/components/AppHeader.tsx oluştur (96 satır)
- packages/ui/src/components/TabSelector.tsx oluştur
- packages/ui/src/components/FloatingActionMenu.tsx oluştur
### 🎯 FAZ 3: ÖZELLEŞMIŞ COMPONENTS (3-4 Gün) ✅ 3.1 Balıkçılık Components
- packages/ui/src/components/CatchCard.tsx oluştur (359 satır - ana feed component)
- packages/ui/src/components/EquipmentCard.tsx oluştur
- packages/ui/src/components/EquipmentSection.tsx oluştur
- packages/ui/src/components/LocationCard.tsx oluştur
- packages/ui/src/components/FishingIcons.tsx oluştur ✅ 3.2 Social Components
- packages/ui/src/components/FeedPost.tsx oluştur
- packages/ui/src/components/LikeSystem.tsx oluştur
- packages/ui/src/components/UserProfileLayout.tsx oluştur
- packages/ui/src/components/ProBadge.tsx oluştur
- packages/ui/src/components/UserDisplayName.tsx oluştur
- packages/ui/src/components/ProfileHeader.tsx oluştur ✅ 3.3 Modal Components
- packages/ui/src/components/BottomSheetModal.tsx oluştur
- packages/ui/src/components/ConfirmModal.tsx oluştur
- packages/ui/src/components/SuccessModal.tsx oluştur
- packages/ui/src/components/PhotoPickerModal.tsx oluştur
- packages/ui/src/components/LikersListModal.tsx oluştur ✅ 3.4 Selector Components
- packages/ui/src/components/CountryCitySelector.tsx oluştur
- packages/ui/src/components/FishSpeciesSelectorModal.tsx oluştur
- packages/ui/src/components/EquipmentSelectorModal.tsx oluştur
- packages/ui/src/components/FishingTechniqueSelectorModal.tsx oluştur
- packages/ui/src/components/WeatherSelectorModal.tsx oluştur ✅ 3.5 Weather Components
- packages/ui/src/components/weather/CurrentWeatherCard.tsx oluştur
- packages/ui/src/components/weather/DailyForecastCard.tsx oluştur
- packages/ui/src/components/weather/FishingConditionsCard.tsx oluştur
- packages/ui/src/components/weather/HourlyForecast.tsx oluştur
- packages/ui/src/components/weather/WeatherDetailsGrid.tsx oluştur
- packages/ui/src/components/weather/WeatherErrorState.tsx oluştur
- packages/ui/src/components/weather/WeatherLoadingState.tsx oluştur
- packages/ui/src/components/weather/WeatherMapComponent.tsx oluştur ✅ 3.6 Utility Components
- packages/ui/src/components/AddButton.tsx oluştur
- packages/ui/src/components/MoreButton.tsx oluştur
- packages/ui/src/components/CountryFlag.tsx oluştur
- packages/ui/src/components/CrownIcon.tsx oluştur
- packages/ui/src/components/PostsGrid.tsx oluştur
- packages/ui/src/components/UserProfileSkeleton.tsx oluştur
### 🎯 FAZ 4: NAVIGATION SETUP (2 Gün) ✅ 4.1 Navigation Structure
- apps/mobile/src/navigation/AppNavigator.tsx oluştur (76 satır)
- apps/mobile/src/navigation/TabNavigator.tsx oluştur (168 satır)
- apps/mobile/src/navigation/index.ts oluştur
- Navigation dependencies yükle
### 🎯 FAZ 5: SCREENS (4-5 Gün) ✅ 5.1 Ana Ekranlar
- apps/mobile/src/screens/HomeScreen.tsx güncelle (413 satır - ana feed)
- apps/mobile/src/screens/AuthScreen.tsx oluştur (292 satır)
- apps/mobile/src/screens/ProfileScreen.tsx oluştur (877 satır)
- apps/mobile/src/screens/MapScreen.tsx oluştur
- apps/mobile/src/screens/WeatherScreen.tsx oluştur ✅ 5.2 Özelleşmiş Ekranlar
- apps/mobile/src/screens/AddCatchScreen.tsx oluştur
- apps/mobile/src/screens/AddGearScreen.tsx oluştur
- apps/mobile/src/screens/AddLocationScreen.tsx oluştur
- apps/mobile/src/screens/AddSpotScreen.tsx oluştur
- apps/mobile/src/screens/BlockedUsersScreen.tsx oluştur
- apps/mobile/src/screens/EditProfileScreen.tsx oluştur
- apps/mobile/src/screens/EquipmentSelectorScreen.tsx oluştur
- apps/mobile/src/screens/ExploreSearchScreen.tsx oluştur
- apps/mobile/src/screens/FishDetailScreen.tsx oluştur
- apps/mobile/src/screens/FishSpeciesScreen.tsx oluştur
- apps/mobile/src/screens/LocationManagementScreen.tsx oluştur
- apps/mobile/src/screens/NotificationSettingsScreen.tsx oluştur
- apps/mobile/src/screens/NotificationsScreen.tsx oluştur
- apps/mobile/src/screens/PostDetailScreen.tsx oluştur
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
- @react-navigation/native yükle
- @react-navigation/stack yükle
- @react-navigation/bottom-tabs yükle
- react-native-curved-bottom-bar yükle
- react-native-maps yükle
- react-native-vector-icons yükle
- react-native-image-picker yükle
- @react-native-async-storage/async-storage yükle
- react-native-safe-area-context yükle ✅ 10.2 Configuration Files
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