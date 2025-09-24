import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'
import { ReferralServiceWeb } from '@fishivo/api/services/referral/referral.web'
import { REFERRAL_MILESTONES } from '@fishivo/api/services/referral'
import ReferralDashboardClient from './referral-dashboard-client'

interface ReferralDashboardPageProps {
  params: Promise<{
    username: string
    locale: string
  }>
}

export default async function ReferralDashboardPage({ params }: ReferralDashboardPageProps) {
  const supabase = await createSupabaseServerClient()
  
  // Await params first (Next.js 15 requirement)
  const resolvedParams = await params
  const username = resolvedParams.username
  const locale = resolvedParams.locale as 'en' | 'tr'
  
  // Get current user
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    notFound()
  }
  
  const user = session.user
  
  // Get user by username and verify ownership
  const { data: profileData, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()
  
  if (error || !profileData || profileData.id !== user.id) {
    // Only allow users to view their own referral dashboard
    notFound()
  }
  
  // Get referral stats
  const referralStats = await ReferralServiceWeb.getReferralStats(user.id)
  
  if (!referralStats) {
    notFound()
  }
  
  // Get leaderboard for context
  const leaderboard = await ReferralServiceWeb.getReferralLeaderboard(20)
  
  // Find user's position in leaderboard
  const userRank = leaderboard.findIndex(entry => entry.username === username) + 1
  
  return (
    <ReferralDashboardClient 
      profileData={profileData}
      referralStats={referralStats}
      milestones={REFERRAL_MILESTONES}
      leaderboard={leaderboard}
      userRank={userRank}
      locale={locale}
    />
  )
}

// Generate metadata
export async function generateMetadata({ params }: ReferralDashboardPageProps) {
  const resolvedParams = await params
  const username = resolvedParams.username
  
  return {
    title: `${username} - Referral Dashboard | Fishivo`,
    description: `View ${username}'s referral statistics and achievements on Fishivo`,
    robots: 'noindex, nofollow', // Private dashboard
  }
}