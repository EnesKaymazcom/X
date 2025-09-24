import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Safely get user session without throwing errors
 * Returns null if no session exists or if token is expired
 */
export async function getSafeSession(supabase: SupabaseClient) {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    // Return null if there's an error or no session
    if (error || !session) {
      return null
    }
    
    return session
  } catch (error) {
    // Silently handle any errors
    return null
  }
}

/**
 * Safely get user from session
 * Returns null if no user exists or if token is expired
 */
export async function getSafeUser(supabase: SupabaseClient) {
  const session = await getSafeSession(supabase)
  return session?.user || null
}

/**
 * Check if user has valid session
 * Returns boolean indicating if user is authenticated
 */
export async function isAuthenticated(supabase: SupabaseClient): Promise<boolean> {
  const session = await getSafeSession(supabase)
  return !!session?.user
}