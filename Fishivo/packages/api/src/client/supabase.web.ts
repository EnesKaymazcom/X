import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createSupabaseBrowserClient() {
  // Use default Supabase SSR cookie handling
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      debug: false
    }
  })
}