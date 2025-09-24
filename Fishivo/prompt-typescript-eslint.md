# Fishivo TypeScript & ESLint Error Resolution Guide

## 🔴 **KRİTİK UYARI**
Bu prompt **SADECE** TypeScript ve ESLint hatalarını düzeltmek içindir. **CLAUDE.md'deki tüm kurallar geçerlidir!**

## 🚨 **FISHIVO ZORUNLU KURALLAR - KESİNLİKLE UYULACAK**

### ❌ **YAPILMAMASI GEREKENLER - SIFIR TOLERANS**
```typescript
// ❌ ASLA YAPMA - OTOMATİK RED
console.log()              // YASAK! Debug bile olsa
console.warn()             // YASAK!
console.error()            // YASAK! (catch block'ta bile)
any                        // YASAK! Type safety zorunlu
@ts-ignore                 // YASAK! Hatayı çöz, ignore etme
@ts-nocheck               // YASAK!
eslint-disable            // YASAK!
as any                    // YASAK!
../../../                 // YASAK! Relative import kullanma
Alert.alert()             // YASAK! FishivoModal kullan
require()                 // YASAK! import kullan
```

### ✅ **YAPILMASI GEREKENLER - ZORUNLU**
```typescript
// ✅ HER ZAMAN BUNLARI YAP
import type { Type }       // Type-only imports kullan
@fishivo/*                // Package imports
@/                        // Absolute imports (app içi)
unknown                   // any yerine unknown
FishivoModal             // Alert.alert yerine
'tek tırnak'             // JS string'leri için
"çift tırnak"            // JSX attribute'ları için
```

## 📦 **FISHIVO MONOREPO YAPISI**

### **Package İmport Kuralları**
```typescript
// ✅ DOĞRU - Fishivo packages
import { createSupabaseBrowserClient } from '@fishivo/api'
import { User, Post, Comment } from '@fishivo/types'
import { cn, formatDateTime } from '@fishivo/utils'
import { useMapCatches } from '@fishivo/hooks'

// ✅ DOĞRU - Platform specific
import { postsServiceNative } from '@fishivo/api/services/posts/posts.native'
import { createNativeApiService } from '@fishivo/api/services/native'

// ✅ DOĞRU - App içi (absolute)
import { Button } from '@/components/ui/Button'
import { useFollow } from '@/hooks/useFollow'

// ❌ YANLIŞ - ASLA YAPMA
import { Button } from '../../../components/ui/Button'
import { helper } from '../../../../packages/utils/src/helper'
```

## 🔐 **AUTH SİSTEMİ - TEK DOĞRU YÖNTEM**

### **Sadece Bu 3 Client Kullanılacak**
```typescript
// packages/api/src/client/
// 1. Browser Client (Next.js Client Components)
import { createSupabaseBrowserClient } from '@fishivo/api'

// 2. Server Client (Next.js Server Components/Actions)
import { createSupabaseServerClient } from '@fishivo/api'
import { createSupabaseActionClient } from '@fishivo/api'

// 3. Native Client (React Native)
import { createSupabaseClient } from '@fishivo/api'
```

### **❌ AUTH YASAK İŞLEMLER**
```typescript
// ❌ ASLA YAPMA
const AuthContext = createContext()     // Context yaratma YASAK
const useAuth = () => {}               // useAuth hook YASAK
<AuthProvider>                         // Provider wrapper YASAK
localStorage.setItem('session')       // Client-side session YASAK
@supabase/auth-helpers                // Eski paket YASAK
```

## 💙 **LIKE SİSTEMİ - FACEBOOK STANDARDI**

### **Denormalized Counters Kullanımı**
```typescript
// ✅ DOĞRU - post_stats tablosundan oku
const { data } = await supabase
  .from('posts')
  .select(`
    *,
    post_stats!inner(likes_count, comments_count)
  `)

// ❌ YANLIŞ - likes tablosunu count etme
const { count } = await supabase
  .from('likes')
  .select('*', { count: 'exact' })
```

## 🎯 **FISHIVO TYPE SAFETY PATTERNS**

### 1. **Supabase Response Typing**
```typescript
// ❌ YANLIŞ
const { data }: any = await supabase.from('users').select()

// ✅ DOĞRU
import type { User } from '@fishivo/types'
const { data, error } = await supabase
  .from('users')
  .select()
  .returns<User[]>()

if (error) throw error
// data is User[] here
```

### 2. **Navigation Types (React Native)**
```typescript
// ❌ YANLIŞ
navigation.navigate('Profile', { userId: any })

// ✅ DOĞRU
import type { RootStackParamList } from '@/types/navigation'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Profile'
>

navigation.navigate('Profile', { userId: string })
```

### 3. **Component Props**
```typescript
// ❌ YANLIŞ
function CatchCard(props: any) {}

// ✅ DOĞRU
import type { Post } from '@fishivo/types'

interface CatchCardProps {
  post: Post
  onLike?: (postId: string) => void
  showComments?: boolean
}

function CatchCard({ post, onLike, showComments = true }: CatchCardProps) {}
```

## 🔧 **YAPISAL HATA ÇÖZÜMLERİ**

### 1. **Platform-Specific Import Errors**
```typescript
// ❌ HATA: Cannot find module
import { View } from 'react-native' // Web'de hata verir

// ✅ ÇÖZÜM: Platform-specific files
// components/Card.native.tsx
import { View } from 'react-native'

// components/Card.web.tsx  
import { div as View } from '@/components/ui/primitives'

// components/index.ts
export { Card } from './Card' // Auto-resolves by platform
```

