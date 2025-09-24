'use server'

import { createSupabaseActionClient } from '@fishivo/api/client/supabase.server'
import { revalidatePath } from 'next/cache'

export async function likePostAction(postId: string, postSlug: string) {
  const supabase = await createSupabaseActionClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('post_likes')
    .insert({
      post_id: postId,
      user_id: user.id
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/catches/${postSlug}`)
  return { success: true }
}

export async function unlikePostAction(postId: string, postSlug: string) {
  const supabase = await createSupabaseActionClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/catches/${postSlug}`)
  return { success: true }
}