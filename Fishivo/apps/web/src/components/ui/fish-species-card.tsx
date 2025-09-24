"use client"

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card'
import { Fish, MapPin, Ruler, Weight } from 'lucide-react'
import { getConservationStatusBadgeProps, getConservationStatusInfo } from '@/lib/utils'
import * as React from 'react'
import { TypographyH3, TypographySmall } from '@/lib/typography'
import { getProxiedImageUrl } from '@/lib/r2-image-helper'
import { ProtectedImage } from '@/components/ui/protected-image'

// Geçici tip tanımlaması
interface Species {
  id: string
  name: string
  scientific_name?: string
  image_url?: string
}

// Extended Species type with additional fields from database
interface ExtendedSpecies extends Species {
  family?: string;
  order?: string;
  water_type?: string | null;
  conservation_status?: string;
  min_size?: number;
  max_size?: number;
  avg_weight?: number;
  max_weight?: number;
}

interface FishSpeciesCardProps {
  fish: ExtendedSpecies
  locale: 'tr' | 'en'
  labels: {
    habitat: string
    bestSeason: string
    size: string
    weight: string
    bestBait: string
    difficulty: string
  }
}

// Helper function to create URL-friendly slug
function createSlug(scientificName: string): string {
  return scientificName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
}

export function FishSpeciesCard({ fish, locale, labels }: FishSpeciesCardProps) {
  const router = useRouter()
  const [imageError, setImageError] = React.useState(false)
  
  const handleClick = () => {
    const slug = createSlug(fish.scientific_name || fish.name)
    router.push(`/${locale}/fish-species/${slug}`)
  }
  

  return (
    <CardContainer className="inter-var w-full">
      <CardBody 
        className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-blue-500/[0.1] dark:bg-card dark:border-white/[0.2] border-black/[0.1] w-full h-auto rounded-xl p-6 border cursor-pointer"
        onClick={handleClick}
      >
        
        {/* Fish Image */}
        <CardItem translateZ="100" className="w-full">
          <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden">
            {fish.image_url && !imageError ? (
              <div className="absolute inset-0">
                <ProtectedImage
                  src={fish.image_url}
                  alt={fish.name}
                  className="w-full h-full"
                  enableBase64={false}
                  onError={() => {
                    setImageError(true);
                  }}
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <Fish className="h-20 w-20 text-blue-400" />
              </div>
            )}
          </div>
        </CardItem>

        {/* Header */}
        <CardItem translateZ="50" className="mt-4">
          <TypographyH3 className="text-neutral-600 dark:text-white">
            {fish.name}
          </TypographyH3>
        </CardItem>
        {fish.scientific_name && (
          <CardItem translateZ="60">
            <TypographySmall className="text-muted-foreground italic">
              {fish.scientific_name}
            </TypographySmall>
          </CardItem>
        )}
        <CardItem
          translateZ="40"
          className="mt-1 mb-3"
        >
          <TypographySmall className="text-muted-foreground">
            {locale === 'tr' ? 'Familya: ' : 'Family: '}{fish.family}
          </TypographySmall>
        </CardItem>

        {/* Conservation Status */}
        {fish.conservation_status && (
          <CardItem translateZ="60" className="w-full mt-2">
            <div className="inline-flex items-center gap-2">
              <Badge 
                {...getConservationStatusBadgeProps(fish.conservation_status, locale)}
                className={`text-xs font-semibold ${getConservationStatusBadgeProps(fish.conservation_status, locale).className}`}
                title={getConservationStatusInfo(fish.conservation_status)?.label[locale]}
              >
                {getConservationStatusBadgeProps(fish.conservation_status, locale).children}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {getConservationStatusInfo(fish.conservation_status)?.label[locale]}
              </span>
            </div>
          </CardItem>
        )}

        {/* Habitat section removed - not filled in admin form */}

        {/* View Details Text */}
        <CardItem
          translateZ="20"
          className="mt-4"
        >
          <TypographySmall className="text-blue-600 dark:text-blue-400 font-medium">
            {locale === 'tr' ? 'Detayları Görüntüle →' : 'View Details →'}
          </TypographySmall>
        </CardItem>
      </CardBody>
    </CardContainer>
  )
}