### 2. **Async Function Types**
```typescript
// ❌ HATA: Missing return type
async function fetchUser(id) {
  return supabase.from('users').select().eq('id', id).single()
}

// ✅ ÇÖZÜM
import type { User } from '@fishivo/types'

async function fetchUser(id: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}
```

### 3. **React Native Text Children**
```typescript
// ❌ HATA: Text strings must be rendered within a <Text>
<View>{user.name}</View>

// ✅ ÇÖZÜM
<View>
  <Text>{user.name}</Text>
</View>

// ❌ HATA: Objects are not valid as React child
<Text>{user}</Text>

// ✅ ÇÖZÜM
<Text>{user?.name || ''}</Text>
<Text>{String(count)}</Text>
<Text>{date.toLocaleDateString('tr-TR')}</Text>
```

### 4. **Hook Dependency Arrays**
```typescript
// ❌ HATA: React Hook useEffect has missing dependencies
useEffect(() => {
  fetchPosts(userId, filters)
}, [])

// ✅ ÇÖZÜM 1: Tüm dependency'leri ekle
useEffect(() => {
  fetchPosts(userId, filters)
}, [userId, filters])

// ✅ ÇÖZÜM 2: Stable reference kullan
const fetchPostsStable = useCallback(() => {
  fetchPosts(userId, filters)
}, [userId, filters])

useEffect(() => {
  fetchPostsStable()
}, [fetchPostsStable])
```

## 🏗️ **TURBOREPO & YARN 4 ÖZELLİKLERİ**

### **Workspace Protocol**
```json
// ✅ DOĞRU - package.json
{
  "dependencies": {
    "@fishivo/api": "workspace:*",
    "@fishivo/types": "workspace:*",
    "@fishivo/utils": "workspace:*"
  }
}
```

### **TypeScript Project References**
```json
// ✅ tsconfig.json
{
  "references": [
    { "path": "../../packages/api" },
    { "path": "../../packages/types" },
    { "path": "../../packages/utils" }
  ]
}
```

## 📱 **REACT NATIVE SPECIFIC**

### **StyleSheet Types**
```typescript
// ❌ YANLIŞ
const styles: any = StyleSheet.create({})

// ✅ DOĞRU
import type { ViewStyle, TextStyle, ImageStyle } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  } satisfies ViewStyle,
  
  text: {
    fontSize: 16,
    color: '#000'
  } satisfies TextStyle
})
```

### **FishivoModal Kullanımı**
```typescript
// ❌ YANLIŞ - Alert.alert kullanma
Alert.alert('Başlık', 'Mesaj')

// ✅ DOĞRU - FishivoModal kullan
import { FishivoModal } from '@/components/ui/FishivoModal'

FishivoModal.show({
  title: 'Başlık',
  message: 'Mesaj',
  buttons: [
    { text: 'İptal', style: 'cancel' },
    { text: 'Tamam', onPress: () => {} }
  ]
})
```

## 🌐 **NEXT.JS SPECIFIC**

### **Server Component Types**
```typescript
// ✅ Server Component
import { createSupabaseServerClient } from '@fishivo/api'

export default async function Page() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  return <div>{user?.email}</div>
}
```

### **Server Actions**
```typescript
// ✅ Server Action
'use server'

import { createSupabaseActionClient } from '@fishivo/api'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = createSupabaseActionClient()
  
  const { error } = await supabase
    .from('users')
    .update({ name: formData.get('name') })
    .eq('id', userId)
    
  if (!error) {
    revalidatePath('/profile')
  }
}
```

## 🚀 **HIZLI DÜZELTME KOMUTLARI**

```bash
# 1. Tüm TypeScript hatalarını göster
yarn tsc --noEmit

# 2. ESLint auto-fix
yarn lint:fix

# 3. Unused imports temizle
yarn eslint --fix --ext .ts,.tsx --rule 'no-unused-vars: error'

# 4. Import path'leri düzelt
yarn eslint --fix --rule '@typescript-eslint/no-restricted-imports: error'

# 5. Clean build
yarn clean && yarn build
```

## ⚠️ **KONTROL LİSTESİ**

Hataları düzeltirken bu listeyi kontrol et:

- [ ] `console.log` YOK
- [ ] `any` type YOK
- [ ] `@ts-ignore` YOK
- [ ] Relative import (`../`) YOK
- [ ] `Alert.alert` YOK (FishivoModal kullan)
- [ ] AuthProvider/useAuth YOK
- [ ] Tüm fonksiyonların return type'ı VAR
- [ ] Tüm async fonksiyonlar `Promise<T>` döndürüyor
- [ ] Hook dependency array'leri TAMAM
- [ ] Platform-specific kodlar ayrı dosyalarda
- [ ] `@fishivo/*` package imports kullanılıyor
- [ ] String'ler tek tırnak, JSX attribute'ları çift tırnak

## 📝 **COMMIT MESAJI**

```bash
git commit -m "fix: TypeScript ve ESLint hataları düzeltildi

- any type kullanımları kaldırıldı
- console.log'lar temizlendi  
- Import path'ler @fishivo/* olarak güncellendi
- Hook dependency'leri düzeltildi
- FishivoModal entegrasyonu tamamlandı"
```

---

**ÖNEMLİ: Bu prompt sadece hata düzeltme içindir. Yeni özellik ekleme, refactoring veya optimization yapma! CLAUDE.md'deki tüm kurallar geçerlidir.**