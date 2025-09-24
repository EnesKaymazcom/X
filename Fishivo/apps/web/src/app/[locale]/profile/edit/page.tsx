import ProfileEditClient from './profile-edit-client'
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'
import { redirect } from 'next/navigation'

export default async function ProfileEdit() {
  const supabase = await createSupabaseServerClient()
  
  // Oturumdaki kullanıcıyı al
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    redirect('/login')
  }
  
  const user = session.user
  
  // Kullanıcının profil bilgilerini al
  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (profileError) {
    console.error('Profile fetch error:', profileError)
  }

  return <ProfileEditClient user={user} profileData={profileData} />
}

