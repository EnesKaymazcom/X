# 🚛 3D AI Kamera Fleet Takip Sistemi - Kapsamlı Geliştirme Prompt'u

## 🎯 Proje Özeti
808GPS API'si ile entegre, multi-tenant SaaS mimarili, 3D AI kamera sistemli araç takip platformu. CMSV7/TraCCER benzeri profesyonel arayüze sahip, müşteri odaklı fleet management sistemi.

## 🏗️ Teknik Mimarı

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **UI Framework**: Shadcn UI (ZORUNLU) - https://ui.shadcn.com
- **Styling**: Tailwind CSS
- **Harita**: Mapbox GL JS
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Real-time**: Socket.io Client
- **Animations**: Framer Motion

### Backend Stack
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: NextAuth.js + JWT
- **Real-time**: Socket.io
- **API**: Next.js API Routes + tRPC
- **Caching**: Redis
- **File Storage**: Supabase Storage

### 3D AI Kamera Entegrasyonu
- **808GPS API**: Çalışan endpoint'ler kullanılacak
- **Video Streaming**: WebRTC + HLS
- **360° Görüntü**: Three.js/React Three Fiber
- **AI Analysis**: TensorFlow.js (client-side)

## 📋 Fonksiyonel Gereksinimler

### 🔐 Multi-Tenant Authentication System
```typescript
// Tenant yapısı
interface Tenant {
  id: string
  name: string
  domain?: string
  subscription: 'basic' | 'premium' | 'enterprise'
  gps808Credentials: {
    server: string
    account: string
    password: string
  }
  maxVehicles: number
  features: string[]
}

// User yapısı
interface User {
  id: string
  tenantId: string
  email: string
  role: 'admin' | 'operator' | 'viewer'
  permissions: Permission[]
}
```

### 🚛 Araç Yönetimi
```typescript
interface Vehicle {
  id: string
  tenantId: string
  deviceId: string // 808GPS device ID
  name: string
  plateNumber: string
  type: 'truck' | 'trailer' | 'bus'
  driverInfo: Driver
  cameras: Camera[]
  currentLocation: GPSData
  status: 'online' | 'offline' | 'idle' | 'moving'
}

interface Camera {
  id: string
  channel: 'CH1' | 'CH2' | 'CH3' | 'CH4'
  type: '360' | 'driver' | 'road' | 'cabin'
  aiFeatures: ['fatigue_detection', 'phone_usage', 'smoking']
}
```

### 🗺️ Mapbox Harita Özellikleri
- Real-time araç konumları
- Geofencing (sanal çitler)
- Route history
- Traffic layer
- Custom vehicle icons
- Cluster görünümü (çok araç için)
- 3D building layer

### 📹 Video & AI Özellikleri
```typescript
interface AIDetection {
  timestamp: Date
  vehicleId: string
  cameraId: string
  detectionType: 'fatigue' | 'phone' | 'smoking' | 'collision_warning'
  confidence: number
  snapshot: string
  location: GPSData
}
```

## 📱 Kullanıcı Arayüzü (Shadcn UI Zorunlu)

### Dashboard Layout
```tsx
// Ana dashboard bileşenleri (Shadcn UI kullanarak)
<div className="flex h-screen">
  <Sidebar /> {/* shadcn/ui navigation-menu */}
  <main className="flex-1 flex flex-col">
    <Header /> {/* shadcn/ui breadcrumb */}
    <div className="flex-1 grid grid-cols-12 gap-4 p-4">
      <Card className="col-span-8"> {/* shadcn/ui card */}
        <MapboxMap vehicles={vehicles} />
      </Card>
      <Card className="col-span-4"> {/* shadcn/ui card */}
        <VehicleList vehicles={vehicles} />
      </Card>
    </div>
  </main>
</div>
```

