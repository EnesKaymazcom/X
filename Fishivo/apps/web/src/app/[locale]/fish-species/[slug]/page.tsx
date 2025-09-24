"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageContainer } from '@/components/ui/page-container'
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ReviewSection } from '@/components/ui/review-section'
import { CommunityStats } from '@/components/ui/community-stats'
import { ConservationStatusChart } from '@/components/ui/conservation-status-chart'
import { SectionHeader } from '@/components/ui/section-header'
import { getProxiedImageUrl } from '@/lib/r2-image-helper'
import { 
  Fish, 
  AlertTriangle, 
  MapPin, 
  Ruler, 
  Weight, 
  Calendar, 
  Sparkles,
  ChevronLeft,
  Info,
  Waves,
  Thermometer,
  TrendingUp,
  Share2,
  Home,
  Shield,
  Globe,
  Users,
  Layers,
  Utensils,
  Heart,
  Star,
  Calendar
} from 'lucide-react'
import { TypographySmall, TypographyH2, TypographyH3 } from '@/lib/typography'
import { RatingDisplay } from '@/components/ui/rating'
import { useI18n } from '@/lib/i18n'
import { useRateLimiter } from '@/hooks/use-rate-limiter'
import { speciesServiceWeb } from '@fishivo/api/services/species/species.web'
import { FishSpecies, SpeciesStatistics, SpeciesReview } from '@fishivo/types'
import { createSupabaseBrowserClient } from '@fishivo/api/client/supabase.web'
import { FishSpeciesCard } from '@/components/ui/fish-species-card'
import { BackButton } from '@/components/ui/back-button'
import { getFeedingType } from '@/lib/feeding-types'
import { getHabitatType } from '@/lib/fish-habitats'
import { getConservationStatusBadgeProps, getConservationStatusTooltip, cn } from '@/lib/utils'
import { AppDownloadPrompt } from '@/components/ui/app-download-prompt'
import { ProtectedImage } from '@/components/ui/protected-image'
import Head from 'next/head'




