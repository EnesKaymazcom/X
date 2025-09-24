'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'

// TODO: Follow actions will be implemented
export async function followUserAction(targetUserId: string, username: string) {
  return { success: false, error: 'Not implemented' }
}

export async function unfollowUserAction(targetUserId: string, username: string) {
  return { success: false, error: 'Not implemented' }
}