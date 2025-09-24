# Fishivo Proje Yapısı - Güncel Dokümantasyon
## 🚨 **TEMEL KURALLAR - MUTLAKA UYULACAK**
### ⚠️ **ZORUNLU KURALLAR**
- ❌ GEÇİÇİ ÇÖZÜMLER YASAK EN PROFESYONELLERİN KULLANDIĞI YÖNTEMLER KULLANILCAK!
- 🔥 **TEMİZ KOD YAZMAZSAN SENİN ANANI SİKERİM** - Gereksiz karmaşıklık YASAK, sade ve anlaşılır kod yaz
- ❌ **CONSOLE LOG YAZMAK YASAK!** - Sadece debug gerektiğinde ve sonra temizlenecek
- ❌ **KOORDİNAT EKLEMEK YASAK!** - Hiçbir yere İstanbul veya başka şehir koordinatı ekleme, ANAMI SİKECEKLER!
- ❌ **RELATİVE İMPORT YASAK!** - Sadece `@fishivo/*` ve `@/` kullan
- ❌ **ANY TYPE YASAK!** - Her zaman tip güvenliği sağla
- ❌ **CONSOL LOG YAZMAK YASAK SADECE GEREKİRSE BANA SOR! 
- ❌ **DUPLICATE KOD YASAK!** - Mevcut kodu kontrol et, varsa kullan
- ❌ **GEREKSİZ KARMAŞIKLIK YASAK!** - Native çözüm varsa custom yazma
- ❌ **ALERT.ALERT KULLANIMI YASAK!** - Yeni screen/component'lerde FishivoModal kullanılacak
- 🚨 **BANA SORMADAN GIT CHECKOUT/COMMIT YAPMA YASAK!** - Git checkout, git commit, git reset gibi komutları bana sormadan çalıştırırsan ANAMIZI SİKECEKLER! Önce sor, onay al, sonra çalıştır!
- ✅ **TÜRKÇE İLETİŞİM** - Benimlke hep Türkçe konuş
- ✅ **TEMİZ KOD YAZACAKSIN** Öncelik logsuz minumum yorum duplicate yaratmadan gereksiz kod yazmadan tertemiz kod yazmak!
- ✅ **KOD ANALİZİ ÖNCE** - Görev öncesi mutlaka mevcut kodu incele
- ✅ **YARN KULLANIMI** - Package manager olarak yarn kullanılıyor
- ✅ **FİSHİVO MODAL KULLANIMI** - Yeni screen oluştururken modal ihtiyacında FishivoModal kullanılacak
- ✅ JSX attribute'ları → çift tırnak kullanıyor
- ✅ JavaScript string'leri → tek tırnak kullanıyor

## 🏗️ **GÜNCEL PROJE YAPISI - TURBOREPO MONOREPO**

