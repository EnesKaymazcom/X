# Fishivo Complete File Tree - Detaylı Proje Yapısı

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
│
├── scripts/                                  # Proje utility scriptleri
│   ├── clean-comments.sh                    # Tüm kodlardan yorum temizleme bash scripti
│   ├── create-test-users.sql                # Test kullanıcıları oluşturma SQL scripti
│   └── remove-comments.js                   # JavaScript yorum temizleme Node scripti
│
├── apps/                                     # Uygulama workspace'leri
│   ├── web/                                  # Next.js 15 Web Uygulaması (@fishivo/web)
│   │   ├── src/                              # Web kaynak kod dizini
│   │   │   ├── app/                          # Next.js 15 App Router dizini
│   │   │   │   ├── [locale]/                 # i18n dinamik route (tr/en)
│   │   │   │   │   ├── layout.tsx            # Locale-specific layout wrapper
│   │   │   │   │   └── page.tsx              # Ana sayfa komponenti
│   │   │   │   ├── api/                      # Next.js API route handlers
│   │   │   │   │   ├── contact/              # İletişim form endpoint'i
│   │   │   │   │   │   └── route.ts          # POST /api/contact handler
│   │   │   │   │   └── email/                # Email servis endpoint'leri
│   │   │   │   │       └── test/             # Email test endpoint'i
│   │   │   │   │           └── route.ts      # POST /api/email/test handler
│   │   │   │   ├── auth/                     # Supabase auth callback routes
│   │   │   │   │   └── callback/             # OAuth callback endpoint
│   │   │   │   │       └── route.ts          # Auth callback handler
│   │   │   │   ├── globals.css               # Global CSS stilleri, Tailwind directives
│   │   │   │   ├── layout.tsx                # Root layout, HTML yapısı
│   │   │   │   ├── not-found.tsx             # 404 hata sayfası
│   │   │   │   ├── error.tsx                 # Error boundary sayfası
│   │   │   │   └── providers.tsx             # React context providers
│   │   │   ├── components/                   # Web-specific React componentleri
│   │   │   │   ├── admin/                    # Admin panel componentleri
│   │   │   │   │   ├── admin-dashboard.tsx   # Admin ana panel
│   │   │   │   │   ├── admin-sidebar.tsx     # Admin yan menü
│   │   │   │   │   ├── admin-stats.tsx       # İstatistik kartları
│   │   │   │   │   └── modal-footer.tsx      # Modal footer komponenti
│   │   │   │   ├── auth/                     # Authentication componentleri
│   │   │   │   │   ├── auth-status.tsx       # Kullanıcı auth durumu gösterimi
│   │   │   │   │   └── auth-status-wrapper.tsx # Auth durumu wrapper
│   │   │   │   ├── consent/                  # KVKK/GDPR onay componentleri
│   │   │   │   │   └── kvkk-consent-banner.tsx # KVKK onay banner'ı
│   │   │   │   ├── icons/                    # SVG icon componentleri
│   │   │   │   │   ├── google-icon.tsx       # Google logo SVG
│   │   │   │   │   └── x-icon.tsx            # X (Twitter) logo SVG
│   │   │   │   ├── ui/                       # Shadcn/ui componentleri (50+ component)
│   │   │   │   │   ├── accordion.tsx         # Açılır/kapanır içerik
│   │   │   │   │   ├── alert.tsx             # Uyarı mesajı komponenti
│   │   │   │   │   ├── alert-dialog.tsx      # Onay dialog'u
│   │   │   │   │   ├── aspect-ratio.tsx      # En-boy oranı wrapper
│   │   │   │   │   ├── avatar.tsx            # Kullanıcı avatarı
│   │   │   │   │   ├── badge.tsx             # Etiket/rozet komponenti
│   │   │   │   │   ├── breadcrumb.tsx        # Sayfa yolu navigasyonu
│   │   │   │   │   ├── button.tsx            # Temel button komponenti
│   │   │   │   │   ├── calendar.tsx          # Takvim komponenti
│   │   │   │   │   ├── card.tsx              # Kart container'ı
│   │   │   │   │   ├── carousel.tsx          # Resim/içerik carousel
│   │   │   │   │   ├── checkbox.tsx          # Checkbox input
│   │   │   │   │   ├── collapsible.tsx       # Açılır/kapanır bölüm
│   │   │   │   │   ├── command.tsx           # Command palette
│   │   │   │   │   ├── context-menu.tsx      # Sağ tık menüsü
│   │   │   │   │   ├── dialog.tsx            # Modal dialog
│   │   │   │   │   ├── drawer.tsx            # Yan çekmece
│   │   │   │   │   ├── dropdown-menu.tsx     # Açılır menü
│   │   │   │   │   ├── form.tsx              # Form wrapper
│   │   │   │   │   ├── hover-card.tsx        # Hover ile açılan kart
│   │   │   │   │   ├── input.tsx             # Text input komponenti
│   │   │   │   │   ├── label.tsx             # Form label
│   │   │   │   │   ├── menubar.tsx           # Üst menü bar'ı
│   │   │   │   │   ├── navigation-menu.tsx   # Ana navigasyon menüsü
│   │   │   │   │   ├── navbar.tsx            # Site navigation bar
│   │   │   │   │   ├── footer.tsx            # Site footer'ı
│   │   │   │   │   ├── pagination.tsx        # Sayfalama komponenti
│   │   │   │   │   ├── popover.tsx           # Popover içerik
│   │   │   │   │   ├── progress.tsx          # İlerleme çubuğu
│   │   │   │   │   ├── radio-group.tsx       # Radio button grubu
│   │   │   │   │   ├── resizable.tsx         # Boyutlandırılabilir panel
│   │   │   │   │   ├── scroll-area.tsx       # Custom scroll alanı
│   │   │   │   │   ├── select.tsx            # Dropdown select
│   │   │   │   │   ├── separator.tsx         # Ayırıcı çizgi
│   │   │   │   │   ├── sheet.tsx             # Bottom/side sheet
│   │   │   │   │   ├── skeleton.tsx          # Loading skeleton
│   │   │   │   │   ├── slider.tsx            # Slider/range input
│   │   │   │   │   ├── sonner.tsx            # Toast notification
│   │   │   │   │   ├── switch.tsx            # Toggle switch
│   │   │   │   │   ├── table.tsx             # Tablo komponenti
│   │   │   │   │   ├── tabs.tsx              # Tab komponenti
│   │   │   │   │   ├── textarea.tsx          # Çok satırlı text input
│   │   │   │   │   ├── toast.tsx             # Toast mesajları
│   │   │   │   │   ├── toaster.tsx           # Toast container
│   │   │   │   │   ├── toggle.tsx            # Toggle button
│   │   │   │   │   ├── toggle-group.tsx      # Toggle button grubu
│   │   │   │   │   ├── tooltip.tsx           # Tooltip komponenti
│   │   │   │   │   └── use-toast.ts          # Toast hook'u
│   │   │   │   ├── widgets/                  # Özel widget componentleri
│   │   │   │   │   ├── CurrentWeather.tsx    # Anlık hava durumu widget'ı
│   │   │   │   │   ├── Map.tsx               # Web harita komponenti
│   │   │   │   │   ├── SpotMap.tsx           # Balıkçılık noktaları haritası
│   │   │   │   │   └── WeatherWidgets.tsx    # Hava durumu widget koleksiyonu
│   │   │   │   └── error-boundary.tsx        # React error boundary wrapper
│   │   │   ├── hooks/                        # Web-specific custom hooks
│   │   │   │   ├── use-consent.ts            # KVKK onay durumu hook'u
│   │   │   │   └── use-rate-limiter.ts       # API rate limiting hook'u
│   │   │   ├── lib/                          # Web utility fonksiyonları
│   │   │   │   ├── admin-check.ts            # Admin yetkisi kontrol fonksiyonu
│   │   │   │   ├── cloudflare-upload.ts      # Cloudflare R2 upload helper
│   │   │   │   ├── consent/                  # KVKK/GDPR yönetimi
│   │   │   │   │   └── consent-manager.ts    # Onay yönetim servisi
│   │   │   │   ├── i18n/                     # Çoklu dil desteği
│   │   │   │   │   ├── config.ts             # i18n konfigürasyonu
│   │   │   │   │   ├── context.tsx           # i18n React context
│   │   │   │   │   ├── middleware.ts         # i18n route middleware
│   │   │   │   │   └── server.ts             # Server-side i18n helper
│   │   │   │   ├── image-protection.ts       # Görsel koruma fonksiyonları
│   │   │   │   ├── r2-image-helper.ts        # R2 görsel yönetim helper'ı
│   │   │   │   └── utils.ts                  # Genel utility fonksiyonları
│   │   │   ├── middleware.ts                 # Next.js global middleware
│   │   │   ├── providers/                    # React context providers
│   │   │   │   └── consent-provider.tsx      # KVKK onay context provider
│   │   │   └── styles/                       # Ek CSS dosyaları
│   │   │       └── image-protection.css      # Görsel koruma stilleri
│   │   ├── public/                           # Statik dosyalar (doğrudan sunulur)
│   │   │   ├── icons/                        # Hava durumu ikonları (100+ SVG)
│   │   │   │   ├── 01d.svg                   # Güneşli gündüz ikonu
│   │   │   │   ├── 01n.svg                   # Açık gece ikonu
│   │   │   │   ├── 02d.svg                   # Az bulutlu gündüz
│   │   │   │   ├── 02n.svg                   # Az bulutlu gece
│   │   │   │   └── ...                       # 100+ hava durumu ikonu
│   │   │   ├── social/                       # Sosyal medya ikonları
│   │   │   │   ├── facebook.svg              # Facebook ikonu
│   │   │   │   ├── instagram.svg             # Instagram ikonu
│   │   │   │   └── twitter.svg               # Twitter/X ikonu
│   │   │   ├── fishivo.svg                   # Ana logo SVG
│   │   │   └── favicon.ico                   # Browser favicon
│   │   ├── .env                              # Public environment variables
│   │   ├── .env.example                      # Örnek env dosyası
│   │   ├── components.json                   # Shadcn/ui konfigürasyonu
│   │   ├── next.config.js                    # Next.js konfigürasyonu
│   │   ├── postcss.config.js                 # PostCSS konfigürasyonu
│   │   ├── tailwind.config.js                # Tailwind CSS konfigürasyonu
│   │   ├── tsconfig.json                     # TypeScript konfigürasyonu
│   │   └── package.json                      # Web app dependencies
│   │
│   └── native/                               # React Native 0.78.2 Mobil App (@fishivo/mobile)
│       ├── src/                              # Native kaynak kod dizini
│       │   ├── App.tsx                      # Ana uygulama komponenti, provider setup
│       │   ├── screens/                     # Tüm uygulama ekranları (35+ screen)
│       │   │   ├── AccountInfoScreen.tsx    # Hesap bilgileri ekranı
│       │   │   ├── AddCatchScreen.tsx       # Yeni yakalama ekleme formu
│       │   │   ├── AppInfoScreen.tsx        # Uygulama hakkında bilgi
│       │   │   ├── AuthScreen.tsx           # Giriş ve kayıt ekranı
│       │   │   ├── BlockedUsersScreen.tsx   # Engellenen kullanıcılar listesi
│       │   │   ├── CatchDetailsScreen.tsx   # Yakalama detay sayfası
│       │   │   ├── CommentsScreen.tsx       # Yorumlar ekranı
│       │   │   ├── ContactsScreen.tsx       # Kişiler/arkadaşlar listesi
│       │   │   ├── DeleteAccountScreen.tsx  # Hesap silme onay ekranı
│       │   │   ├── EditProfileScreen.tsx    # Profil düzenleme formu
│       │   │   ├── FishDetailScreen.tsx     # Balık türü detay sayfası
│       │   │   ├── FollowersScreen.tsx      # Takipçiler listesi
│       │   │   ├── FollowingScreen.tsx      # Takip edilenler listesi
│       │   │   ├── FriendsScreen.tsx        # Arkadaş listesi
│       │   │   ├── HomeScreen.tsx           # Ana sayfa feed'i
│       │   │   ├── MapScreen.tsx            # Harita ekranı (clustering + layers)
│       │   │   ├── MyEquipmentScreen.tsx    # Kullanıcı ekipman listesi
│       │   │   ├── MyFishingTechniquesScreen.tsx # Balıkçılık teknikleri
│       │   │   ├── MySpotsScreen.tsx        # Kullanıcı lokasyonları
│       │   │   ├── NotificationsScreen.tsx  # Bildirimler ekranı
│       │   │   ├── PermissionsScreen.tsx    # Uygulama izinleri yönetimi
│       │   │   ├── PhoneVerificationScreen.tsx # Telefon doğrulama
│       │   │   ├── PostPreviewScreen.tsx    # Post önizleme ekranı
│       │   │   ├── PrivacyScreen.tsx        # Gizlilik ayarları
│       │   │   ├── ProfileScreen.tsx        # Kullanıcı profil sayfası
│       │   │   ├── RecentCatchesScreen.tsx  # Son yakalamalar listesi
│       │   │   ├── SecurityScreen.tsx       # Güvenlik ayarları
│       │   │   ├── SettingsScreen.tsx       # Genel ayarlar
│       │   │   ├── SpeciesDetailScreen.tsx  # Balık türü detayları
│       │   │   ├── SpeciesSearchScreen.tsx  # Balık türü arama
│       │   │   ├── SpotDetailScreen.tsx     # Lokasyon detayları
│       │   │   ├── SupportScreen.tsx        # Destek/yardım ekranı
│       │   │   ├── TermsOfServiceScreen.tsx # Kullanım koşulları
│       │   │   ├── TournamentScreen.tsx     # Turnuva ekranı
│       │   │   ├── UpdateEmailScreen.tsx    # Email güncelleme
│       │   │   ├── UpdatePasswordScreen.tsx # Şifre değiştirme
│       │   │   ├── UploadScreen.tsx         # Dosya yükleme ekranı
│       │   │   └── WeatherScreen.tsx        # Hava durumu detayları
│       │   ├── components/                  # Yeniden kullanılabilir componentler
│       │   │   ├── comments/                # Yorum sistemi componentleri
│       │   │   │   ├── CommentSection.tsx   # Yorum bölümü container'ı
│       │   │   │   ├── CommentInput.tsx     # Yorum yazma input'u
│       │   │   │   ├── CommentItem.tsx      # Tekil yorum komponenti
│       │   │   │   ├── CommentLikeSystem.tsx # Yorum beğeni sistemi
│       │   │   │   └── CommentList.tsx      # Yorum listesi container'ı
│       │   │   ├── fish/                    # Balık detay tab componentleri
│       │   │   │   ├── FishCatchesTab.tsx   # Yakalama kayıtları tab'ı
│       │   │   │   ├── FishDisciplinesTab.tsx # Teknikler tab'ı
│       │   │   │   └── FishTopGearTab.tsx   # Popüler ekipmanlar tab'ı
│       │   │   ├── profile/                 # Profil tab componentleri
│       │   │   │   ├── ProfileCatchesTab.tsx # Profil yakalamalar tab'ı
│       │   │   │   └── ProfileSpotsTab.tsx  # Profil lokasyonlar tab'ı
│       │   │   └── ui/                      # Genel UI componentleri (60+ component)
│       │   │       ├── maps/                # Harita sistemi componentleri
│       │   │       │   ├── UniversalMapView.tsx # Multi-provider harita wrapper
│       │   │       │   ├── MapComponent.tsx # Legacy harita komponenti
│       │   │       │   ├── WeatherMapComponent.tsx # Hava durumu harita overlay
│       │   │       │   ├── LocationMapSelector.tsx # Lokasyon seçici harita
│       │   │       │   ├── LinearCompass.tsx # Smooth animasyonlu pusula
│       │   │       │   ├── types.ts         # Harita tip tanımlamaları
│       │   │       │   ├── providers/       # Harita provider implementasyonları
│       │   │       │   │   ├── MapLibreProvider.tsx # MapLibre GL provider
│       │   │       │   │   ├── MapboxProvider.tsx # Mapbox 3D provider
│       │   │       │   │   └── types.ts     # Provider tipleri
│       │   │       │   └── layers/          # Harita katman sistemi
│       │   │       │       ├── LayerSelector.tsx # Katman seçici UI
│       │   │       │       ├── layerDefinitions.ts # Katman tanımları
│       │   │       │       └── types.ts     # Katman tipleri
│       │   │       ├── AddButton.tsx        # Yüzen ekleme butonu
│       │   │       ├── AppHeader.tsx        # Uygulama üst başlığı
│       │   │       ├── Avatar.tsx           # Kullanıcı profil resmi
│       │   │       ├── Button.tsx           # Temel button komponenti
│       │   │       ├── CatchCard.tsx        # Yakalama kart komponenti
│       │   │       ├── CatchFilters.tsx     # Yakalama filtreleme UI
│       │   │       ├── CollapsibleSection.tsx # Açılır/kapanır bölüm
│       │   │       ├── DateTimePicker.tsx   # Tarih ve saat seçici
│       │   │       ├── DisciplineSelector.tsx # Teknik seçici
│       │   │       ├── EditButton.tsx       # Düzenleme butonu
│       │   │       ├── EquipmentSelector.tsx # Ekipman seçici
│       │   │       ├── FishivoModal.tsx     # Özel modal komponenti
│       │   │       ├── FloatingActionMenu.tsx # Yüzen aksiyon menüsü
│       │   │       ├── FollowButton.tsx     # Takip et/bırak butonu
│       │   │       ├── ImageCarousel.tsx    # Resim galerisi
│       │   │       ├── ImagePickerModal.tsx # Resim seçme modal'ı
│       │   │       ├── ImageUploader.tsx    # Resim yükleme komponenti
│       │   │       ├── ImageViewerModal.tsx # Tam ekran resim görüntüleyici
│       │   │       ├── Input.tsx            # Text input komponenti
│       │   │       ├── LikeSystem.tsx       # Post beğeni sistemi
│       │   │       ├── ListEmptyComponent.tsx # Boş liste mesajı
│       │   │       ├── LoadingSpinner.tsx   # Yükleme animasyonu
│       │   │       ├── LocationInfoCard.tsx # Konum bilgi kartı
│       │   │       ├── LocationPermissionCard.tsx # Konum izni kartı
│       │   │       ├── MiniCatchCard.tsx    # Küçük yakalama kartı
│       │   │       ├── Modal.tsx            # Genel modal wrapper
│       │   │       ├── OldMapComponent.tsx  # Eski harita (deprecated)
│       │   │       ├── PhotoGrid.tsx        # Fotoğraf grid görünümü
│       │   │       ├── PostDetailsModal.tsx # Post detay modal'ı
│       │   │       ├── ProfileCard.tsx      # Kullanıcı profil kartı
│       │   │       ├── ProfileHeader.tsx    # Profil başlık bölümü
│       │   │       ├── ProfileStats.tsx     # Profil istatistikleri
│       │   │       ├── QRScanner.tsx        # QR kod okuyucu
│       │   │       ├── RefreshControl.tsx   # Pull-to-refresh kontrolü
│       │   │       ├── SearchBar.tsx        # Arama çubuğu
│       │   │       ├── ShareButton.tsx      # Paylaşım butonu
│       │   │       ├── SpeciesCard.tsx      # Balık türü kartı
│       │   │       ├── SpeciesInfoCard.tsx  # Balık türü bilgi kartı
│       │   │       ├── SpeciesSelector.tsx  # Balık türü seçici
│       │   │       ├── SpotCard.tsx         # Lokasyon kartı
│       │   │       ├── SpotDetailsCard.tsx  # Lokasyon detay kartı
│       │   │       ├── TabView.tsx          # Tab görünüm komponenti
│       │   │       ├── TextArea.tsx         # Çok satırlı metin girişi
│       │   │       ├── TimePicker.tsx       # Saat seçici
│       │   │       ├── TournamentCard.tsx   # Turnuva kartı
│       │   │       ├── UnitToggle.tsx       # Birim değiştirici (kg/lb)
│       │   │       ├── UserCard.tsx         # Kullanıcı kartı
│       │   │       ├── WeatherCard.tsx      # Hava durumu kartı
│       │   │       ├── WeatherChart.tsx     # Hava durumu grafiği
│       │   │       └── WeatherDetailsCard.tsx # Detaylı hava durumu
│       │   ├── hooks/                       # Custom React hooks
│       │   │   ├── useCommentLikeSystem.ts  # Yorum beğeni yönetimi
│       │   │   ├── useCommentReportModal.tsx # Yorum şikayet modal'ı
│       │   │   ├── useContacts.ts           # Kişi listesi yönetimi
│       │   │   ├── useFollow.ts             # Takip sistemi hook'u
│       │   │   ├── useFriends.ts            # Arkadaş listesi yönetimi
│       │   │   ├── useLikeSystem.ts         # Post beğeni yönetimi
│       │   │   ├── useLocation.ts           # Legacy konum hook'u
│       │   │   ├── useMapCatches.tsx        # Harita clustering hook'u
│       │   │   ├── useReportModal.tsx       # Şikayet modal yönetimi
│       │   │   ├── useStickyTabs.ts         # Yapışkan tab yönetimi
│       │   │   └── useSupabaseUser.ts       # Supabase kullanıcı hook'u
│       │   ├── stores/                      # Zustand global state yönetimi
│       │   │   ├── followStore.ts           # Takip durumu global store
│       │   │   ├── locationStore.ts         # Merkezi konum yönetimi
│       │   │   └── mapCacheStore.ts         # Harita cache yönetimi
│       │   ├── navigation/                  # React Navigation yapısı
│       │   │   ├── AppNavigator.tsx         # Ana stack navigator
│       │   │   ├── TabNavigator.tsx         # Alt tab navigator
│       │   │   └── types.ts                 # Navigation tip tanımları
│       │   ├── contexts/                    # React Context API
│       │   │   ├── LanguageContext.tsx      # Dil yönetimi context'i
│       │   │   └── ThemeContext.tsx         # Tema yönetimi context'i
│       │   ├── lib/                         # Library fonksiyonları
│       │   │   └── i18n/                    # Çoklu dil desteği
│       │   │       ├── config.ts            # i18n konfigürasyonu
│       │   │       └── i18n.ts              # i18n başlatma
│       │   ├── storage/                     # Yerel depolama
│       │   │   └── MobileStorage.ts         # AsyncStorage wrapper
│       │   ├── assets/                      # Statik varlıklar
│       │   │   ├── default-avatar.png       # Varsayılan profil resmi
│       │   │   └── images/                  # Uygulama görselleri
│       │   │       └── map-layers/          # Harita katman önizlemeleri
│       │   │           └── marine/          # Denizcilik katmanları
│       │   │               └── openseamap.png # OpenSeaMap önizleme
│       │   ├── data/                        # Statik veri dosyaları
│       │   │   └── countriesWithPhoneCodes.ts # Ülke ve telefon kodları
│       │   ├── config/                      # Uygulama konfigürasyonu
│       │   │   └── index.ts                 # API URL'leri ve sabitler
│       │   ├── types/                       # TypeScript tip tanımları
│       │   │   ├── global.d.ts              # Global tipler
│       │   │   └── navigation.ts            # Navigation tipleri
│       │   ├── utils/                       # Yardımcı fonksiyonlar
│       │   │   ├── conservation-status.ts   # Koruma durumu hesaplamaları
│       │   │   ├── contacts.ts              # Kişi yönetimi yardımcıları
│       │   │   ├── feeding-types.ts         # Beslenme tipleri
│       │   │   ├── fish-habitats.ts         # Balık yaşam alanları
│       │   │   ├── LocationService.ts       # Legacy konum servisi
│       │   │   └── map-cache-manager.ts     # Harita önbellek yönetimi
│       │   └── theme.ts                     # Tema tanımlamaları
│       ├── android/                         # Android native kod
│       │   ├── app/                         # Android app modülü
│       │   │   ├── build.gradle             # App level Gradle config
│       │   │   ├── proguard-rules.pro       # ProGuard obfuscation kuralları
│       │   │   ├── src/                     # Android kaynak dosyaları
│       │   │   │   └── main/                # Main source set
│       │   │   │       ├── AndroidManifest.xml # Android manifest
│       │   │   │       ├── assets/          # Android assets
│       │   │   │       ├── java/            # Java/Kotlin kod
│       │   │   │       │   └── com/fishivo/ # Package dizini
│       │   │   │       └── res/             # Android resources
│       │   │   │           ├── drawable/    # Drawable varlıklar
│       │   │   │           ├── drawable-mdpi/ # Medium DPI icons
│       │   │   │           ├── drawable-xhdpi/ # Extra high DPI
│       │   │   │           ├── drawable-xxhdpi/ # XX high DPI
│       │   │   │           ├── drawable-xxxhdpi/ # XXX high DPI
│       │   │   │           ├── layout/      # Layout XML dosyaları
│       │   │   │           ├── mipmap-hdpi/ # High DPI launcher icon
│       │   │   │           ├── mipmap-mdpi/ # Medium DPI launcher
│       │   │   │           ├── mipmap-xhdpi/ # XHigh DPI launcher
│       │   │   │           ├── mipmap-xxhdpi/ # XXHigh DPI launcher
│       │   │   │           ├── mipmap-xxxhdpi/ # XXXHigh DPI launcher
│       │   │   │           └── values/      # String, color, style resources
│       │   │   │               ├── colors.xml # Renk tanımlamaları
│       │   │   │               ├── strings.xml # String kaynakları
│       │   │   │               └── styles.xml # Stil tanımlamaları
│       │   │   └── keystore.properties.example # Keystore config örneği
│       │   ├── build.gradle                 # Project level Gradle config
│       │   ├── gradle.properties            # Gradle özellikleri
│       │   ├── gradlew                      # Gradle wrapper script (Unix)
│       │   ├── gradlew.bat                  # Gradle wrapper script (Windows)
│       │   ├── settings.gradle              # Gradle proje ayarları
│       │   └── gradle/                      # Gradle wrapper dosyaları
│       │       └── wrapper/                 # Wrapper konfigürasyonu
│       │           ├── gradle-wrapper.jar   # Wrapper JAR
│       │           └── gradle-wrapper.properties # Wrapper config
│       ├── ios/                             # iOS native kod
│       │   ├── Fishivo.xcodeproj/           # Xcode proje dosyası
│       │   │   └── project.pbxproj          # Xcode proje konfigürasyonu
│       │   ├── Fishivo.xcworkspace/         # CocoaPods workspace
│       │   │   └── contents.xcworkspacedata # Workspace konfigürasyonu
│       │   ├── Fishivo/                     # iOS app kaynak kodları
│       │   │   ├── AppDelegate.h            # App delegate header
│       │   │   ├── AppDelegate.mm           # App delegate implementation
│       │   │   ├── Info.plist               # iOS app konfigürasyonu
│       │   │   ├── main.m                   # iOS main entry point
│       │   │   ├── LaunchScreen.storyboard  # Splash screen
│       │   │   └── Images.xcassets/         # iOS görsel varlıklar
│       │   │       ├── AppIcon.appiconset/  # App icon set
│       │   │       └── Contents.json        # Asset catalog manifest
│       │   ├── FishivoTests/                # iOS unit testleri
│       │   │   └── FishivoTests.m          # Test dosyası
│       │   ├── Podfile                      # CocoaPods dependencies
│       │   └── Podfile.lock                 # CocoaPods lock dosyası
│       ├── GUVENLIK_AYARLARI.md            # Android güvenlik dokümantasyonu
│       ├── .env                            # Native environment variables
│       ├── .env.example                    # Environment örnek dosyası
│       ├── app.json                        # React Native app config
│       ├── babel.config.js                 # Babel transpiler config
│       ├── index.js                        # App entry point
│       ├── jest.config.js                  # Jest test konfigürasyonu
│       ├── metro.config.js                 # Metro bundler config
│       ├── react-native.config.js          # React Native platform config
│       ├── tsconfig.json                   # TypeScript konfigürasyonu
│       └── package.json                    # Native app dependencies
│
├── packages/                                # Paylaşılan workspace paketleri
│   ├── api/                                # API servisleri paketi (@fishivo/api)
│   │   ├── src/                            # API kaynak kodları
│   │   │   ├── client/                     # Supabase client'ları
│   │   │   │   ├── supabase.native.ts      # React Native Supabase client
│   │   │   │   ├── supabase.server.ts      # Next.js SSR Supabase client
│   │   │   │   └── supabase.web.ts         # Next.js browser Supabase client
│   │   │   ├── services/                   # API servis katmanları
│   │   │   │   ├── comments/               # Yorum sistemi servisleri
│   │   │   │   │   ├── comments.native.ts  # Native yorum CRUD
│   │   │   │   │   ├── comment-likes.native.ts # Yorum beğeni servisi
│   │   │   │   │   └── index.ts            # Comments exports
│   │   │   │   ├── contacts/               # Kişi yönetimi servisleri
│   │   │   │   │   ├── contacts.native.ts  # Native kişi servisi
│   │   │   │   │   ├── contacts.web.ts     # Web kişi servisi
│   │   │   │   │   ├── types.ts            # Contact tip tanımları
│   │   │   │   │   └── index.ts            # Contacts exports
│   │   │   │   ├── email/                  # Email servisleri
│   │   │   │   │   ├── email.web.ts        # Nodemailer SMTP servisi
│   │   │   │   │   ├── email.native.ts     # Native HTTP email client
│   │   │   │   │   ├── config.ts           # Email konfigürasyonu
│   │   │   │   │   ├── templates/          # Email şablonları
│   │   │   │   │   │   ├── en/             # İngilizce şablonlar
│   │   │   │   │   │   │   ├── baseTemplate.ts # Temel şablon
│   │   │   │   │   │   │   ├── contactConfirmation.ts # İletişim onayı
│   │   │   │   │   │   │   ├── contactNotification.ts # İletişim bildirimi
│   │   │   │   │   │   │   ├── emailVerification.ts # Email doğrulama
│   │   │   │   │   │   │   └── index.ts    # EN exports
│   │   │   │   │   │   ├── tr/             # Türkçe şablonlar
│   │   │   │   │   │   │   ├── baseTemplate.ts # Temel şablon
│   │   │   │   │   │   │   ├── contactConfirmation.ts # İletişim onayı
│   │   │   │   │   │   │   ├── contactNotification.ts # İletişim bildirimi
│   │   │   │   │   │   │   ├── emailVerification.ts # Email doğrulama
│   │   │   │   │   │   │   └── index.ts    # TR exports
│   │   │   │   │   │   ├── index.ts        # Templates exports
│   │   │   │   │   │   └── baseTemplateEngine.ts # Şablon motoru
│   │   │   │   │   └── index.ts            # Email exports
│   │   │   │   ├── equipment/              # Ekipman yönetimi
│   │   │   │   │   ├── equipment.native.ts # Native ekipman servisi
│   │   │   │   │   ├── equipment.web.ts    # Web ekipman servisi
│   │   │   │   │   └── index.ts            # Equipment exports
│   │   │   │   ├── fishing-techniques/     # Balıkçılık teknikleri
│   │   │   │   │   ├── fishing-techniques.native.ts # Native teknik servisi
│   │   │   │   │   ├── fishing-techniques.web.ts # Web teknik servisi
│   │   │   │   │   └── index.ts            # Techniques exports
│   │   │   │   ├── follow/                 # Takip sistemi
│   │   │   │   │   ├── follow.native.ts    # Instagram benzeri takip servisi
│   │   │   │   │   └── index.ts            # Follow exports
│   │   │   │   ├── image/                  # Görsel işleme
│   │   │   │   │   ├── image.native.ts     # Native görsel servisi
│   │   │   │   │   ├── image.web.ts        # Web görsel servisi
│   │   │   │   │   ├── image-crop.native.ts # Görsel kırpma servisi
│   │   │   │   │   └── index.ts            # Image exports
│   │   │   │   ├── likes/                  # Beğeni sistemi
│   │   │   │   │   ├── likes.native.ts     # Post beğeni servisi
│   │   │   │   │   └── index.ts            # Likes exports
│   │   │   │   ├── posts/                  # Post yönetimi
│   │   │   │   │   ├── posts.native.ts     # Native post servisi, harita optimizasyonu
│   │   │   │   │   ├── posts.web.ts        # Web post servisi
│   │   │   │   │   └── index.ts            # Posts exports
│   │   │   │   ├── qr-code/                # QR kod servisi
│   │   │   │   │   ├── qr-code.native.ts   # Native QR servisi
│   │   │   │   │   ├── qr-code.web.ts      # Web QR servisi
│   │   │   │   │   ├── qr-code.types.ts    # QR tipleri
│   │   │   │   │   └── index.ts            # QR exports
│   │   │   │   ├── referral/               # Referans sistemi
│   │   │   │   │   ├── referral.native.ts  # Native referans servisi
│   │   │   │   │   ├── referral.web.ts     # Web referans servisi
│   │   │   │   │   ├── types.ts            # Referans tipleri
│   │   │   │   │   └── index.ts            # Referral exports
│   │   │   │   ├── reports/                # Raporlama sistemi
│   │   │   │   │   ├── reports.native.ts   # Şikayet servisi
│   │   │   │   │   └── index.ts            # Reports exports
│   │   │   │   ├── species/                # Balık türleri
│   │   │   │   │   ├── species.native.ts   # Native tür servisi
│   │   │   │   │   ├── species.web.ts      # Web tür servisi
│   │   │   │   │   ├── types.ts            # Tür tipleri
│   │   │   │   │   └── index.ts            # Species exports
│   │   │   │   ├── spots/                  # Balıkçılık noktaları
│   │   │   │   │   ├── spots.native.ts     # Native lokasyon servisi
│   │   │   │   │   ├── spots.web.ts        # Web lokasyon servisi
│   │   │   │   │   └── index.ts            # Spots exports
│   │   │   │   ├── user/                   # Kullanıcı yönetimi
│   │   │   │   │   ├── user.native.ts      # Native kullanıcı servisi
│   │   │   │   │   ├── user.web.ts         # Web kullanıcı servisi
│   │   │   │   │   └── index.ts            # User exports
│   │   │   │   ├── waitlist/               # Bekleme listesi
│   │   │   │   │   ├── waitlist.web.ts     # Waitlist servisi
│   │   │   │   │   ├── types.ts            # Waitlist tipleri
│   │   │   │   │   └── index.ts            # Waitlist exports
│   │   │   │   ├── weather/                # Hava durumu servisi
│   │   │   │   │   ├── weather.native.ts   # Native hava durumu
│   │   │   │   │   ├── weather-service.ts  # Ana servis logic
│   │   │   │   │   ├── weather-service-v2.ts # Yeni versiyon
│   │   │   │   │   ├── cache.native.ts     # AsyncStorage cache
│   │   │   │   │   ├── cache-layer.ts      # Cache katmanı
│   │   │   │   │   ├── provider-manager.ts # Provider yönetimi
│   │   │   │   │   ├── retry.ts            # Retry logic
│   │   │   │   │   ├── errors.ts           # Error handling
│   │   │   │   │   ├── types.ts            # Type tanımları
│   │   │   │   │   ├── schemas.ts          # Zod schemas
│   │   │   │   │   ├── utils.ts            # Balıkçılık hesaplamaları
│   │   │   │   │   ├── providers/          # Hava durumu provider'ları
│   │   │   │   │   │   ├── open-meteo.ts   # Ana provider (ücretsiz)
│   │   │   │   │   │   ├── nws.ts          # ABD resmi servisi
│   │   │   │   │   │   ├── ipgeolocation.ts # Astronomi API
│   │   │   │   │   │   └── moon-phase-calculator.ts # Offline ay evresi
│   │   │   │   │   ├── README.md           # Detaylı dokümantasyon
│   │   │   │   │   └── index.ts            # Weather exports
│   │   │   │   ├── native.ts               # Native servisler aggregator
│   │   │   │   └── index.ts                # Ana API exports
│   │   │   ├── migrations/                 # Database migration dosyaları
│   │   │   │   ├── create_species_community_data.sql # Tür topluluk verileri
│   │   │   │   ├── create_species_follows_table.sql # Tür takip tablosu
│   │   │   │   ├── create_species_reviews_table.sql # Tür değerlendirme
│   │   │   │   └── update_species_reviews_table.sql # Değerlendirme güncelleme
│   │   │   └── index.ts                    # Package main export
│   │   ├── package.json                    # API package dependencies
│   │   └── tsconfig.json                   # TypeScript konfigürasyonu
│   │
│   ├── types/                               # Type tanımlamaları paketi (@fishivo/types)
│   │   ├── src/                            # Types kaynak kodları
│   │   │   ├── models/                     # Database model tipleri
│   │   │   │   ├── comment.ts              # Yorum model tipleri
│   │   │   │   ├── fishing.ts              # Balıkçılık ilgili tipler
│   │   │   │   ├── post.ts                 # Post model tipleri
│   │   │   │   ├── report.ts               # Şikayet sistem tipleri
│   │   │   │   ├── species.ts              # Balık türü tipleri
│   │   │   │   ├── spot.ts                 # Lokasyon model tipleri
│   │   │   │   ├── user.ts                 # Kullanıcı model tipleri
│   │   │   │   └── index.ts                # Model exports
│   │   │   ├── api/                        # API ilgili tipler
│   │   │   │   ├── email.ts                # Email servis tipleri
│   │   │   │   ├── follow.ts               # Takip sistem tipleri
│   │   │   │   ├── requests.ts             # API istek tipleri
│   │   │   │   ├── responses.ts            # API yanıt tipleri
│   │   │   │   └── index.ts                # API exports
│   │   │   ├── units.ts                    # Birim sistem tipleri (metric/imperial)
│   │   │   └── index.ts                    # Main type exports
│   │   ├── package.json                    # Types package config
│   │   └── tsconfig.json                   # TypeScript konfigürasyonu
│   │
│   ├── utils/                               # Yardımcı fonksiyonlar paketi (@fishivo/utils)
│   │   ├── src/                            # Utils kaynak kodları
│   │   │   ├── array-sanitizer.ts          # Array temizleme ve doğrulama
│   │   │   ├── cloudflare-r2.ts            # Cloudflare R2 storage helper'ları
│   │   │   ├── cn.ts                       # className birleştirici (Tailwind + clsx)
│   │   │   ├── conservation-status.ts      # Koruma durumu hesaplamaları
│   │   │   ├── constants.ts                # Uygulama geneli sabitler
│   │   │   ├── date.ts                     # Tarih/saat format fonksiyonları
│   │   │   ├── image-proxy.ts              # Görsel proxy URL oluşturucu
│   │   │   ├── location.ts                 # Konum hesaplama fonksiyonları
│   │   │   ├── map-bounds.ts               # Harita sınır doğrulama ve koordinat utils
│   │   │   ├── map-clustering.ts           # Profesyonel harita kümeleme algoritmaları
│   │   │   ├── navigation.ts               # Denizcilik navigasyon hesaplamaları
│   │   │   ├── coordinates.ts              # Koordinat format dönüşümleri
│   │   │   ├── network.ts                  # Ağ bağlantı kontrol fonksiyonları
│   │   │   ├── seo.ts                      # SEO meta tag helper'ları
│   │   │   ├── string.ts                   # String manipülasyon fonksiyonları
│   │   │   ├── username-validator.ts       # Kullanıcı adı doğrulama kuralları
│   │   │   ├── validation.ts               # Form doğrulama fonksiyonları
│   │   │   ├── weather.ts                  # Hava durumu hesaplamaları
│   │   │   └── index.ts                    # Main utils exports
│   │   ├── package.json                    # Utils package config
│   │   └── tsconfig.json                   # TypeScript konfigürasyonu
│   │
│   ├── hooks/                               # Paylaşılan React hooks paketi (@fishivo/hooks)
│   │   ├── src/                            # Hooks kaynak kodları
│   │   │   ├── native/                     # Native-specific hooks
│   │   │   │   ├── useUnits.ts             # Birim tercihi yönetimi (kg/lb)
│   │   │   │   ├── useMapCatches.tsx       # Harita kümeleme ve cache hook'u
│   │   │   │   └── index.ts                # Native hooks exports
│   │   │   ├── web/                        # Web-specific hooks (şu an boş)
│   │   │   │   └── index.ts                # Web hooks exports
│   │   │   └── index.ts                    # Main hooks exports
│   │   ├── package.json                    # Hooks package config
│   │   └── tsconfig.json                   # TypeScript konfigürasyonu
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
└── node_modules/                            # Tüm npm/yarn dependencies (gitignore)
```

## Önemli Notlar

- **Monorepo Yapısı**: Turborepo ile yönetilen workspace yapısı
- **Platform Ayrımı**: `.native.ts` ve `.web.ts` uzantıları ile platform-specific kod
- **Shared Packages**: `@fishivo/*` scope altında paylaşılan paketler
- **Type Safety**: Tüm kod TypeScript ile yazılmış, any kullanımı yasak
- **State Management**: Native'de Zustand + AsyncStorage, Web'de Server Components
- **Styling**: Native'de StyleSheet, Web'de Tailwind CSS + Shadcn/ui
- **Database**: Supabase (PostgreSQL) + Realtime subscriptions
- **Storage**: Cloudflare R2 for images/files
- **Maps**: UniversalMapView ile multi-provider desteği (MapLibre/Mapbox)
- **Weather**: Multi-provider weather service with fallback
- **i18n**: Türkçe ve İngilizce dil desteği