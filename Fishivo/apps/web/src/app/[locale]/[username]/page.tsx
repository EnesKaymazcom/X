import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'
import { ReferralServiceWeb } from '@fishivo/api/services/referral/referral.web'
import UserProfileClient from './user-profile-client'

interface UserProfilePageProps {
  params: Promise<{
    username: string
    locale: string
  }>
  searchParams: Promise<{
    ref?: string
  }>
}

export default async function UserProfilePage({ params, searchParams }: UserProfilePageProps) {
  const supabase = await createSupabaseServerClient()
  
  // Await params first (Next.js 15 requirement)
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  // Get username directly
  const username = resolvedParams.username
  const referralCode = resolvedSearchParams.ref
  
  // Get user by username
  const { data: profileData, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()
  
  if (error || !profileData) {
    notFound()
  }
  
  // Get current user
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  
  // Get user statistics
  const [
    { count: postCount },
    { count: followerCount },
    { count: followingCount }
  ] = await Promise.all([
    supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profileData.id),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', profileData.id),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', profileData.id)
  ])
  
  // Check if current user follows this profile
  let isFollowing = false
  if (user && user.id !== profileData.id) {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', profileData.id)
      .single()
    
    isFollowing = !!data
  }
  
  // Handle referral code if present and user is logged in
  let referralData = null
  if (referralCode && user && user.id !== profileData.id) {
    // Validate referral code and get referrer info
    const isValidCode = await ReferralServiceWeb.validateReferralCode(referralCode)
    const referrerInfo = isValidCode ? await ReferralServiceWeb.getUserByReferralCode(referralCode) : null
    
    if (referrerInfo) {
      referralData = {
        referral_code: referralCode,
        referrer: referrerInfo
      }
    }
  }
  
  return (
    <UserProfileClient 
      profileData={profileData}
      currentUser={user}
      isFollowing={isFollowing}
      referralData={referralData}
      stats={{
        posts: postCount || 0,
        followers: followerCount || 0,
        following: followingCount || 0
      }}
    />
  )
}