'use client'

import { useState, useTransition } from 'react'
import { PageContainer } from '@/components/ui/page-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProBadge } from '@/components/ui/pro-badge'
import { Separator } from '@/components/ui/separator'
import { TypographyH3, TypographyP, TypographyMuted } from '@/lib/typography'
import { useI18n } from '@/lib/i18n'
import { 
  Fish, 
  MapPin, 
  Calendar, 
  Trophy, 
  Users, 
  Settings, 
  Mail,
  Instagram,
  Facebook,
  Youtube,
  Globe,
  Camera
} from 'lucide-react'
import { XIcon } from '@/components/icons/x-icon'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { followUserAction, unfollowUserAction } from './actions'
import { toast } from 'sonner'
import { getCountryWithPhoneCodeByCode } from '@/data/countriesWithPhoneCodes'

interface UserProfileClientProps {
  profileData: any
  currentUser: any
  isFollowing: boolean
  referralData?: any
  stats: {
    posts: number
    followers: number
    following: number
  }
}

export default function UserProfileClient({ 
  profileData, 
  currentUser, 
  isFollowing: initialIsFollowing,
  referralData,
  stats 
}: UserProfileClientProps) {
  const { t, locale } = useI18n()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isPending, startTransition] = useTransition()
  
  const isOwnProfile = currentUser?.id === profileData.id
  
  const handleFollowToggle = async () => {
    if (!currentUser) {
      window.location.href = `/${locale}/login`
      return
    }
    
    startTransition(async () => {
      try {
        // Optimistic update
        setIsFollowing(!isFollowing)
        
        const result = isFollowing 
          ? await unfollowUserAction(profileData.id, profileData.username)
          : await followUserAction(profileData.id, profileData.username)
        
        if (!result.success) {
          // Revert on failure
          setIsFollowing(isFollowing)
          toast.error(result.error || t('common.error'))
        }
      } catch (error) {
        // Revert on error
        setIsFollowing(isFollowing)
        toast.error(t('common.error'))
      }
    })
  }
  
  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Sol Kolon - Profil Bilgileri */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4 text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={profileData.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {profileData.full_name?.[0] || profileData.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <h1 className="text-xl font-bold">
                      {profileData.full_name || profileData.username}
                    </h1>
                    {profileData.is_pro && <ProBadge variant="small" />}
                  </div>
                  
                  <TypographyMuted>@{profileData.username}</TypographyMuted>
                  
                  {profileData.title && (
                    <Badge variant="secondary">{profileData.title}</Badge>
                  )}
                  
                  {profileData.bio && (
                    <TypographyP className="text-sm text-muted-foreground mt-3">
                      {profileData.bio}
                    </TypographyP>
                  )}
                </div>
                
                <div className="space-y-2">
                  {isOwnProfile ? (
                    <Link href={`/${locale}/profile/edit`} className="block">
                      <Button className="w-full" variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        {t('profile.editProfile')}
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Button 
                        className="w-full"
                        onClick={handleFollowToggle}
                        disabled={isPending}
                        variant={isFollowing ? 'outline' : 'default'}
                        size="sm"
                      >
                        {isFollowing ? t('profile.unfollow') : t('profile.follow')}
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <Mail className="h-4 w-4 mr-2" />
                        {locale === 'tr' ? 'Mesaj' : 'Message'}
                      </Button>
                    </>
                  )}
                </div>
                
                {(profileData.location || profileData.country_code) && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="flex items-center gap-1">
                      {profileData.location}
                      {profileData.location && profileData.country_code && ', '}
                      {profileData.country_code && (
                        <>
                          {locale === 'tr' 
                            ? (profileData.country_code === 'TR' ? 'Türkiye' : t(`locations.countries.${profileData.country_code}`, profileData.country_code))
                            : getCountryWithPhoneCodeByCode(profileData.country_code)?.name || profileData.country_code}
                          {' '}
                          <span className="text-lg inline-flex items-center">{getCountryWithPhoneCodeByCode(profileData.country_code)?.flag || ''}</span>
                        </>
                      )}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-2">
                  <Calendar className="h-4 w-4" />
                  <span>{locale === 'tr' ? 'Katıldı' : 'Joined'} {formatDate(profileData.created_at)}</span>
                </div>
                
                {(profileData.website || profileData.instagram_url || profileData.facebook_url || 
                  profileData.youtube_url || profileData.twitter_url) && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-center gap-2">
                      {profileData.website && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm hover:rounded-sm" asChild>
                          <a href={profileData.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {profileData.instagram_url && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm hover:rounded-sm" asChild>
                          <a href={profileData.instagram_url} target="_blank" rel="noopener noreferrer">
                            <Instagram className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {profileData.facebook_url && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm hover:rounded-sm" asChild>
                          <a href={profileData.facebook_url} target="_blank" rel="noopener noreferrer">
                            <Facebook className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {profileData.youtube_url && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm hover:rounded-sm" asChild>
                          <a href={profileData.youtube_url} target="_blank" rel="noopener noreferrer">
                            <Youtube className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {profileData.twitter_url && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm hover:rounded-sm" asChild>
                          <a href={profileData.twitter_url} target="_blank" rel="noopener noreferrer">
                            <XIcon className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* İstatistikler */}
            <Card className="mt-4">
              <CardContent className="p-3">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <TypographyMuted className="text-sm">{locale === 'tr' ? 'Gönderi' : 'Posts'}</TypographyMuted>
                    <span className="font-semibold">{stats.posts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <TypographyMuted className="text-sm">{locale === 'tr' ? 'Takipçi' : 'Followers'}</TypographyMuted>
                    <span className="font-semibold">{stats.followers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <TypographyMuted className="text-sm">{locale === 'tr' ? 'Takip' : 'Following'}</TypographyMuted>
                    <span className="font-semibold">{stats.following}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sağ Kolon - İçerik */}
          <div className="lg:col-span-5">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="posts">
                  <Fish className="h-4 w-4 mr-2" />
                  {locale === 'tr' ? 'Gönderiler' : 'Posts'}
                </TabsTrigger>
                <TabsTrigger value="locations">
                  <MapPin className="h-4 w-4 mr-2" />
                  {locale === 'tr' ? 'Lokasyonlar' : 'Locations'}
                </TabsTrigger>
                <TabsTrigger value="achievements">
                  <Trophy className="h-4 w-4 mr-2" />
                  {locale === 'tr' ? 'Başarılar' : 'Achievements'}
                </TabsTrigger>
              </TabsList>
          
              <TabsContent value="posts" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Empty State */}
                  <Card className="col-span-full">
                    <CardContent className="p-12">
                      <div className="flex flex-col items-center justify-center text-center">
                        <Fish className="h-12 w-12 text-muted-foreground mb-4" />
                        <TypographyH3 className="mb-2 text-lg">
                          {locale === 'tr' ? 'Henüz gönderi yok' : 'No posts yet'}
                        </TypographyH3>
                        <TypographyP className="text-sm text-muted-foreground max-w-md">
                          {isOwnProfile 
                            ? (locale === 'tr' 
                              ? 'İlk avınızı paylaşın ve balıkçılık anılarınızı kaydedin.' 
                              : 'Share your first catch and start recording your fishing memories.')
                            : (locale === 'tr'
                              ? 'Bu kullanıcı henüz bir av paylaşmamış.'
                              : 'This user hasn\'t shared any posts yet.')
                          }
                        </TypographyP>
                        {isOwnProfile && (
                          <Button className="mt-4" size="sm">
                            <Camera className="h-4 w-4 mr-2" />
                            {locale === 'tr' ? 'Gönderi Paylaş' : 'Share Post'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
          
              <TabsContent value="locations" className="mt-6">
                <Card>
                  <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                      <TypographyH3 className="mb-2 text-lg">
                        {locale === 'tr' ? 'Henüz lokasyon yok' : 'No locations yet'}
                      </TypographyH3>
                      <TypographyP className="text-sm text-muted-foreground max-w-md">
                        {isOwnProfile 
                          ? (locale === 'tr' 
                            ? 'Favori balıkçılık noktalarınızı kaydedin ve paylaşın.' 
                            : 'Save and share your favorite fishing spots.')
                          : (locale === 'tr'
                            ? 'Bu kullanıcı henüz bir lokasyon paylaşmamış.'
                            : 'This user hasn\'t shared any locations yet.')
                        }
                      </TypographyP>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
          
              <TabsContent value="achievements" className="mt-6">
                <Card>
                  <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                      <TypographyH3 className="mb-2 text-lg">
                        {locale === 'tr' ? 'Henüz başarı yok' : 'No achievements yet'}
                      </TypographyH3>
                      <TypographyP className="text-sm text-muted-foreground max-w-md">
                        {locale === 'tr'
                          ? 'Başarılar yakında gelecek!'
                          : 'Achievements coming soon!'}
                      </TypographyP>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}