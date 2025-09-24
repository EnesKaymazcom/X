'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MapPin, Calendar, Globe, Instagram, Facebook, Youtube, Clock, Camera, User } from 'lucide-react'
import { ProBadge, ProMembershipCard } from '@/components/ui/pro-badge'
import { XIcon } from '@/components/icons/x-icon'
import { useTranslation } from '@/lib/i18n'
import { useLocale } from '@/lib/i18n'
import { TypographyH3, TypographyP, TypographyLarge, TypographySmall } from '@/lib/typography'

interface ProfileCardProps {
  profileData: any
  formData?: any
  isEditable?: boolean
  onAvatarUpload?: (file: File) => void
  className?: string
}

export function ProfileCard({ 
  profileData, 
  formData, 
  isEditable = false, 
  onAvatarUpload,
  className = ""
}: ProfileCardProps) {
  // Use formData if available (edit mode), otherwise use profileData
  const data = formData || profileData
  const { t } = useTranslation()
  const { locale } = useLocale()
  
  const handleAvatarClick = () => {
    if (isEditable) {
      document.getElementById('avatar-upload')?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onAvatarUpload) {
      onAvatarUpload(file)
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="text-center pb-4">
        <div className="relative mx-auto w-24 h-24 mb-4">
          <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
            <AvatarImage 
              src={data?.avatar_url} 
              alt={data?.full_name || data?.username} 
            />
            <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
              {(data?.full_name || data?.username)?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {isEditable && (
            <>
              <Button
                size="sm"
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full p-0"
                onClick={handleAvatarClick}
              >
                <Camera className="w-4 h-4" />
              </Button>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <TypographyH3>
              {data?.full_name || data?.username}
            </TypographyH3>
            {data?.is_pro && <ProBadge variant="small" />}
            {data?.banned_until && new Date(data.banned_until) > new Date() && (
              <>
                <Badge variant="destructive">{t('common.banned')}</Badge>
                {data?.ban_reason && (
                  <TypographySmall className="text-red-600 ml-1">{data.ban_reason}</TypographySmall>
                )}
              </>
            )}
          </div>
          <TypographyP className="text-muted-foreground">@{data?.username}</TypographyP>
          {data?.title && (
            <Badge variant="secondary" className="text-xs">
              {data?.title}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <TypographyLarge>{data?.following_count || 0}</TypographyLarge>
            <TypographySmall className="text-muted-foreground">{t('common.following')}</TypographySmall>
          </div>
          <div>
            <TypographyLarge>{data?.followers_count || 0}</TypographyLarge>
            <TypographySmall className="text-muted-foreground">{t('common.followers')}</TypographySmall>
          </div>
          <div>
            <TypographyLarge>{data?.catches_count || 0}</TypographyLarge>
            <TypographySmall className="text-muted-foreground">{t('common.catches')}</TypographySmall>
          </div>
          <div>
            <TypographyLarge>{data?.spots_count || 0}</TypographyLarge>
            <TypographySmall className="text-muted-foreground">{t('common.spots')}</TypographySmall>
          </div>
        </div>

        <Separator />

        {/* Profile Details */}
        <div className="space-y-3">
          {data?.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <TypographySmall>{data.location}</TypographySmall>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <TypographySmall>{new Date(data?.created_at || Date.now()).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
              year: 'numeric',
              month: 'long'
            })} {t('common.joined')}</TypographySmall>
          </div>
          {data?.last_active_at && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <TypographySmall>{t('common.lastSeen')} {new Date(data.last_active_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}</TypographySmall>
            </div>
          )}
        </div>

        {/* Social Links */}
        {(data?.website || data?.instagram_url || data?.facebook_url || data?.youtube_url || data?.twitter_url) && (
          <>
            <Separator />
            <div className="flex justify-center gap-3">
              {data?.website && (
                <a href={data.website} target="_blank" rel="noopener noreferrer" 
                   className="text-blue-500 hover:text-blue-600 transition-colors">
                  <Globe className="h-5 w-5" />
                </a>
              )}
              {data?.instagram_url && (
                <a href={data.instagram_url} target="_blank" rel="noopener noreferrer"
                   className="text-pink-500 hover:text-pink-600 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {data?.facebook_url && (
                <a href={data.facebook_url} target="_blank" rel="noopener noreferrer"
                   className="text-blue-600 hover:text-blue-700 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {data?.youtube_url && (
                <a href={data.youtube_url} target="_blank" rel="noopener noreferrer"
                   className="text-red-500 hover:text-red-600 transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {data?.twitter_url && (
                <a href={data.twitter_url} target="_blank" rel="noopener noreferrer"
                   className="text-black hover:text-gray-700 dark:text-white dark:hover:text-gray-300 transition-colors">
                  <XIcon className="h-5 w-5" />
                </a>
              )}
            </div>
          </>
        )}

        {/* View Profile Button (only in edit mode) */}
        {isEditable && (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                window.open(`/${locale}/${data?.username}`, '_blank');
              }}
            >
              {t('common.viewProfile')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}