// API Services Exports
export * from './services/user';
export { type ImageUrls } from './services/user/user.native';
export * from './services/posts';
export { postsServiceNative, type PostWithUser, type MapBounds, type MapCatchData, type MapClusterData } from './services/posts/posts.native';
export * from './services/spots';
export * from './services/waitlist';
export * from './services/contacts';
export * from './services/qr-code';
export * from './services/comments';
export * from './services/species';
export * from './services/weather';
export * from './services/follow';
export * from './services/likes';
export { getNativeGeocodingService } from './services/geocoding/geocoding.native';
// Image service requires platform-specific imports - see comment below
// Email service exports are server-only - use direct imports:
// import { createWebEmailService } from '@fishivo/api/services/email'

// Supabase Client Exports - NEW SSR APPROACH
// Web-only export - use direct import to avoid React Native bundle errors:
// import { createSupabaseBrowserClient } from '@fishivo/api/client/supabase.web'

// Server exports should be imported directly to avoid client-side build errors:
// import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'
// import { createSupabaseActionClient } from '@fishivo/api/client/supabase.server'
// import { createSupabaseMiddlewareClient } from '@fishivo/api/client/supabase.server'

// Native exports are available via direct import: 
// import { createNativeSupabaseClient } from '@fishivo/api/client/supabase.native'
// import { nativeSupabase } from '@fishivo/api/client/supabase.native'

// Export Native Supabase client
export { getNativeSupabaseClient, nativeSupabase } from './client/supabase.native';

// Native API Service
export { createNativeApiService } from './services/native';

// Auth helpers - use direct imports to avoid platform issues:
// import { getSafeSession, getSafeUser, isAuthenticated } from '@fishivo/api/client/auth-helpers'

// Image service - use platform-specific imports:
// import { ImageUploadService, ASPECT_RATIOS, AspectRatioType } from '@fishivo/api/services/image/image.native'
// import { ImageUploadService, ASPECT_RATIOS, AspectRatioType } from '@fishivo/api/services/image/image.web'

// 🚀 ENTERPRISE CACHE SYSTEM - META/INSTAGRAM PATTERN
// Unified cache with multi-layer architecture, event-driven invalidation, and real-time sync
export * from './cache';
export * from './realtime';

// Cache Integration Services (alias exports for clean imports)
export { 
  cacheIntegration, 
  withCache, 
  invalidateCache, 
  setCache,
  type CacheIntegrationConfig 
} from './services/cache-integration';

// Direct service imports for specific use cases
export { CacheIntegration } from './services/cache-integration';