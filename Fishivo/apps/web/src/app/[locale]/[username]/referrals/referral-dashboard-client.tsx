'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Crown, 
  Share2, 
  Copy, 
  Trophy, 
  TrendingUp,
  Target,
  Calendar,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { motion } from 'framer-motion'
import type { ReferralStats, ReferralMilestone } from '@fishivo/api/services/referral'

interface ReferralDashboardClientProps {
  profileData: any
  referralStats: ReferralStats
  milestones: ReferralMilestone[]
  leaderboard: any[]
  userRank: number
  locale: 'en' | 'tr'
}

export default function ReferralDashboardClient({
  profileData,
  referralStats,
  milestones,
  leaderboard,
  userRank,
  locale
}: ReferralDashboardClientProps) {
  const [copySuccess, setCopySuccess] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  
  const referralLink = `https://fishivo.com/${profileData.username}?ref=${referralStats.referral_code}`
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 3000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: locale === 'en' ? 'Join me on Fishivo!' : 'Fishivo\'da bana katıl!',
          text: locale === 'en' 
            ? 'Join me on Fishivo - the best fishing social app! 🎣' 
            : 'Beni Fishivo\'da takip et - en iyi balıkçılık sosyal uygulaması! 🎣',
          url: referralLink
        })
      } catch (error) {
        console.error('Failed to share:', error)
      }
    } else {
      handleCopyLink()
    }
  }
  
  const handleRegenerateCode = async () => {
    setIsRegenerating(true)
    try {
      const response = await fetch('/api/referral/generate-code', {
        method: 'POST'
      })
      
      if (response.ok) {
        // Refresh the page to show the new code
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to regenerate code:', error)
    } finally {
      setIsRegenerating(false)
    }
  }
  
  const nextMilestone = milestones.find(m => m.required_referrals > referralStats.total_referrals)
  const completedMilestones = milestones.filter(m => m.required_referrals <= referralStats.total_referrals)
  
  const progressPercentage = nextMilestone 
    ? ((referralStats.total_referrals % (nextMilestone.required_referrals || 1)) / (nextMilestone.required_referrals || 1)) * 100
    : 100
  
  const t = {
    title: locale === 'en' ? 'Referral Dashboard' : 'Referans Paneli',
    subtitle: locale === 'en' ? 'Invite friends and earn rewards!' : 'Arkadaşlarını davet et, ödüller kazan!',
    stats: {
      totalReferrals: locale === 'en' ? 'Total Referrals' : 'Toplam Referans',
      totalRewards: locale === 'en' ? 'Total Rewards' : 'Toplam Ödül',
      leaderboardRank: locale === 'en' ? 'Leaderboard Rank' : 'Sıralama',
      premiumUntil: locale === 'en' ? 'Premium Until' : 'Premium Tarihi'
    },
    referralLink: {
      title: locale === 'en' ? 'Your Referral Link' : 'Referans Linkin',
      copyButton: locale === 'en' ? 'Copy Link' : 'Linki Kopyala',
      shareButton: locale === 'en' ? 'Share' : 'Paylaş',
      regenerateButton: locale === 'en' ? 'Regenerate Code' : 'Yeni Kod Oluştur',
      copied: locale === 'en' ? 'Link copied to clipboard!' : 'Link panoya kopyalandı!'
    },
    milestones: {
      title: locale === 'en' ? 'Milestones & Rewards' : 'Başarım ve Ödüller',
      nextMilestone: locale === 'en' ? 'Next Milestone' : 'Sonraki Başarım',
      completed: locale === 'en' ? 'Completed' : 'Tamamlandı',
      progress: locale === 'en' ? 'Progress' : 'İlerleme'
    },
    recentReferrals: {
      title: locale === 'en' ? 'Recent Referrals' : 'Son Referanslar'
    },
    leaderboard: {
      title: locale === 'en' ? 'Top Referrers' : 'En Çok Referans Getirenler',
      yourRank: locale === 'en' ? 'Your Rank' : 'Senin Sıran'
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t.stats.totalReferrals}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {referralStats.total_referrals}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t.stats.totalRewards}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {referralStats.total_rewards}
                    </p>
                  </div>
                  <Trophy className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t.stats.leaderboardRank}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      #{userRank || '--'}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t.stats.premiumUntil}
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {referralStats.premium_until 
                        ? new Date(referralStats.premium_until).toLocaleDateString(locale)
                        : '--'
                      }
                    </p>
                    {referralStats.is_premium && (
                      <Badge variant="secondary" className="mt-1">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <Calendar className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Referral Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    {t.referralLink.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <code className="flex-1 text-sm">{referralLink}</code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                        className="shrink-0"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        {t.referralLink.copyButton}
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handleShare} className="flex-1">
                        <Share2 className="h-4 w-4 mr-2" />
                        {t.referralLink.shareButton}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleRegenerateCode}
                        disabled={isRegenerating}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                        {t.referralLink.regenerateButton}
                      </Button>
                    </div>
                    
                    {copySuccess && (
                      <Alert>
                        <AlertDescription>
                          {t.referralLink.copied}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Milestones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {t.milestones.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Next Milestone Progress */}
                    {nextMilestone && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {t.milestones.nextMilestone}: {locale === 'en' ? nextMilestone.title_en : nextMilestone.title_tr}
                          </span>
                          <span className="text-sm text-gray-500">
                            {referralStats.total_referrals}/{nextMilestone.required_referrals}
                          </span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {locale === 'en' ? nextMilestone.description_en : nextMilestone.description_tr}
                        </p>
                      </div>
                    )}

                    <Separator />

                    {/* Milestone List */}
                    <div className="grid gap-4">
                      {milestones.map((milestone) => {
                        const isCompleted = milestone.required_referrals <= referralStats.total_referrals
                        
                        return (
                          <div
                            key={milestone.level}
                            className={`flex items-center gap-4 p-4 rounded-lg border ${
                              isCompleted 
                                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                                : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                            }`}
                          >
                            <div className="text-2xl">{milestone.badge_icon}</div>
                            <div className="flex-1">
                              <h4 className="font-medium">
                                {locale === 'en' ? milestone.title_en : milestone.title_tr}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {locale === 'en' ? milestone.description_en : milestone.description_tr}
                              </p>
                              <p className="text-xs text-gray-500">
                                {milestone.required_referrals} referrals required
                              </p>
                            </div>
                            {isCompleted && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {t.milestones.completed}
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Referrals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {t.recentReferrals.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {referralStats.recent_referrals.length > 0 ? (
                      referralStats.recent_referrals.map((referral, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={referral.avatar_url || ''} />
                            <AvatarFallback>
                              {referral.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{referral.username}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(referral.created_at).toLocaleDateString(locale)}
                            </p>
                          </div>
                          <Badge 
                            variant={referral.status === 'rewarded' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {referral.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        {locale === 'en' ? 'No referrals yet' : 'Henüz referans yok'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    {t.leaderboard.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.slice(0, 10).map((entry, index) => (
                      <div 
                        key={entry.username}
                        className={`flex items-center gap-3 ${
                          entry.username === profileData.username 
                            ? 'bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 -m-2' 
                            : ''
                        }`}
                      >
                        <div className="flex items-center justify-center w-6 h-6">
                          {index === 0 && <span className="text-lg">🥇</span>}
                          {index === 1 && <span className="text-lg">🥈</span>}
                          {index === 2 && <span className="text-lg">🥉</span>}
                          {index > 2 && (
                            <span className="text-sm font-medium text-gray-500">
                              #{index + 1}
                            </span>
                          )}
                        </div>
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={entry.avatar_url || ''} />
                          <AvatarFallback className="text-xs">
                            {entry.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{entry.username}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {entry.referral_count}
                        </Badge>
                      </div>
                    ))}
                    
                    {userRank > 10 && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 -m-2">
                          <div className="flex items-center justify-center w-6 h-6">
                            <span className="text-sm font-medium text-gray-500">
                              #{userRank}
                            </span>
                          </div>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={profileData.avatar_url || ''} />
                            <AvatarFallback className="text-xs">
                              {profileData.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{profileData.username}</p>
                            <p className="text-xs text-gray-500">{t.leaderboard.yourRank}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {referralStats.total_referrals}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}