```
fishivo/                                      # Ana proje kök dizini - Turborepo monorepo
├── package.json                             # Root workspace config, tüm workspace'leri tanımlar
├── turbo.json                               # Turborepo build pipeline, envMode: strict
├── tsconfig.json                            # Root TypeScript config, tüm workspace'ler için temel
├── .gitignore                               # Git ignore kuralları, .env ve build dosyaları
├── yarn.lock                                # Yarn 4.9.2 dependency lock dosyası
├── CLAUDE.md                                # Ana proje dokümantasyonu ve kurallar
├── mcp.text                                 # MCP server konfigürasyonu (Supabase, SSH, Coolify)
├── premium.md                               # Premium özellikler dokümantasyonu
├── babel.config.js                          # Babel transpiler konfigürasyonu
├── index.js                                 # Root index dosyası
├── metro.config.js                          # Metro bundler konfigürasyonu
├── scripts/                                 # Proje utility scriptleri
│   ├── clean-comments.sh                   # Tüm kodlardan yorum temizleme bash scripti
│   ├── create-test-users.sql               # Test kullanıcıları oluşturma SQL scripti
│   └── remove-comments.js                  # JavaScript yorum temizleme Node scripti
│
├── apps/                                    # Uygulama workspace'leri
│   ├── web/                                 # Next.js 15 Web Uygulaması (@fishivo/web)
│   │   ├── src/                             # Web kaynak kod dizini
│   │   │   ├── app/                         # Next.js 15 App Router dizini
│   │   │   │   ├── [locale]/                # i18n dinamik route (tr/en)
│   │   │   │   │   ├── layout.tsx           # Locale-specific layout wrapper
│   │   │   │   │   └── page.tsx             # Ana sayfa komponenti
│   │   │   │   ├── api/                     # Next.js API route handlers
│   │   │   │   │   ├── contact/             # İletişim form endpoint'i
│   │   │   │   │   │   └── route.ts         # POST /api/contact handler
│   │   │   │   │   └── email/               # Email servis endpoint'leri
│   │   │   │   │       └── test/            # Email test endpoint'i
│   │   │   │   │           └── route.ts     # POST /api/email/test handler
│   │   │   │   ├── auth/                    # Supabase auth callback routes
│   │   │   │   │   └── callback/            # OAuth callback endpoint
│   │   │   │   │       └── route.ts         # Auth callback handler
│   │   │   │   ├── globals.css              # Global CSS stilleri, Tailwind directives
│   │   │   │   ├── layout.tsx               # Root layout, HTML yapısı
│   │   │   │   ├── not-found.tsx            # 404 hata sayfası
│   │   │   │   ├── error.tsx                # Error boundary sayfası
│   │   │   │   └── providers.tsx            # React context providers
│   │   │   ├── components/                  # Web-specific React componentleri
│   │   │   │   ├── admin/                   # Admin panel componentleri
│   │   │   │   │   ├── admin-dashboard.tsx  # Admin ana panel
│   │   │   │   │   ├── admin-sidebar.tsx    # Admin yan menü
│   │   │   │   │   ├── admin-stats.tsx      # İstatistik kartları
│   │   │   │   │   └── modal-footer.tsx     # Modal footer komponenti
│   │   │   │   ├── auth/                    # Authentication componentleri
│   │   │   │   │   ├── auth-status.tsx      # Kullanıcı auth durumu gösterimi
│   │   │   │   │   └── auth-status-wrapper.tsx # Auth durumu wrapper
│   │   │   │   ├── consent/                 # KVKK/GDPR onay componentleri
│   │   │   │   │   └── kvkk-consent-banner.tsx # KVKK onay banner'ı
│   │   │   │   ├── icons/                   # SVG icon componentleri
│   │   │   │   │   ├── google-icon.tsx      # Google logo SVG
│   │   │   │   │   └── x-icon.tsx           # X (Twitter) logo SVG
│   │   │   │   ├── ui/                      # Shadcn/ui componentleri (50+ component)
│   │   │   │   │   ├── accordion.tsx        # Açılır/kapanır içerik
│   │   │   │   │   ├── alert.tsx            # Uyarı mesajı komponenti
│   │   │   │   │   ├── avatar.tsx           # Kullanıcı avatarı
│   │   │   │   │   ├── badge.tsx            # Etiket/rozet komponenti
│   │   │   │   │   ├── button.tsx           # Temel button komponenti
│   │   │   │   │   ├── card.tsx             # Kart container'ı
│   │   │   │   │   ├── checkbox.tsx         # Checkbox input
│   │   │   │   │   ├── dialog.tsx           # Modal dialog
│   │   │   │   │   ├── dropdown-menu.tsx    # Açılır menü
│   │   │   │   │   ├── form.tsx             # Form wrapper
│   │   │   │   │   ├── input.tsx            # Text input komponenti
│   │   │   │   │   ├── label.tsx            # Form label
│   │   │   │   │   ├── navbar.tsx           # Site navigation bar
│   │   │   │   │   ├── footer.tsx           # Site footer'ı
│   │   │   │   │   ├── select.tsx           # Dropdown select
│   │   │   │   │   ├── separator.tsx        # Ayırıcı çizgi
│   │   │   │   │   ├── skeleton.tsx         # Loading skeleton
│   │   │   │   │   ├── switch.tsx           # Toggle switch
│   │   │   │   │   ├── table.tsx            # Tablo komponenti
│   │   │   │   │   ├── tabs.tsx             # Tab komponenti
│   │   │   │   │   ├── textarea.tsx         # Çok satırlı text input
│   │   │   │   │   ├── toast.tsx            # Toast mesajları
│   │   │   │   │   └── tooltip.tsx          # Tooltip komponenti
│   │   │   │   ├── widgets/        # Weather ve map widgets
│   │   │   │   │   ├── CurrentWeather.tsx  # Anlık hava durumu
│   │   │   │   │   ├── Map.tsx             # Web map component
│   │   │   │   │   ├── SpotMap.tsx         # Fishing spot map
│   │   │   │   │   └── WeatherWidgets.tsx  # Hava durumu widget'ları
│   │   │   │   └── error-boundary.tsx      # Error boundary wrapper
│   │   │   ├── hooks/              # Web-specific hooks
│   │   │   │   ├── use-consent.ts          # KVKK consent hook
│   │   │   │   └── use-rate-limiter.ts     # Rate limiting hook
│   │   │   ├── lib/                # Web utilities
│   │   │   │   ├── admin-check.ts          # Admin yetkisi kontrolü
│   │   │   │   ├── cloudflare-upload.ts    # Cloudflare R2 upload
│   │   │   │   ├── consent/
│   │   │   │   │   └── consent-manager.ts  # Consent yönetimi
│   │   │   │   ├── i18n/           # Internationalization
│   │   │   │   │   ├── config.ts           # i18n config
│   │   │   │   │   ├── context.tsx         # i18n context
│   │   │   │   │   ├── middleware.ts       # i18n middleware
│   │   │   │   │   └── server.ts           # Server-side i18n
│   │   │   │   ├── image-protection.ts     # Görsel koruma
│   │   │   │   ├── r2-image-helper.ts      # R2 görsel helper
│   │   │   │   └── utils.ts                # Genel utilities
│   │   │   ├── middleware.ts       # Next.js middleware
│   │   │   ├── providers/          # React providers
│   │   │   │   └── consent-provider.tsx    # KVKK consent provider
│   │   │   └── styles/             # Additional CSS
│   │   │       └── image-protection.css    # Görsel koruma CSS
│   │   ├── public/                 # Static assets
│   │   │   ├── icons/              # Weather icons (100+ SVG)
│   │   │   ├── social/             # Social media icons
│   │   │   ├── fishivo.svg         # Logo file
│   │   │   └── favicon.ico         # Favicon
│   │   ├── .env                    # Public env variables
│   │   ├── components.json         # Shadcn/ui config
│   │   ├── next.config.js          # Next.js konfigürasyonu
│   │   ├── tailwind.config.js      # Tailwind CSS config
│   │   ├── tsconfig.json           # TypeScript config
│   │   └── package.json            # Web dependencies
│   │
│   └── native/                              # React Native 0.78.2 Mobil App (@fishivo/mobile)
│       ├── src/                             # Native kaynak kod dizini
│       │   ├── App.tsx                     # Ana uygulama komponenti, provider setup
│       │   ├── screens/                    # Tüm uygulama ekranları (35+ screen)
│       │   │   ├── AccountInfoScreen.tsx   # Hesap bilgileri ekranı
│       │   │   ├── AddCatchScreen.tsx      # Yeni yakalama ekleme formu
│       │   │   ├── AppInfoScreen.tsx       # Uygulama hakkında bilgi
│       │   │   ├── AuthScreen.tsx          # Giriş ve kayıt ekranı
│       │   │   ├── BlockedUsersScreen.tsx  # Engellenen kullanıcılar listesi
│       │   │   ├── CatchDetailsScreen.tsx  # Yakalama detay sayfası
│       │   │   ├── CommentsScreen.tsx      # Yorumlar ekranı
│       │   │   ├── ContactsScreen.tsx      # Kişiler/arkadaşlar listesi
│       │   │   ├── DeleteAccountScreen.tsx # Hesap silme onay ekranı
│       │   │   ├── EditProfileScreen.tsx   # Profil düzenleme formu
│       │   │   ├── FishDetailScreen.tsx    # Balık türü detay sayfası
│       │   │   ├── FollowersScreen.tsx     # Takipçiler listesi
│       │   │   ├── FollowingScreen.tsx     # Takip edilenler listesi
│       │   │   ├── FriendsScreen.tsx       # Arkadaş listesi
│       │   │   ├── HomeScreen.tsx          # Ana sayfa feed'i
│       │   │   ├── MapScreen.tsx           # Harita ekranı (clustering + layers)
│       │   │   ├── MyEquipmentScreen.tsx   # Kullanıcı ekipman listesi
│       │   │   ├── MyFishingTechniquesScreen.tsx # Balıkçılık teknikleri
│       │   │   ├── MySpotsScreen.tsx       # Kullanıcı lokasyonları
│       │   │   ├── NotificationsScreen.tsx # Bildirimler ekranı
│       │   │   ├── PermissionsScreen.tsx   # Uygulama izinleri yönetimi
│       │   │   ├── PhoneVerificationScreen.tsx # Telefon doğrulama
│       │   │   ├── PostPreviewScreen.tsx   # Post önizleme ekranı
│       │   │   ├── PrivacyScreen.tsx       # Gizlilik ayarları
│       │   │   ├── ProfileScreen.tsx       # Kullanıcı profil sayfası
│       │   │   ├── RecentCatchesScreen.tsx # Son yakalamalar listesi
│       │   │   ├── SecurityScreen.tsx      # Güvenlik ayarları
│       │   │   ├── SettingsScreen.tsx      # Genel ayarlar
│       │   │   ├── SpeciesDetailScreen.tsx # Balık türü detayları
│       │   │   ├── SpeciesSearchScreen.tsx # Balık türü arama
│       │   │   ├── SpotDetailScreen.tsx    # Lokasyon detayları
│       │   │   ├── SupportScreen.tsx       # Destek/yardım ekranı
│       │   │   ├── TermsOfServiceScreen.tsx # Kullanım koşulları
│       │   │   ├── TournamentScreen.tsx    # Turnuva ekranı
│       │   │   ├── UpdateEmailScreen.tsx   # Email güncelleme
│       │   │   ├── UpdatePasswordScreen.tsx # Şifre değiştirme
│       │   │   ├── UploadScreen.tsx        # Dosya yükleme ekranı
│       │   │   └── WeatherScreen.tsx       # Hava durumu detayları
│       │   ├── components/                 # Yeniden kullanılabilir componentler
│       │   │   ├── comments/               # Yorum sistemi componentleri
│       │   │   │   ├── CommentSection.tsx  # Yorum bölümü container'ı
│       │   │   │   ├── CommentInput.tsx    # Yorum yazma input'u
│       │   │   │   ├── CommentItem.tsx     # Tekil yorum komponenti
│       │   │   │   ├── CommentLikeSystem.tsx # Yorum beğeni sistemi
│       │   │   │   └── CommentList.tsx     # Yorum listesi container'ı
│       │   │   ├── fish/                   # Balık detay tab componentleri
│       │   │   │   ├── FishCatchesTab.tsx  # Yakalama kayıtları tab'ı
│       │   │   │   ├── FishDisciplinesTab.tsx # Teknikler tab'ı
│       │   │   │   └── FishTopGearTab.tsx  # Popüler ekipmanlar tab'ı
│       │   │   ├── profile/                # Profil tab componentleri
│       │   │   │   ├── ProfileCatchesTab.tsx # Profil yakalamalar tab'ı
│       │   │   │   └── ProfileSpotsTab.tsx # Profil lokasyonlar tab'ı
│       │   │   └── ui/                     # Genel UI componentleri (60+ component)
│       │   │       ├── maps/               # Harita sistemi componentleri
│       │   │       │   ├── UniversalMapView.tsx # Multi-provider harita wrapper
│       │   │       │   ├── MapComponent.tsx # Legacy harita komponenti
│       │   │       │   ├── WeatherMapComponent.tsx # Hava durumu harita overlay
│       │   │       │   ├── LocationMapSelector.tsx # Lokasyon seçici harita
│       │   │       │   ├── LinearCompass.tsx # Smooth animasyonlu pusula
│       │   │       │   ├── types.ts        # Harita tip tanımlamaları
│       │   │       │   ├── providers/      # Harita provider implementasyonları
│       │   │       │   │   ├── MapLibreProvider.tsx # MapLibre GL provider
│       │   │       │   │   ├── MapboxProvider.tsx # Mapbox 3D provider
│       │   │       │   │   └── types.ts    # Provider tipleri
│       │   │       │   └── layers/         # Harita katman sistemi
│       │   │       │       ├── LayerSelector.tsx # Katman seçici UI
│       │   │       │       ├── layerDefinitions.ts # Katman tanımları
│       │   │       │       └── types.ts    # Katman tipleri
│       │   │       ├── AddButton.tsx       # Yüzen ekleme butonu
│       │   │       ├── AppHeader.tsx       # Uygulama üst başlığı
│       │   │       ├── Avatar.tsx          # Kullanıcı profil resmi
│       │   │       ├── Button.tsx          # Temel button komponenti
│       │   │       ├── CatchCard.tsx       # Yakalama kart komponenti
│       │   │       ├── CatchFilters.tsx    # Yakalama filtreleme UI
│       │   │       ├── CollapsibleSection.tsx # Açılır/kapanır bölüm
│       │   │       ├── DateTimePicker.tsx  # Tarih ve saat seçici
│       │   │       ├── DisciplineSelector.tsx # Teknik seçici
│       │   │       ├── EditButton.tsx      # Düzenleme butonu
│       │   │       ├── EquipmentSelector.tsx # Ekipman seçici
│       │   │       ├── FishivoModal.tsx    # Özel modal komponenti
│       │   │       ├── FloatingActionMenu.tsx # Yüzen aksiyon menüsü
│       │   │       ├── FollowButton.tsx    # Takip et/bırak butonu
│       │   │       ├── ImageCarousel.tsx   # Resim galerisi
│       │   │       ├── ImagePickerModal.tsx # Resim seçme modal'ı
│       │   │       ├── ImageUploader.tsx   # Resim yükleme komponenti
│       │   │       ├── ImageViewerModal.tsx # Tam ekran resim görüntüleyici
│       │   │       ├── Input.tsx           # Text input komponenti
│       │   │       ├── LikeSystem.tsx      # Post beğeni sistemi
│       │   │       ├── ListEmptyComponent.tsx # Boş liste mesajı
│       │   │       ├── LoadingSpinner.tsx  # Yükleme animasyonu
│       │   │       ├── LocationInfoCard.tsx # Konum bilgi kartı
│       │   │       ├── LocationPermissionCard.tsx # Konum izni kartı
│       │   │       ├── MiniCatchCard.tsx   # Küçük yakalama kartı
│       │   │       ├── Modal.tsx           # Genel modal wrapper
│       │   │       ├── OldMapComponent.tsx # Eski harita (deprecated)
│       │   │       ├── PhotoGrid.tsx       # Fotoğraf grid görünümü
│       │   │       ├── PostDetailsModal.tsx # Post detay modal'ı
│       │   │       ├── ProfileCard.tsx     # Kullanıcı profil kartı
│       │   │       ├── ProfileHeader.tsx   # Profil başlık bölümü
│       │   │       ├── ProfileStats.tsx    # Profil istatistikleri
│       │   │       ├── QRScanner.tsx       # QR kod okuyucu
│       │   │       ├── RefreshControl.tsx  # Pull-to-refresh kontrolü
│       │   │       ├── SearchBar.tsx       # Arama çubuğu
│       │   │       ├── ShareButton.tsx     # Paylaşım butonu
│       │   │       ├── SpeciesCard.tsx     # Balık türü kartı
│       │   │       ├── SpeciesInfoCard.tsx # Balık türü bilgi kartı
│       │   │       ├── SpeciesSelector.tsx # Balık türü seçici
│       │   │       ├── SpotCard.tsx        # Lokasyon kartı
│       │   │       ├── SpotDetailsCard.tsx # Lokasyon detay kartı
│       │   │       ├── TabView.tsx         # Tab görünüm komponenti
│       │   │       ├── TextArea.tsx        # Çok satırlı metin girişi
│       │   │       ├── TimePicker.tsx      # Saat seçici
│       │   │       ├── TournamentCard.tsx  # Turnuva kartı
│       │   │       ├── UnitToggle.tsx      # Birim değiştirici (kg/lb)
│       │   │       ├── UserCard.tsx        # Kullanıcı kartı
│       │   │       ├── WeatherCard.tsx     # Hava durumu kartı
│       │   │       ├── WeatherChart.tsx    # Hava durumu grafiği
│       │   │       └── WeatherDetailsCard.tsx # Detaylı hava durumu
│       │   │       ├── maps/
│       │   │       │   ├── UniversalMapView.tsx     # Evrensel harita provider
│       │   │       │   ├── MapLayerModal.tsx        # Katman seçim UI
│       │   │       │   ├── CitySearchModal.tsx      # Şehir arama modal'ı
│       │   │       │   ├── CoordinateInputModal.tsx # Koordinat girişi
│       │   │       │   ├── LinearCompass.tsx        # Denizcilik pusulası
│       │   │       │   ├── providers/
│       │   │       │   │   ├── MapLibreProvider.tsx # OpenFreeMap/MapTiler provider
│       │   │       │   │   └── MapboxProvider.tsx   # 3D Mapbox provider
│       │   │       │   ├── layers/
│       │   │       │   │   ├── types.ts             # Katman tip tanımları
│       │   │       │   │   └── layerDefinitions.ts  # Profesyonel katman ayarları
│       │   │       │   ├── markers/
│       │   │       │   │   ├── FishivoMarker.tsx    # Genel marker
│       │   │       │   │   ├── SpotMarker.tsx       # Balıkçılık noktası marker'ı
│       │   │       │   │   ├── MapClusterMarker.tsx # Kümeleme marker'ı
│       │   │       │   │   └── marker-assets/       # Marker görselleri
│       │   │       │   ├── types.ts                 # Harita tip tanımları
│       │   │       │   └── index.ts                 # Harita exports
│       │   │       └── weather/
│       │   │           └── WeatherMapComponent.tsx  # Hava durumu harita overlay
│       │   ├── hooks/                      # Custom React hooks
│       │   │   ├── useCommentLikeSystem.ts # Yorum beğeni yönetimi
│       │   │   ├── useCommentReportModal.tsx # Yorum şikayet modal'ı
│       │   │   ├── useContacts.ts          # Kişi listesi yönetimi
│       │   │   ├── useFollow.ts            # Takip sistemi hook'u
│       │   │   ├── useFriends.ts           # Arkadaş listesi yönetimi
│       │   │   ├── useLikeSystem.ts        # Post beğeni yönetimi
│       │   │   ├── useLocation.ts          # Legacy konum hook'u
│       │   │   ├── useMapCatches.tsx       # Harita clustering hook'u
│       │   │   ├── useReportModal.tsx      # Şikayet modal yönetimi
│       │   │   ├── useStickyTabs.ts        # Yapışkan tab yönetimi
│       │   │   └── useSupabaseUser.ts      # Supabase kullanıcı hook'u
│       │   ├── stores/                     # Zustand global state yönetimi
│       │   │   ├── followStore.ts          # Takip durumu global store
│       │   │   ├── locationStore.ts        # Merkezi konum yönetimi
│       │   │   └── mapCacheStore.ts        # Harita cache yönetimi
│       │   ├── navigation/                 # React Navigation yapısı
│       │   │   ├── AppNavigator.tsx        # Ana stack navigator
│       │   │   ├── TabNavigator.tsx        # Alt tab navigator
│       │   │   └── types.ts                # Navigation tip tanımları
│       │   ├── contexts/                   # React Context API
│       │   │   ├── LanguageContext.tsx     # Dil yönetimi context'i
│       │   │   └── ThemeContext.tsx        # Tema yönetimi context'i
│       │   ├── lib/                        # Library fonksiyonları
│       │   │   └── i18n/                   # Çoklu dil desteği
│       │   │       ├── config.ts           # i18n konfigürasyonu
│       │   │       └── i18n.ts             # i18n başlatma
│       │   ├── storage/                    # Yerel depolama
│       │   │   └── MobileStorage.ts        # AsyncStorage wrapper
│       │   ├── assets/                     # Statik varlıklar
│       │   │   ├── default-avatar.png      # Varsayılan profil resmi
│       │   │   └── images/                 # Uygulama görselleri
│       │   │       └── map-layers/         # Harita katman önizlemeleri
│       │   │           └── marine/         # Denizcilik katmanları
│       │   │               └── openseamap.png # OpenSeaMap önizleme
│       │   ├── data/                       # Statik veri dosyaları
│       │   │   └── countriesWithPhoneCodes.ts # Ülke ve telefon kodları
│       │   ├── config/                     # Uygulama konfigürasyonu
│       │   │   └── index.ts                # API URL'leri ve sabitler
│       │   ├── types/                      # TypeScript tip tanımları
│       │   │   ├── global.d.ts             # Global tipler
│       │   │   └── navigation.ts           # Navigation tipleri
│       │   ├── utils/                      # Yardımcı fonksiyonlar
│       │   │   ├── conservation-status.ts  # Koruma durumu hesaplamaları
│       │   │   ├── contacts.ts             # Kişi yönetimi yardımcıları
│       │   │   ├── feeding-types.ts        # Beslenme tipleri
│       │   │   ├── fish-habitats.ts        # Balık yaşam alanları
│       │   │   ├── LocationService.ts      # Legacy konum servisi
│       │   │   └── map-cache-manager.ts    # Harita önbellek yönetimi
│       │   └── theme.ts                    # Tema tanımlamaları
│       ├── android/                        # Android native kod
│       │   ├── app/                        # Android app modülü
│       │   │   ├── build.gradle            # App level Gradle config
│       │   │   ├── proguard-rules.pro      # ProGuard obfuscation kuralları
│       │   │   ├── src/                    # Android kaynak dosyaları
│       │   │   │   └── main/               # Main source set
│       │   │   │       ├── AndroidManifest.xml # Android manifest
│       │   │   │       ├── assets/         # Android assets
│       │   │   │       ├── java/           # Java/Kotlin kod
│       │   │   │       │   └── com/fishivo/ # Package dizini
│       │   │   │       └── res/            # Android resources
│       │   │   │           ├── drawable/   # Drawable varlıklar
│       │   │   │           ├── drawable-mdpi/ # Medium DPI icons
│       │   │   │           ├── drawable-xhdpi/ # Extra high DPI
│       │   │   │           ├── drawable-xxhdpi/ # XX high DPI
│       │   │   │           ├── drawable-xxxhdpi/ # XXX high DPI
│       │   │   │           ├── layout/     # Layout XML dosyaları
│       │   │   │           ├── mipmap-*/   # App launcher icons
│       │   │   │           └── values/     # String, color, style resources
│       │   │   └── keystore.properties.example # Keystore config örneği
│       │   ├── build.gradle                # Project level Gradle config
│       │   ├── gradle.properties           # Gradle özellikleri
│       │   ├── gradlew                     # Gradle wrapper script (Unix)
│       │   ├── gradlew.bat                 # Gradle wrapper script (Windows)
│       │   ├── settings.gradle             # Gradle proje ayarları
│       │   └── gradle/                     # Gradle wrapper dosyaları
│       │       └── wrapper/                # Wrapper konfigürasyonu
│       ├── ios/                            # iOS native kod
│       │   ├── Fishivo.xcodeproj/          # Xcode proje dosyası
│       │   │   └── project.pbxproj         # Xcode proje konfigürasyonu
│       │   ├── Fishivo.xcworkspace/        # CocoaPods workspace
│       │   │   └── contents.xcworkspacedata # Workspace konfigürasyonu
│       │   ├── Fishivo/                    # iOS app kaynak kodları
│       │   │   ├── AppDelegate.h           # App delegate header
│       │   │   ├── AppDelegate.mm          # App delegate implementation
│       │   │   ├── Info.plist              # iOS app konfigürasyonu
│       │   │   ├── main.m                  # iOS main entry point
│       │   │   ├── LaunchScreen.storyboard # Splash screen
│       │   │   └── Images.xcassets/        # iOS görsel varlıklar
│       │   │       ├── AppIcon.appiconset/ # App icon set
│       │   │       └── Contents.json       # Asset catalog manifest
│       │   ├── FishivoTests/               # iOS unit testleri
│       │   │   └── FishivoTests.m         # Test dosyası
│       │   ├── Podfile                     # CocoaPods dependencies
│       │   └── Podfile.lock                # CocoaPods lock dosyası
│       ├── GUVENLIK_AYARLARI.md           # Android güvenlik dokümantasyonu
│       ├── .env                           # Native environment variables
│       ├── .env.example                   # Environment örnek dosyası
│       ├── app.json                       # React Native app config
│       ├── babel.config.js                # Babel transpiler config
│       ├── index.js                       # App entry point
│       ├── jest.config.js                 # Jest test konfigürasyonu
│       ├── metro.config.js                # Metro bundler config
│       ├── react-native.config.js         # React Native platform config
│       ├── tsconfig.json                  # TypeScript konfigürasyonu
│       └── package.json                   # Native app dependencies
│
├── packages/                                # Paylaşılan workspace paketleri
│   ├── api/                                # API servisleri paketi (@fishivo/api)
│   │   ├── src/                            # API kaynak kodları
│   │   │   ├── client/                     # Supabase client'ları
│   │   │   │   ├── supabase.native.ts     # React Native Supabase client
│   │   │   │   ├── supabase.server.ts     # Next.js SSR Supabase client
│   │   │   │   └── supabase.web.ts        # Next.js browser Supabase client
│   │   │   ├── services/                  # API servis katmanları
│   │   │   │   ├── comments/              # Yorum sistemi servisleri
│   │   │   │   │   ├── comments.native.ts # Native yorum CRUD
│   │   │   │   │   ├── comment-likes.native.ts # Yorum beğeni servisi
│   │   │   │   │   └── index.ts           # Comments exports
│   │   │   │   ├── contacts/
│   │   │   │   │   ├── contacts.native.ts    # Native kişi servisi
│   │   │   │   │   ├── contacts.web.ts       # Web kişi servisi
│   │   │   │   │   ├── types.ts              # Contact tipleri
│   │   │   │   │   └── index.ts              # Contacts exports
│   │   │   │   ├── email/                 # Email servisleri
│   │   │   │   │   ├── email.web.ts       # Nodemailer SMTP servisi
│   │   │   │   │   ├── email.native.ts    # Native HTTP email client
│   │   │   │   │   ├── config.ts          # Email konfigürasyonu
│   │   │   │   │   ├── templates/         # Email şablonları
│   │   │   │   │   │   ├── en/            # İngilizce şablonlar
│   │   │   │   │   │   │   ├── baseTemplate.ts # Temel şablon
│   │   │   │   │   │   │   ├── contactConfirmation.ts # İletişim onayı
│   │   │   │   │   │   │   ├── emailVerification.ts # Email doğrulama
│   │   │   │   │   │   │   └── index.ts   # EN exports
│   │   │   │   │   │   ├── tr/            # Türkçe şablonlar
│   │   │   │   │   │   │   ├── baseTemplate.ts # Temel şablon
│   │   │   │   │   │   │   ├── contactConfirmation.ts # İletişim onayı
│   │   │   │   │   │   │   ├── emailVerification.ts # Email doğrulama
│   │   │   │   │   │   │   └── index.ts   # TR exports
│   │   │   │   │   │   └── baseTemplateEngine.ts # Şablon motoru
│   │   │   │   │   └── index.ts           # Email exports
│   │   │   │   ├── equipment/
│   │   │   │   │   ├── equipment.native.ts   # Native ekipman servisi
│   │   │   │   │   ├── equipment.web.ts      # Web ekipman servisi
│   │   │   │   │   └── index.ts              # Equipment exports
│   │   │   │   ├── fishing-techniques/
│   │   │   │   │   ├── fishing-techniques.native.ts # Native teknik servisi
│   │   │   │   │   ├── fishing-techniques.web.ts    # Web teknik servisi
│   │   │   │   │   └── index.ts              # Techniques exports
│   │   │   │   ├── follow/
│   │   │   │   │   ├── follow.native.ts      # Instagram benzeri takip servisi
│   │   │   │   │   └── index.ts              # Follow exports
│   │   │   │   ├── image/
│   │   │   │   │   ├── image.native.ts       # Native görsel servisi
│   │   │   │   │   ├── image.web.ts          # Web görsel servisi
│   │   │   │   │   ├── image-crop.native.ts  # Görsel kırpma servisi
│   │   │   │   │   └── index.ts              # Image exports
│   │   │   │   ├── likes/
│   │   │   │   │   ├── likes.native.ts       # Beğeni servisi
│   │   │   │   │   └── index.ts              # Likes exports
│   │   │   │   ├── posts/
│   │   │   │   │   ├── posts.native.ts       # Native post servisi, harita optimizasyonu
│   │   │   │   │   ├── posts.web.ts          # Web post servisi
│   │   │   │   │   └── index.ts              # Posts exports
│   │   │   │   ├── qr-code/
│   │   │   │   │   ├── qr-code.native.ts     # Native QR kod servisi
│   │   │   │   │   ├── qr-code.web.ts        # Web QR kod servisi
│   │   │   │   │   ├── qr-code.types.ts      # QR kod tipleri
│   │   │   │   │   └── index.ts              # QR exports
│   │   │   │   ├── referral/
│   │   │   │   │   ├── referral.native.ts    # Native referans servisi
│   │   │   │   │   ├── referral.web.ts       # Web referans servisi
│   │   │   │   │   ├── types.ts              # Referral tipleri
│   │   │   │   │   └── index.ts              # Referral exports
│   │   │   │   ├── reports/
│   │   │   │   │   ├── reports.native.ts     # Şikayet servisi
│   │   │   │   │   └── index.ts              # Reports exports
│   │   │   │   ├── species/
│   │   │   │   │   ├── species.native.ts     # Native balık türleri servisi
│   │   │   │   │   ├── species.web.ts        # Web balık türleri servisi
│   │   │   │   │   ├── types.ts              # Species tipleri
│   │   │   │   │   └── index.ts              # Species exports
│   │   │   │   ├── spots/
│   │   │   │   │   ├── spots.native.ts       # Native lokasyon servisi
│   │   │   │   │   ├── spots.web.ts          # Web lokasyon servisi
│   │   │   │   │   └── index.ts              # Spots exports
│   │   │   │   ├── user/
│   │   │   │   │   ├── user.native.ts        # Native kullanıcı servisi
│   │   │   │   │   ├── user.web.ts           # Web kullanıcı servisi
│   │   │   │   │   └── index.ts              # User exports
│   │   │   │   ├── waitlist/
│   │   │   │   │   ├── waitlist.web.ts       # Bekleme listesi servisi
│   │   │   │   │   ├── types.ts              # Waitlist tipleri
│   │   │   │   │   └── index.ts              # Waitlist exports
│   │   │   │   ├── weather/
│   │   │   │   │   ├── weather.native.ts     # Native hava durumu implementasyonu
│   │   │   │   │   ├── weather-service.ts    # Ana hava durumu servisi
│   │   │   │   │   ├── weather-service-v2.ts # Yeni versiyon
│   │   │   │   │   ├── cache.native.ts       # AsyncStorage önbellek
│   │   │   │   │   ├── cache-layer.ts        # Önbellek katmanı
│   │   │   │   │   ├── provider-manager.ts   # Provider yönetimi
│   │   │   │   │   ├── retry.ts              # Yeniden deneme mantığı
│   │   │   │   │   ├── errors.ts             # Hata yönetimi
│   │   │   │   │   ├── types.ts              # Tip tanımları
│   │   │   │   │   ├── schemas.ts            # Zod şemaları
│   │   │   │   │   ├── utils.ts              # Balıkçılık hesaplamaları
│   │   │   │   │   ├── providers/
│   │   │   │   │   │   ├── open-meteo.ts     # Ana provider (ücretsiz)
│   │   │   │   │   │   ├── nws.ts            # ABD resmi servisi
│   │   │   │   │   │   ├── ipgeolocation.ts  # Astronomi API
│   │   │   │   │   │   └── moon-phase-calculator.ts # Offline ay evresi
│   │   │   │   │   ├── README.md             # Detaylı dokümantasyon
│   │   │   │   │   └── index.ts              # Weather exports
│   │   │   │   ├── native.ts                 # Native servisler aggregator
│   │   │   │   └── index.ts                  # Ana exports
│   │   │   ├── migrations/                   # Database migrations
│   │   │   │   ├── create_species_community_data.sql
│   │   │   │   ├── create_species_follows_table.sql
│   │   │   │   ├── create_species_reviews_table.sql
│   │   │   │   └── update_species_reviews_table.sql
│   │   │   └── index.ts                      # Package main export
│   │   ├── package.json                      # API package config
│   │   └── tsconfig.json                     # TypeScript config
│   │
│   ├── types/                              # Type tanımlamaları paketi (@fishivo/types)
│   │   ├── src/                            # Types kaynak kodları
│   │   │   ├── models/                     # Database model tipleri
│   │   │   │   ├── comment.ts             # Yorum model tipleri
│   │   │   │   ├── fishing.ts             # Balıkçılık ilgili tipler
│   │   │   │   ├── post.ts                # Post model tipleri
│   │   │   │   ├── report.ts              # Şikayet sistem tipleri
│   │   │   │   ├── species.ts             # Balık türü tipleri
│   │   │   │   ├── spot.ts                # Lokasyon model tipleri
│   │   │   │   ├── user.ts                # Kullanıcı model tipleri
│   │   │   │   └── index.ts               # Model exports
│   │   │   ├── api/                        # API ilgili tipler
│   │   │   │   ├── email.ts               # Email servis tipleri
│   │   │   │   ├── follow.ts              # Takip sistem tipleri
│   │   │   │   ├── requests.ts            # API istek tipleri
│   │   │   │   ├── responses.ts           # API yanıt tipleri
│   │   │   │   └── index.ts               # API exports
│   │   │   ├── units.ts                   # Birim sistem tipleri (metric/imperial)
│   │   │   └── index.ts                   # Main type exports
│   │   ├── package.json                   # Types package config
│   │   └── tsconfig.json                  # TypeScript konfigürasyonu
│   │
│   ├── utils/                              # Yardımcı fonksiyonlar paketi (@fishivo/utils)
│   │   ├── src/                            # Utils kaynak kodları
│   │   │   ├── array-sanitizer.ts         # Array temizleme ve doğrulama
│   │   │   ├── cloudflare-r2.ts           # Cloudflare R2 storage helper'ları
│   │   │   ├── cn.ts                      # className birleştirici (Tailwind + clsx)
│   │   │   ├── conservation-status.ts     # Koruma durumu hesaplamaları
│   │   │   ├── constants.ts               # Uygulama geneli sabitler
│   │   │   ├── date.ts                    # Tarih/saat format fonksiyonları
│   │   │   ├── image-proxy.ts             # Görsel proxy URL oluşturucu
│   │   │   ├── location.ts                # Konum hesaplama fonksiyonları
│   │   │   ├── map-bounds.ts              # Harita sınır doğrulama ve koordinat utils
│   │   │   ├── map-clustering.ts          # Profesyonel harita kümeleme algoritmaları
│   │   │   ├── navigation.ts              # Denizcilik navigasyon hesaplamaları
│   │   │   ├── coordinates.ts             # Koordinat format dönüşümleri
│   │   │   ├── network.ts                 # Ağ bağlantı kontrol fonksiyonları
│   │   │   ├── seo.ts                     # SEO meta tag helper'ları
│   │   │   ├── string.ts                  # String manipülasyon fonksiyonları
│   │   │   ├── username-validator.ts      # Kullanıcı adı doğrulama kuralları
│   │   │   ├── validation.ts              # Form doğrulama fonksiyonları
│   │   │   ├── weather.ts                 # Hava durumu hesaplamaları
│   │   │   └── index.ts                   # Main utils exports
│   │   ├── package.json                   # Utils package config
│   │   └── tsconfig.json                  # TypeScript konfigürasyonu
│   │
│   ├── hooks/                              # Paylaşılan React hooks paketi (@fishivo/hooks)
│   │   ├── src/                            # Hooks kaynak kodları
│   │   │   ├── native/                     # Native-specific hooks
│   │   │   │   ├── useUnits.ts            # Birim tercihi yönetimi (kg/lb)
│   │   │   │   ├── useMapCatches.tsx      # Harita kümeleme ve cache hook'u
│   │   │   │   └── index.ts                  # Native hooks exports
│   │   │   ├── web/                          # Web-specific hooks (şu an boş)
│   │   │   └── index.ts                      # Main exports
│   │   ├── package.json                      # Hooks package config
│   │   └── tsconfig.json                     # TypeScript config
│   │
│   └── ui/                                  # Cross-platform UI paketi (@fishivo/ui)
│       ├── src/                            # UI kaynak kodları
│       │   └── components/                 # Paylaşılan UI componentleri
│       │       └── Rating/                 # Rating komponenti
│       │           ├── Rating.native.tsx   # Native rating implementasyonu
│       │           ├── Rating.web.tsx      # Web rating implementasyonu
│       │           ├── types.ts            # Rating component tipleri
│       │           ├── index.native.ts     # Native platform export
│       │           ├── index.web.ts        # Web platform export
│       │           └── index.ts            # Main Rating export
│       ├── package.json                    # UI package config
│       └── tsconfig.json                   # TypeScript konfigürasyonu
│
└── node_modules/                           # Tüm npm/yarn dependencies (gitignore)
```