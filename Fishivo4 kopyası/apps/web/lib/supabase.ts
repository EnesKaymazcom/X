import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kqvhyiexevsdlhzcnhrc.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtxdmh5aWV4ZXZzZGxoemNuaHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxOTM2NDQsImV4cCI6MjA2NDc2OTY0NH0.rvoWXgCRgr0mvsf9xreps7m7iUpp06USXZLh5J003KA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export default supabase