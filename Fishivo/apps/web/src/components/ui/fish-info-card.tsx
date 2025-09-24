'use client'

import React from 'react'
import Image from 'next/image'
import { ChevronRight, Fish } from 'lucide-react'
import { cn, getConservationStatusBadgeProps, getConservationStatusInfo } from '@/lib/utils'
import { Badge } from './badge'
import { ProtectedImage } from './protected-image'

interface FishInfoCardProps {
  species: string
  speciesId?: string
  speciesImage?: string
  scientificName?: string
  conservationStatus?: string
  locale?: 'tr' | 'en'
  onPress?: () => void
}

export function FishInfoCard({
  species,
  speciesId,
  speciesImage,
  scientificName,
  conservationStatus,
  locale = 'en',
  onPress
}: FishInfoCardProps) {
  const isClickable = speciesId && onPress

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden relative border border-border",
        isClickable && "cursor-pointer hover:border-primary/50 transition-colors"
      )}
      onClick={isClickable ? onPress : undefined}
    >
      {/* Fish Image */}
      <div className="relative w-full aspect-[5/3]">
        {speciesImage ? (
          <ProtectedImage
            src={speciesImage}
            alt={species}
            className="absolute inset-0 w-full h-full"
            enableBase64={false}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted">
            <Fish className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Arrow indicator if clickable */}
        {isClickable && (
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-sm p-1 z-30">
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Fish Details */}
      <div className="px-4 py-3 bg-card border-t border-border">
        <div className="flex items-center justify-between gap-3">
          {/* Left side - Names */}
          <div className="space-y-1 flex-1">
            {/* Species Name */}
            <h4 className="text-base font-semibold truncate">
              {species}
            </h4>
            
            {/* Scientific Name */}
            {scientificName && (
              <p className="text-sm text-muted-foreground italic">
                {scientificName}
              </p>
            )}
          </div>
          
          {/* Right side - Conservation Status */}
          {conservationStatus && (
            <div className="flex flex-col items-end gap-2">
              <Badge 
                {...getConservationStatusBadgeProps(conservationStatus, locale)}
                className={`text-xs font-semibold ${getConservationStatusBadgeProps(conservationStatus, locale).className}`}
              >
                {getConservationStatusBadgeProps(conservationStatus, locale).children}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {getConservationStatusInfo(conservationStatus)?.label[locale]}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}