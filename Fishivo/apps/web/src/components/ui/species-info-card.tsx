'use client'

import React from 'react'
import Image from 'next/image'
import { ChevronRight, Fish, Ruler, Weight, Waves, Shield, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from './badge'
import { Card, CardContent } from './card'

interface SpeciesInfoCardProps {
  species: {
    id: string
    common_name: string
    scientific_name: string
    common_names_tr?: string[]
    description_tr?: string
    description_en?: string
    max_length?: number
    max_weight?: number
    min_depth?: number
    max_depth?: number
    habitats?: string[]
    conservation_status?: string
    image_url?: string
    slug?: string
  }
  locale?: string
  onPress?: () => void
}

const conservationStatusColors = {
  'LC': 'bg-green-500/10 text-green-600 border-green-500/20',
  'NT': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  'VU': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'EN': 'bg-red-500/10 text-red-600 border-red-500/20',
  'CR': 'bg-red-700/10 text-red-700 border-red-700/20',
  'EW': 'bg-gray-700/10 text-gray-700 border-gray-700/20',
  'EX': 'bg-black/10 text-black border-black/20'
}

const conservationStatusLabels = {
  'LC': 'En Az Endişe',
  'NT': 'Tehdide Yakın',
  'VU': 'Hassas',
  'EN': 'Tehlikede',
  'CR': 'Kritik Tehlikede',
  'EW': 'Doğada Tükenmiş',
  'EX': 'Tükenmiş'
}

export function SpeciesInfoCard({
  species,
  locale = 'tr',
  onPress
}: SpeciesInfoCardProps) {
  const isClickable = species.id && onPress
  const description = locale === 'tr' ? species.description_tr : species.description_en
  const commonName = locale === 'tr' && species.common_names_tr?.[0] 
    ? species.common_names_tr[0] 
    : species.common_name

  return (
    <Card 
      className={cn(
        "overflow-hidden",
        isClickable && "cursor-pointer hover:border-primary/50 transition-all duration-300"
      )}
      onClick={isClickable ? onPress : undefined}
    >
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
          {/* Sol: Görsel (2 kolon) */}
          <div className="md:col-span-2 relative aspect-[4/3] md:aspect-auto md:h-full bg-muted">
            {species.image_url ? (
              <Image
                src={species.image_url}
                alt={commonName}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <Fish className="w-20 h-20 text-muted-foreground/20" />
              </div>
            )}
            
            {/* Koruma durumu badge */}
            {species.conservation_status && (
              <div className="absolute top-3 left-3">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "backdrop-blur-md bg-background/90",
                    conservationStatusColors[species.conservation_status as keyof typeof conservationStatusColors]
                  )}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {conservationStatusLabels[species.conservation_status as keyof typeof conservationStatusLabels] || species.conservation_status}
                </Badge>
              </div>
            )}

            {/* Tıklanabilir göstergesi */}
            {isClickable && (
              <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full p-2">
                <ChevronRight className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Sağ: Bilgiler (3 kolon) */}
          <div className="md:col-span-3 p-6 space-y-4">
            {/* Başlık */}
            <div>
              <h3 className="text-2xl font-bold mb-1">{commonName}</h3>
              <p className="text-sm text-muted-foreground italic">{species.scientific_name}</p>
            </div>

            {/* Açıklama */}
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {description}
              </p>
            )}

            {/* Özellikler Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Maksimum Boy */}
              {species.max_length && (
                <div className="flex items-start gap-2">
                  <Ruler className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Maksimum Boy</p>
                    <p className="text-sm font-semibold">{species.max_length} cm</p>
                  </div>
                </div>
              )}

              {/* Maksimum Ağırlık */}
              {species.max_weight && (
                <div className="flex items-start gap-2">
                  <Weight className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Maksimum Ağırlık</p>
                    <p className="text-sm font-semibold">{species.max_weight} kg</p>
                  </div>
                </div>
              )}

              {/* Derinlik */}
              {(species.min_depth !== null || species.max_depth !== null) && (
                <div className="flex items-start gap-2">
                  <Waves className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Derinlik Aralığı</p>
                    <p className="text-sm font-semibold">
                      {species.min_depth || 0} - {species.max_depth || '?'} m
                    </p>
                  </div>
                </div>
              )}

              {/* Habitat */}
              {species.habitats && species.habitats.length > 0 && (
                <div className="flex items-start gap-2">
                  <Globe className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Habitat</p>
                    <p className="text-sm font-semibold capitalize">
                      {species.habitats.slice(0, 2).join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Alt bilgi */}
            {isClickable && (
              <p className="text-xs text-primary hover:underline pt-2">
                Detaylı bilgi için tıklayın →
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}