### Gerekli Shadcn UI Components
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add alert
npx shadcn@latest add avatar
npx shadcn@latest add badge
npx shadcn@latest add tabs
npx shadcn@latest add sheet
npx shadcn@latest add dropdown-menu
npx shadcn@latest add navigation-menu
npx shadcn@latest add breadcrumb
npx shadcn@latest add progress
npx shadcn@latest add switch
npx shadcn@latest add slider
npx shadcn@latest add calendar
npx shadcn@latest add date-picker
```

### Sayfa Yapısı
```
/dashboard
├── /overview - Ana özet
├── /fleet - Araç listesi ve detayları
├── /live - Canlı izleme (harita + video)
├── /history - Geçmiş rotalar ve kayıtlar
├── /alerts - Alarmlar ve AI uyarıları
├── /reports - Raporlar ve analizler
├── /settings - Ayarlar ve profil
└── /admin - Tenant yönetimi (admin only)
```

## 🔧 API Entegrasyonu

### 808GPS API Wrapper
```typescript
class GPS808Client {
  private session: string

  async login(credentials: GPS808Credentials): Promise<string>
  async getVehicles(): Promise<Vehicle808[]>
  async getVehicleStatus(deviceId: string): Promise<VehicleStatus>
  async getGPSData(deviceId: string): Promise<GPSData>
  async startVideoStream(deviceId: string, channel: string): Promise<StreamURL>
}
```

### Real-time Data Flow
```typescript
// Socket.io event'leri
socket.on('vehicle_location_update', (data) => {
  updateVehiclePosition(data)
  updateMapMarkers(data)
})

socket.on('ai_detection', (data) => {
  showAlertNotification(data)
  updateAlertsList(data)
})
```

## 🎨 UI/UX Tasarım Prensipleri

### CMSV7 Benzeri Arayüz
- **Sol Panel**: Araç listesi, filtreleme
- **Ana Alan**: Mapbox harita
- **Sağ Panel**: Seçili araç detayları, canlı video
- **Alt Panel**: Timeline ve kontroller
- **Header**: Breadcrumb, kullanıcı menüsü, bildirimler

### Responsive Design
```css
/* Mobile-first approach */
.dashboard-grid {
  @apply grid grid-cols-1 gap-4;

  @screen md {
    @apply grid-cols-8;
  }

  @screen lg {
    @apply grid-cols-12;
  }
}
```

## 🗃️ Database Schema (PostgreSQL)

```sql
-- Tenants tablosu
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE,
  subscription VARCHAR(20) NOT NULL,
  gps_server VARCHAR(255),
  gps_account VARCHAR(255),
  gps_password VARCHAR(255),
  max_vehicles INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Users tablosu
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vehicles tablosu
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  device_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  plate_number VARCHAR(20),
  vehicle_type VARCHAR(20),
  camera_config JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- GPS Data tablosu (time-series data)
