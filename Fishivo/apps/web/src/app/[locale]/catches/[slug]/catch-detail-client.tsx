'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useTheme } from 'next-themes'
import { formatDistanceToNow } from 'date-fns'
import { tr, enUS } from 'date-fns/locale'
import { 
  Heart, MessageCircle, Share2, MapPin, Fish, 
  Thermometer, Wind, Activity, Sun, Moon, Clock,
  RefreshCw, Ruler, Weight, UserPlus, User, MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ProBadge } from '@/components/ui/pro-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { FishInfoCard } from '@/components/ui/fish-info-card'
import { Label } from '@/components/ui/label'
import { CatchCardWeb } from '@/components/ui/catch-card-web'
import { AppDownloadPrompt } from '@/components/ui/app-download-prompt'
import { FishivoMarker } from '@/components/ui/fishivo-marker'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { likePostAction, unlikePostAction } from './actions'

// Dinamik olarak MapLibre'ı yükle
const Map = dynamic(
  () => import('react-map-gl/maplibre').then(mod => mod.Map),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-muted animate-pulse rounded-xl flex items-center justify-center">
        <MapPin className="w-8 h-8 text-muted-foreground/30" />
      </div>
    )
  }
)

const Marker = dynamic(
  () => import('react-map-gl/maplibre').then(mod => mod.Marker),
  { ssr: false }
)


interface PostDetailClientProps {
  postData: any
}

