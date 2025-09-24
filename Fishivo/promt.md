# 🎯 Fishivo Development Guidelines
ASLA GEÇİCİ ÇÖZÜM KULLANMA !!!!!!!!!!!!!
## 🔴 KRİTİK KURALLAR - Cluade.md dosyasını işlem bitiminde mimariya eklenmiş birşey varsa mimariye eklemek için izin istenecek.
 DB tablo yapısına uygun şekilde supabae mcp ile kontrol ederek tüm ID ve foreign key tiplerini %100 doğru oldupundan emin olacaksın her yazdığında kodda kontrol edilcek tüm flo sadece db değil aradaki tüm katmanlar. ve apiler.
### 1. **KOD MİNİMALİZMİ**
- **ANA AMAÇ**: Gereksiz kod yazmadan, temiz kodlama yaparak çakışmalardan kaçınmak.
- Tek katmanda çözülebiliyorsa katman ekleme
- Gereksiz kod tespit edildiğinde derhal bildir ve temizle
- Kısa çözümler, hack çözümler değil kalıcı ve profesyonel çözüm üretilecek.
- Typesript hataları ve eslint hataları oluşturulmayacak ve kodlama sonunda kontrol edilcek.

### 2. **DUPLICATE ÖNLEME**
- Eğer yeni birşey eklenecek ise Mevcut değişkenleri ve fonksiyonları kullan
- Ortak componentler/utils kullanılacak
- Yeni kod yazmadan önce mevcut kodu kontrol et

### 3. **TEMİZ KOD**
- Console.log (sadece debug için ve sonra silinecek)
- Gereksiz yorum satırı yasak
- Any type kullanımı yasak
- Import'lar düzgün organize edilecek (@fishivo/*, @/*)

### 4. **BACKEND & DATABASE**
- MCP ile Supabase tabloları analiz edilecek
- Database schema'ya uygun kod yazılacak
- RLS policies göz önünde bulundurulacak
- Type-safe queries kullanılacak

## 📋 DEVELOPMENT WORKFLOW

### Önce Analiz
- Kod yazmadan önce %100 analiz yapılacak
- Tüm flow ve bağımlılıklar belirlenmeli
- Database yapısını kontrol et
- Kullanılan pattern'leri anla
- Bağımlılıkları tespit et

### Sonra Planlama
1. Performance ve scalability düşün
2. Mevcut component/util kullanımını planla
3. Duplicate oluşturmayacak şekilde kurgula

### En Son Uygulama
1. Temiz, okunabilir kod yaz
2. Type safety sağla
3. Error handling ekle
4. Test edilebilir kod yaz

## 🚫 YASAKLAR

- ❌ Gereksiz Console.log (production'da)
- ❌ Any type
- ❌ Duplicate kod
- ❌ Gereksiz katmanlar
- ❌ Relative imports (../../../)
- ❌ Alert.alert (FishivoModal kullan)
- ❌ Hardcoded değerler
- ❌ Yorum satırı spam'i

## ✅ BEST PRACTICES

- ✅ Monorepo package kullanımı (@fishivo/*)
- ✅ TypeScript strict mode
- ✅ Supabase RLS policies
- ✅ React Native best practices
- ✅ Next.js 15 App Router patterns
- ✅ Shadcn UI components (web)
- ✅ Platform-specific implementations (.native.ts, .web.ts)
- ✅ Error boundaries ve fallbacks