CREATE TABLE gps_data (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  speed INTEGER,
  heading INTEGER,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI Detections tablosu
CREATE TABLE ai_detections (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id),
  camera_channel VARCHAR(10),
  detection_type VARCHAR(50),
  confidence DECIMAL(5, 4),
  snapshot_url TEXT,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Geliştirme Aşamaları

### Faz 1: Temel Mimari (1-2 hafta)
1. Next.js + Shadcn UI kurulumu
2. PostgreSQL + Prisma schema
3. Multi-tenant authentication
4. 808GPS API entegrasyonu
5. Temel dashboard layout

### Faz 2: Harita ve Tracking (1-2 hafta)
1. Mapbox entegrasyonu
2. Real-time araç takibi
3. GPS data görselleştirme
4. Geofencing özellikleri

### Faz 3: Video & AI (2-3 hafta)
1. Kamera stream entegrasyonu
2. 360° video player (Three.js)
3. AI detection sistemi
4. Alert/notification sistemi

### Faz 4: Advanced Features (1-2 hafta)
1. Raporlama modülü
2. Historical data analysis
3. Fleet analytics
4. Mobile responsive optimizasyon

## 📦 Package.json Bağımlılıkları

```json
{
  "scripts": {
    "dev": "next dev -p 3010",
    "build": "next build",
    "start": "next start -p 3010",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "mapbox-gl": "^2.15.0",
    "socket.io-client": "^4.7.0",
    "three": "^0.158.0",
    "@react-three/fiber": "^8.15.0",
    "prisma": "^5.7.0",
    "@prisma/client": "^5.7.0",
    "next-auth": "^4.24.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "framer-motion": "^10.16.0"
  }
}
```

## 🌐 Development Server

Uygulama **localhost:3010** portunda çalışacaktır:

```bash
# Development server başlat
npm run dev
# http://localhost:3010 adresinde çalışır

# Production build
npm run build
npm run start
# http://localhost:3010 adresinde production çalışır
```

## 🔒 Güvenlik ve Performans

### Güvenlik
- Multi-tenant data isolation
- JWT token encryption
- RBAC (Role-Based Access Control)
- API rate limiting
- Input validation (Zod)

### Performans
- Redis caching (GPS data)
- Database indexing
- Image optimization
- Code splitting
- Progressive loading

## 📱 Mobil Uyumluluk
- Responsive design (Tailwind breakpoints)
- Touch-friendly interface
- Mobile-first yaklaşım
- PWA özellikleri

## ⚠️ SHADCN UI KULLANIM ZORUNLULUĞU

### Neden Shadcn UI?
- **Profesyonel Görünüm**: Modern ve tutarlı UI
- **Özelleştirilebilir**: Tailwind CSS ile tam kontrol
- **Performans**: Zero runtime overhead
- **Accessibility**: WCAG standartlarına uygun
- **TypeScript**: Full type support

### Shadcn UI Kurulum
```bash
# Next.js projesi oluştur
npx create-next-app@latest fleet-tracker --typescript --tailwind --app

# Shadcn UI'ı başlat
npx shadcn-ui@latest init

# Tüm gerekli component'leri ekle
npx shadcn-ui@latest add button card input select table dialog alert avatar badge tabs sheet dropdown-menu navigation-menu breadcrumb progress switch slider calendar
```

### Component Kullanım Örnekleri

#### Button Component
```tsx
import { Button } from "@/components/ui/button"

// Varsayılan buton
<Button>Araç Ekle</Button>

// Varyantlar
<Button variant="destructive">Sil</Button>
<Button variant="outline">İptal</Button>
<Button variant="secondary">Düzenle</Button>
<Button variant="ghost">Detaylar</Button>
<Button variant="link">Daha Fazla</Button>

// Boyutlar
<Button size="sm">Küçük</Button>
<Button size="default">Normal</Button>
<Button size="lg">Büyük</Button>
<Button size="icon"><Icon /></Button>
```

#### Card Component
```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Araç Bilgileri</CardTitle>
    <CardDescription>34 ABC 123 - Mercedes Actros</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Araç detayları */}
  </CardContent>
  <CardFooter>
    <Button>Canlı İzle</Button>
  </CardFooter>
</Card>
```

#### Dialog Component
```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Yeni Araç Ekle</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Araç Ekle</DialogTitle>
      <DialogDescription>
        Yeni araç bilgilerini giriniz
      </DialogDescription>
    </DialogHeader>
    {/* Form içeriği */}
  </DialogContent>
</Dialog>
```

### Shadcn UI Theme Özelleştirme
```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* Fleet tracker özel renkleri */
    --success: 142 76% 36%;
    --warning: 38 92% 50%;
    --danger: 0 84% 60%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}
```

## 📝 Önemli Notlar

1. **Shadcn UI Zorunlu**: Tüm UI component'leri için Shadcn UI kullanılmalı
2. **Custom Component Yasak**: Shadcn UI'da varsa custom component yazılmayacak
3. **Stil Değişikliği Yasak**: Button ve diğer component'lerin default stilleri korunacak
4. **Tailwind Entegrasyonu**: Shadcn UI Tailwind CSS ile mükemmel çalışır
5. **TypeScript Support**: Full tip güvenliği sağlanacak

Bu prompt ile modern, ölçeklenebilir ve profesyonel bir fleet tracking sistemi geliştirebilirsiniz. 808GPS API'si ile entegre, Shadcn UI ile şık arayüze sahip, multi-tenant mimaride çalışan sistem müşterilerinizin ihtiyaçlarını karşılayacaktır.