// Breadcrumb component
function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  const router = useRouter()
  
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      <Button
        variant="ghost"
        size="sm"
        className="p-0 h-auto"
        onClick={() => router.push('/')}
      >
        <Home className="h-4 w-4" />
      </Button>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <span>/</span>
          {item.href ? (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto font-normal"
              onClick={() => router.push(item.href!)}
            >
              {item.label}
            </Button>
          ) : (
            <span>{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>

      {/* Image Skeleton */}
      <Skeleton className="h-96 w-full rounded-xl" />

      {/* Details Grid Skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  const { t } = useI18n()
  const router = useRouter()
  
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Alert variant="destructive" className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>{t('errors.general')}</strong>
          <br />
          {message}
        </AlertDescription>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
      </Alert>
    </div>
  )
}

export default function FishSpeciesDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [species, setSpecies] = useState<FishSpecies | null>(null)
  const [relatedSpecies, setRelatedSpecies] = useState<FishSpecies[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [statistics, setStatistics] = useState<SpeciesStatistics | null>(null)
  const [reviews, setReviews] = useState<SpeciesReview[]>([])
  const [userReview, setUserReview] = useState<SpeciesReview | null>(null)
  const [communityStats, setCommunityStats] = useState<any | null>(null)
  const { t, locale } = useI18n()
  
  // Rate limiter hook'u kullan
  const rateLimiter = useRateLimiter({
    maxAttempts: 4,
    timeWindow: 10000,
    blockDuration: 24 * 60 * 60 * 1000,
    minDelay: 1000,
    storageKey: 'followButtonBlock'
  })
  
  const slug = params.slug as string
  
  // Type guard for slug
  if (!slug) {
    return null
  }

  useEffect(() => {
    const fetchSpeciesDetail = async () => {
      try {
        
        // Önce slug ile ara
        let species = await speciesServiceWeb.getSpeciesBySlug(slug)
        
        // Eğer slug ile bulamazsa, scientific name ile dene
        if (!species) {
          
          // Slug'ı scientific name'e çevir (kebab-case to Title Case)
          const scientificName = slug
            .split('-')
            .map((word, index) => index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)
            .join(' ')
          
          // Search by scientific name
          const searchResults = await speciesServiceWeb.searchSpecies(scientificName, 1)
          if (searchResults.length > 0 && searchResults[0].scientific_name === scientificName) {
            species = searchResults[0]
          }
        }
        
        if (!species) {
          throw new Error('Species not found')
        }
        
        setSpecies(species)
        
        // Follow durumunu kontrol et - hata durumunda devam et
        try {
          const following = await speciesServiceWeb.isFollowingSpecies(species.id)
          setIsFollowing(following)
        } catch (err) {
          console.log('Could not fetch follow status:', err)
        }
        
        // İstatistikleri getir - hata durumunda devam et
        try {
          const stats = await speciesServiceWeb.getSpeciesStatistics(species.id)
          setStatistics(stats)
        } catch (err) {
          console.log('Could not fetch statistics:', err)
        }
        
        // Yorumları getir - hata durumunda devam et
        try {
          const speciesReviews = await speciesServiceWeb.getSpeciesReviews(species.id)
          setReviews(speciesReviews)
        } catch (err) {
          console.log('Could not fetch reviews:', err)
        }
        
        // Kullanıcının yorumunu getir - hata durumunda devam et
        try {
          const userSpeciesReview = await speciesServiceWeb.getUserReviewForSpecies(species.id)
          setUserReview(userSpeciesReview)
        } catch (err) {
          console.log('Could not fetch user review:', err)
        }
        
        // Topluluk istatistiklerini getir - hata durumunda devam et
        try {
          const stats = await speciesServiceWeb.getCommunityStats(species.id)
          setCommunityStats(stats)
        } catch (err) {
          console.log('Could not fetch community stats:', err)
        }
        
        // İlgili balıkları getir (aynı familyadan)
        const { data: relatedSpecies } = await speciesServiceWeb.getSpecies({
          family: species.family,
          limit: 5
        })
        
        // Filter out current species
        const filteredRelated = relatedSpecies.filter(s => s.id !== species.id).slice(0, 4)
        
        if (filteredRelated.length > 0) {
          setRelatedSpecies(filteredRelated)
        }
      } catch (err) {
        setError(t('fishSpecies.speciesNotFound'))
      } finally {
        setLoading(false)
      }
    }

    fetchSpeciesDetail()
  }, [slug, locale])

  if (loading) {
    return (
      <PageContainer>
        <DetailSkeleton />
      </PageContainer>
    )
  }

  if (error || !species) {
    return (
      <PageContainer>
        <ErrorState message={error || t('fishSpecies.speciesNotFound')} />
      </PageContainer>
    )
  }
  
  // Helper function to get fish name based on locale
  const getFishDisplayName = (fish: FishSpecies): string => {
    if (locale === 'tr' && fish.common_names_tr && fish.common_names_tr.length > 0) {
      return fish.common_names_tr[0]
    }
    return fish.common_name
  }
  
  // Helper function to get description based on locale
  const getDescription = (fish: FishSpecies): string | undefined => {
    if (locale === 'tr') {
      return fish.description_tr
    }
    return fish.description_en
  }
  

  // SEO Meta data
  const pageTitle = `${getFishDisplayName(species)} - ${species.scientific_name} | Fishivo`
  const pageDescription = getDescription(species) || 
    `${getFishDisplayName(species)} (${species.scientific_name}) - ${species.family} familyasından bir balık türü. Maksimum boy: ${species.max_length}cm, Maksimum ağırlık: ${species.max_weight}kg.`
  const pageUrl = `https://fishivo.com/${locale}/fish-species/${slug}`
  const pageImage = species.image_url || 'https://fishivo.com/og-image.jpg'

  // Paylaşım fonksiyonu
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pageTitle,
          text: pageDescription,
          url: window.location.href
        })
      } catch (err) {
      }
    } else {
      // Fallback: URL'yi kopyala
      navigator.clipboard.writeText(window.location.href)
      // Toast mesajı gösterilebilir
    }
  }
  

  // Follow/Unfollow fonksiyonu
  const handleFollowToggle = async () => {
    if (!species) return
    
    // Block kontrolü
    if (rateLimiter.isBlocked) {
      const remainingTime = rateLimiter.getRemainingBlockTime()
      if (remainingTime > 0) {
        alert(locale === 'tr' 
          ? `Çok fazla işlem yaptınız. ${remainingTime} saat sonra tekrar deneyebilirsiniz.` 
          : `Too many attempts. Please try again in ${remainingTime} hours.`)
      }
      return
    }
    
    // Rate limiter ile aksiyonu handle et
    await rateLimiter.handleAction(async () => {
      // Login kontrolü
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
        router.push(`/${locale}/login?redirect=/fish-species/${slug}`)
        return
      }
      
      setFollowLoading(true)
      try {
        if (isFollowing) {
          await speciesServiceWeb.unfollowSpecies(species.id)
          setIsFollowing(false)
          if (statistics) {
            setStatistics({
              ...statistics,
              follower_count: Math.max(0, statistics.follower_count - 1)
            })
          }
        } else {
          await speciesServiceWeb.followSpecies(species.id)
          setIsFollowing(true)
          if (statistics) {
            setStatistics({
              ...statistics,
              follower_count: statistics.follower_count + 1
            })
          }
        }
      } catch (error: any) {
        console.error('Follow toggle error:', error)
        // Tablo yoksa kullanıcıya bilgi ver
        if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
          alert(locale === 'tr' 
            ? 'Takip sistemi henüz aktif değil. Lütfen daha sonra tekrar deneyin.' 
            : 'Follow system is not active yet. Please try again later.')
        }
      } finally {
        setFollowLoading(false)
      }
    })
    
    // Eğer block uygulandıysa kullanıcıyı bilgilendir
    if (rateLimiter.isBlocked) {
      alert(locale === 'tr' 
        ? 'Çok fazla işlem yaptınız. 24 saat boyunca takip işlemi yapamazsınız.' 
        : 'Too many attempts. Follow feature blocked for 24 hours.')
    }
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`${species.common_name}, ${species.scientific_name}, ${species.family}, balık türleri, fish species`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageImage} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={pageUrl} />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": pageTitle,
              "description": pageDescription,
              "image": pageImage,
              "url": pageUrl,
              "datePublished": species.created_at,
              "dateModified": species.updated_at || species.created_at,
              "author": {
                "@type": "Organization",
                "name": "Fishivo"
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": pageUrl
              },
              "about": {
                "@type": "Thing",
                "name": species.scientific_name,
                "alternateName": getFishDisplayName(species),
                "description": pageDescription
              }
            })
          }}
        />
      </Head>
      
      <PageContainer>
        {/* Header with Action Buttons */}
        <PageHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 w-full">
            <div className="flex-1">
              <PageHeaderHeading>{getFishDisplayName(species)}</PageHeaderHeading>
              <PageHeaderDescription className="italic">
                {species.scientific_name}
              </PageHeaderDescription>
              {statistics && (
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-blue-600" />
                    {statistics.follower_count} {locale === 'tr' ? 'takipçi' : 'followers'}
                  </span>
                  <RatingDisplay 
                    rating={statistics.average_rating || 0} 
                    count={statistics.review_count}
                    size="small"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 md:flex-shrink-0">
              <BackButton 
                href={`/${locale}/fish-species`}
                label={locale === 'tr' ? 'Tüm Türler' : 'All Species'}
                variant="secondary"
                size="sm"
                showIcon={true}
                iconType="chevron"
              />
              <Button
                variant="default"
                size="sm"
                onClick={handleFollowToggle}
                disabled={followLoading || rateLimiter.isBlocked}
                className={cn(
                  "gap-2", 
                  !isFollowing && !rateLimiter.isBlocked && "bg-blue-600 hover:bg-blue-700",
                  rateLimiter.isBlocked && "opacity-50 cursor-not-allowed"
                )}
                title={rateLimiter.isBlocked ? (locale === 'tr' ? 'Çok fazla işlem. Lütfen bekleyin.' : 'Too many attempts. Please wait.') : ''}
              >
                <Heart className={cn("h-4 w-4", isFollowing && "fill-current")} />
                {isFollowing 
                  ? (locale === 'tr' ? 'Takip Ediliyor' : 'Following')
                  : (locale === 'tr' ? 'Takip Et' : 'Follow')
                }
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                {locale === 'tr' ? 'Paylaş' : 'Share'}
              </Button>
            </div>
          </div>
        </PageHeader>

      {/* 2 Column Layout - Image Left, Info Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6">
        {/* Left Column - Responsive Image */}
        <div className="order-1 lg:order-1 space-y-4 lg:space-y-6">
          <Card className="overflow-hidden">
            <div className="relative w-full aspect-[3/2]">
              {species.image_url && !imageError ? (
                <ProtectedImage
                  src={species.image_url}
                  alt={getFishDisplayName(species)}
                  className="absolute inset-0 w-full h-full z-10"
                  enableBase64={true}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <Fish className="h-24 w-24 text-blue-400" />
                </div>
              )}
            </div>
          </Card>
          
          {/* General Information - Moved to left column */}
          {getDescription(species) && (
            <div className="space-y-4">
              <SectionHeader 
                title={t('fishSpecies.details.generalInfo')}
              />
              <Card>
                <CardContent className="p-4">
                <TypographySmall className="leading-relaxed whitespace-pre-wrap">
                  {getDescription(species)}
                </TypographySmall>
                </CardContent>
              </Card>
            </div>
          )}

          {/* App Download Prompt */}
          <div className="mt-6">
            <AppDownloadPrompt 
              customSubtitle={t('fishSpecies.wantToKnowMoreAboutSpecies')}
            />
          </div>
        </div>

        {/* Right Column - Key Information */}
        <div className="order-2 lg:order-2 space-y-4 lg:space-y-6">
        {/* Temel Bilgiler */}
        <div className="space-y-4">
          <SectionHeader 
            title={t('fishSpecies.details.basicInfo')}
          />
          <Card>
            <CardContent className="p-4 space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <TypographySmall className="text-muted-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  {t('fishSpecies.details.scientificName')}:
                </TypographySmall>
                <TypographySmall className="italic">{species.scientific_name}</TypographySmall>
              </div>
              
              {((locale === 'en' && species.common_names_en && species.common_names_en.length > 0) ||
                (locale === 'tr' && species.common_names_tr && species.common_names_tr.length > 0)) && (
                <div className="flex justify-between items-start">
                  <TypographySmall className="text-muted-foreground flex items-center gap-2">
                    <Fish className="h-4 w-4 text-muted-foreground" />
                    {t('fishSpecies.details.commonNames')}:
                  </TypographySmall>
                  <TypographySmall className="text-right">
                    {locale === 'tr' 
                      ? species.common_names_tr?.join(', ')
                      : species.common_names_en?.join(', ')}
                  </TypographySmall>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <TypographySmall className="text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {t('fishSpecies.details.family')}:
                </TypographySmall>
                <TypographySmall>{species.family}</TypographySmall>
              </div>
              
              {species.order && (
                <div className="flex justify-between items-center">
                  <TypographySmall className="text-muted-foreground flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    {t('fishSpecies.details.order')}:
                  </TypographySmall>
                  <TypographySmall>{species.order}</TypographySmall>
                </div>
              )}
              
              
              {species.habitats && species.habitats.length > 0 && (
                <div className="flex justify-between items-start">
                  <TypographySmall className="text-muted-foreground flex items-center gap-2">
                    <Waves className="h-4 w-4 text-muted-foreground" />
                    {t('fishSpecies.details.waterType')}:
                  </TypographySmall>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {species.habitats.map((h, idx) => {
                      const habitat = getHabitatType(h, locale)
                      return habitat ? (
                        <Badge key={idx} variant="outline">
                          {habitat.label}
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}
              
              {species.feeding_types && species.feeding_types.length > 0 && (
                <div className="flex justify-between items-center">
                  <TypographySmall className="text-muted-foreground flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-muted-foreground" />
                    {locale === 'tr' ? 'Beslenme Tipleri' : 'Feeding Types'}:
                  </TypographySmall>
                  <div className="flex flex-wrap gap-1">
                    {species.feeding_types.map((type, idx) => (
                      <Badge key={idx} variant="outline">
                        {getFeedingType(type, locale)?.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            </CardContent>
          </Card>
        </div>

        {/* Conservation Status Chart */}
        {species.conservation_status && (
          <div className="space-y-4">
            <SectionHeader 
              title={locale === 'tr' ? 'Koruma Durumu' : 'Conservation Status'}
            />
            <Card>
              <CardContent className="p-4">
              <ConservationStatusChart
                currentStatus={species.conservation_status}
                locale={locale}
                size="small"
                showLabels={true}
              />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fiziksel Özellikler */}
        <div className="space-y-4">
          <SectionHeader 
            title={t('fishSpecies.details.physicalCharacteristics')}
          />
          <Card>
            <CardContent className="p-4 space-y-3">
            {species.max_length && (
              <div className="flex justify-between items-center">
                <TypographySmall className="text-muted-foreground flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  {t('fishSpecies.details.maxLength')}:
                </TypographySmall>
                <TypographySmall className="font-medium">
                  {species.max_length} {t('fishSpecies.details.units.cm')}
                </TypographySmall>
              </div>
            )}
            
            {species.max_weight && (
              <div className="flex justify-between items-center">
                <TypographySmall className="text-muted-foreground flex items-center gap-2">
                  <Weight className="h-4 w-4" />
                  {t('fishSpecies.details.maxWeight')}:
                </TypographySmall>
                <TypographySmall className="font-medium">
                  {species.max_weight} {t('fishSpecies.details.units.kg')}
                </TypographySmall>
              </div>
            )}
            
            {(species.min_depth !== null || species.max_depth !== null) && (
              <div className="flex justify-between items-center">
                <TypographySmall className="text-muted-foreground flex items-center gap-2">
                  <Waves className="h-4 w-4" />
                  {t('fishSpecies.details.depthRange')}:
                </TypographySmall>
                <TypographySmall className="font-medium">
                  {species.min_depth || 0} - {species.max_depth || '?'} {t('fishSpecies.details.units.meters')}
                </TypographySmall>
              </div>
            )}
            </CardContent>
          </Card>
        </div>

        {/* Habitat */}
        {species.habitats && species.habitats.length > 0 && (
          <div className="space-y-4">
            <SectionHeader 
              title={t('fishSpecies.details.habitat')}
            />
            <Card>
              <CardContent className="p-4">
              <div className="space-y-2">
                {species.habitats.map((h, idx) => {
                  const habitat = getHabitatType(h, locale)
                  if (!habitat) return null
                  
                  return (
                    <div key={idx} className="grid grid-cols-[auto_1fr] gap-3 items-center">
                      <Badge variant="outline">
                        {habitat.label}
                      </Badge>
                      <TypographySmall className="text-muted-foreground" >
                        {habitat.description}
                      </TypographySmall>
                    </div>
                  )
                })}
              </div>
              </CardContent>
            </Card>
          </div>
        )}

        </div>
      </div>



      {/* Community Stats */}
      <CommunityStats stats={communityStats} locale={locale} />

      {/* Reviews Section */}
      <ReviewSection
        reviews={reviews}
        userReview={userReview}
        locale={locale}
      />

      

        {/* İlgili Balıklar */}
        {relatedSpecies.length > 0 && (
          <div className="mb-8 space-y-4">
            <SectionHeader title={t('fishSpecies.relatedSpecies')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedSpecies.map((fish) => {
                // Determine water type based on first habitat
                let water_type = null
                if (fish.habitats && fish.habitats.length > 0) {
                  const habitat = getHabitatType(fish.habitats[0], locale)
                  water_type = habitat?.label || fish.habitats[0]
                }
                
                return (
                  <FishSpeciesCard
                    key={fish.id}
                    fish={{
                      id: fish.id,
                      name: locale === 'tr' && fish.common_names_tr?.[0] ? fish.common_names_tr[0] : fish.common_name,
                      scientific_name: fish.scientific_name,
                      image_url: fish.image_url,
                      family: fish.family,
                      water_type: water_type,
                      conservation_status: fish.conservation_status,
                      min_size: undefined,
                      max_size: fish.max_length,
                      avg_weight: undefined,
                      max_weight: fish.max_weight
                    }}
                    locale={locale}
                    labels={{
                      habitat: t('fishSpecies.habitat'),
                      bestSeason: t('fishSpecies.bestSeason'),
                      size: t('fishSpecies.size'),
                      weight: t('fishSpecies.weight'),
                      bestBait: t('fishSpecies.bestBait'),
                      difficulty: t('fishSpecies.difficulty')
                    }}
                  />
                )
              })}
            </div>
          </div>
        )}
      </PageContainer>
    </>
  )
}