export default function CatchDetailClient({ postData }: PostDetailClientProps) {
  const { t, locale } = useI18n()
  const { theme } = useTheme()
  const [isLiked, setIsLiked] = useState(postData.isLiked)
  const [likeCount, setLikeCount] = useState(postData.likes)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [isReleased, setIsReleased] = useState(postData.released || false)
  const [isFollowing, setIsFollowing] = useState(false)

  const imageUrl = postData.images?.[0] || postData.image_url
  const timeAgo = formatDistanceToNow(new Date(postData.created_at), {
    addSuffix: true,
    locale: locale === 'tr' ? tr : enUS
  })

  const handleLike = async () => {
    if (!postData.currentUserId) {
      window.location.href = `/${locale}/login`
      return
    }

    setIsLikeLoading(true)
    try {
      setIsLiked(!isLiked)
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)

      const result = isLiked 
        ? await unlikePostAction(postData.id, postData.slug)
        : await likePostAction(postData.id, postData.slug)

      if (!result.success) {
        setIsLiked(!isLiked)
        setLikeCount(isLiked ? likeCount + 1 : likeCount - 1)
        toast.error(result.error || t('common.error'))
      }
    } catch (error) {
      setIsLiked(!isLiked)
      setLikeCount(isLiked ? likeCount + 1 : likeCount - 1)
      toast.error(t('common.error'))
    } finally {
      setIsLikeLoading(false)
    }
  }

  const handleShare = async () => {
    // Native ile uyumlu link yapısı oluştur
    const referrerId = postData.currentUserId || '';
    const shortReferrerId = referrerId.split('-')[0]; // İlk 8 karakter
    const referrerName = postData.currentUser?.full_name || 
                        postData.currentUser?.username || 
                        postData.currentUser?.email?.split('@')[0] || 
                        'User';
    
    // URL'e referrer parametreleri ekle
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('r', shortReferrerId);
    currentUrl.searchParams.set('n', referrerName);
    const shareUrl = currentUrl.toString();
    
    // Weight ve length formatını düzelt
    const parseWeightLength = (value: any, unit: string) => {
      if (!value) return '';
      const strValue = String(value);
      // Eğer değer zaten unit içeriyorsa, direkt kullan
      if (strValue.includes('kg') || strValue.includes('lbs') || 
          strValue.includes('cm') || strValue.includes('in')) {
        return strValue;
      }
      return `${strValue} ${unit}`;
    };
    
    const weight = parseWeightLength(postData.weight, postData.weight_unit || 'kg');
    const length = parseWeightLength(postData.length, postData.length_unit || 'cm');
    
    const text = t('common.sharePostMessage', {
      userName: postData.user.full_name || postData.user.username,
      fishSpecies: postData.fish_species || t('common.defaultFish'),
      weight: weight,
      length: length
    });
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('common.sharePostTitle'),
          text,
          url: shareUrl
        })
      } catch (error) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      toast.success(t('common.linkCopied'))
    }
  }

  // Coordinates for map
  let coordinates = null
  let hasValidCoordinates = false
  
  if (postData.coordinates && Array.isArray(postData.coordinates)) {
    coordinates = postData.coordinates
    hasValidCoordinates = true
  } else if (postData.location?.coordinates) {
    const coords = postData.location.coordinates
    if (coords.lng !== undefined && coords.lat !== undefined) {
      coordinates = [coords.lng, coords.lat]
      hasValidCoordinates = true
    } else if (coords.lon !== undefined && coords.lat !== undefined) {
      coordinates = [coords.lon, coords.lat]
      hasValidCoordinates = true
    } else if (Array.isArray(coords)) {
      coordinates = coords
      hasValidCoordinates = true
    }
  }
  
  // Validate coordinates
  if (hasValidCoordinates && coordinates) {
    const isValid = typeof coordinates[0] === 'number' && !isNaN(coordinates[0]) &&
                   typeof coordinates[1] === 'number' && !isNaN(coordinates[1])
    if (!isValid) {
      hasValidCoordinates = false
      coordinates = null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-8 md:py-10 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div>
          {/* Ana Grid Layout - 2 Kolon */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          
          {/* Sol Kolon - CATCH CARD (6/10 = %60 genişlik) */}
          <div className="lg:col-span-6 space-y-6">
            <CatchCardWeb
              postData={postData}
              locale={locale}
              timeAgo={timeAgo}
              onLike={handleLike}
              onShare={handleShare}
              isLikeLoading={isLikeLoading}
            />
            
            {/* App Download Prompt */}
            <AppDownloadPrompt />
          </div>

          {/* Sağ Kolon - TÜM BİLGİLER (4/10 = %40 genişlik) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Catch Details Section - EN ÜSTTE */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">{t('common.catchDetails')}</h3>
              
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                  {/* Weight */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Weight className="w-4 h-4" />
                      <span>{t('common.weight')}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {postData.weight ? `${postData.weight} ${postData.weight_unit || 'kg'}` : '-'}
                    </span>
                  </div>

                  {/* Length */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Ruler className="w-4 h-4" />
                      <span>{t('common.length')}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {postData.length ? `${postData.length} ${postData.length_unit || 'cm'}` : '-'}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{t('common.date')}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {new Date(postData.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Method */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Fish className="w-4 h-4" />
                      <span>{t('catches.method')}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {postData.method || postData.catch_details?.technique || '-'}
                    </span>
                  </div>

                  {/* Released Switch */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <RefreshCw className="w-4 h-4" />
                      <span>{t('catches.catchAndRelease')}</span>
                    </div>
                    <Switch
                      id="released"
                      checked={isReleased}
                      disabled
                      className="h-5 w-9"
                    />
                  </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Harita - Native'deki gibi */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">{t('catches.catchLocation')}</h3>
              
              {hasValidCoordinates && coordinates ? (
                <div className="h-64 relative bg-muted rounded-xl overflow-hidden border">
                <Map
                  mapLib={import('maplibre-gl')}
                  initialViewState={{
                    longitude: coordinates[0],
                    latitude: coordinates[1],
                    zoom: 14
                  }}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle="https://tiles.openfreemap.org/styles/liberty"
                >
                  <Marker
                    longitude={coordinates[0]}
                    latitude={coordinates[1]}
                    anchor="bottom"
                  >
                    <FishivoMarker />
                  </Marker>
                </Map>
                <div className="absolute bottom-0 left-0 right-0 bg-background/90 dark:bg-black/70 backdrop-blur-sm py-2 px-3 border-t">
                  <p className="text-foreground dark:text-white text-sm font-medium text-center">
                    {postData.location?.name || postData.location || postData.catch_location || t('common.unknown')}
                    {' • '}
                    {`${Math.abs(coordinates[1]).toFixed(4)}°${coordinates[1] >= 0 ? 'N' : 'S'}, ${Math.abs(coordinates[0]).toFixed(4)}°${coordinates[0] >= 0 ? 'E' : 'W'}`}
                  </p>
                </div>
                </div>
              ) : (
                <Card className="h-64 flex items-center justify-center bg-muted/20">
                  <CardContent className="text-center space-y-2">
                    <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      {postData.location?.name || postData.location || t('common.location')}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {t('catches.locationNotAvailable')}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Fish Info Section - Native'deki gibi */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">{t('common.fishInfo')}</h3>
              
              {/* FishInfoCard - Native'deki component */}
              <FishInfoCard
                species={postData.fish_species || postData.species?.common_name || t('common.unknown')}
                speciesId={postData.fish_species_id || postData.species?.id}
                speciesImage={postData.fish_species_image || postData.species?.image_url}
                scientificName={postData.species?.scientific_name}
                conservationStatus={postData.species?.conservation_status}
                locale={locale}
                onPress={postData.species ? () => {
                  window.location.href = `/${locale}/fish-species/${postData.species.slug || postData.species.id}`
                } : undefined}
              />
              
            </div>

            {/* Weather Section - Native'deki 6 kutulu grid */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">{t('common.weather')}</h3>
              
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Thermometer className="w-6 h-6 text-orange-500" />
                      <span className="text-xs text-muted-foreground">{t('common.temperature')}</span>
                      <span className="text-sm font-medium">
                        {postData.weather?.temperature ? `${postData.weather.temperature}°C` : '-'}
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Wind className="w-6 h-6 text-blue-500" />
                      <span className="text-xs text-muted-foreground">{t('common.wind')}</span>
                      <span className="text-sm font-medium">
                        {postData.weather?.wind ? `${postData.weather.wind} km/h` : '-'}
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Activity className="w-6 h-6 text-primary" />
                      <span className="text-xs text-muted-foreground">{t('common.pressure')}</span>
                      <span className="text-sm font-medium">
                        {postData.weather?.pressure ? `${postData.weather.pressure} mb` : '-'}
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Sun className="w-6 h-6 text-yellow-500" />
                      <span className="text-xs text-muted-foreground">{t('common.sun')}</span>
                      <span className="text-sm font-medium">
                        {postData.weather?.sun_direction || postData.catch_details?.weather?.sun_direction || '-'}
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Moon className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-muted-foreground">{t('common.moon')}</span>
                      <span className="text-sm font-medium">
                        {postData.weather?.moon_phase || postData.catch_details?.weather?.moon_phase || '-'}
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Clock className="w-6 h-6 text-primary" />
                      <span className="text-xs text-muted-foreground">{t('common.catchDate')}</span>
                      <span className="text-sm font-medium">
                        {new Date(postData.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Equipment Section - Native'deki gibi */}
            {postData.equipment && postData.equipment.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold">{t('catches.usedEquipment')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {postData.equipment.map((item: any, index: number) => (
                    <Card key={index} className="border-border/50">
                      <CardContent className="p-4">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{item.name || item}</p>
                          {item.category && (
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                          )}
                          {item.brand && (
                            <Badge variant="outline" className="text-xs mt-2">{item.brand}</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Live Bait Section - Native'deki gibi */}
            {postData.liveBait && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold">{t('common.liveBait')}</h3>
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Fish className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">{t('common.usedBait')}:</span>
                      <span className="text-sm font-medium">{postData.liveBait}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}