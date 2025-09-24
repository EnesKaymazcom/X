import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Config from 'react-native-config'

const supabaseUrl = Config.SUPABASE_URL
const supabaseAnonKey = Config.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase config missing');
}

export const createNativeSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })
}

let nativeSupabaseClient: ReturnType<typeof createNativeSupabaseClient> | null = null

export const getNativeSupabaseClient = () => {
  if (!nativeSupabaseClient) {
    nativeSupabaseClient = createNativeSupabaseClient()
  }
  return nativeSupabaseClient
}

// Export for backwards compatibility
export const nativeSupabase = getNativeSupabaseClient()

