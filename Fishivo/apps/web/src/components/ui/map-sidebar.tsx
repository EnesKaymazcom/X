"use client"

import { useState } from 'react'
import { Layers, Map, Satellite, ChevronRight, ChevronLeft, Sun, Moon, Mountain, Anchor, Waves, Globe, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'
import { cn } from "@/lib/utils"
import { TypographyH6, TypographySmall } from '@/lib/typography'

interface MapSidebarProps {
  onStyleChange: (style: string) => void
  currentStyle: string
  isOpenFreeMap?: boolean
}

const getMapStyles = (t: any) => {
  return [
    {
      id: 'bright',
      name: 'Terrain',
      description: 'Açık renk harita stili',
      icon: Sun,
      style: 'https://tiles.openfreemap.org/styles/bright'
    },
    {
      id: 'hybrid',
      name: 'Uydu',
      description: 'Uydu + sokak isimleri',
      icon: Satellite,
      style: 'maptiler-hybrid'
    }
  ]
}

// Denizcilik overlay katmanları (ileride eklenecek)
const getOverlayLayers = () => {
  return [
    {
      id: 'openseamap',
      name: 'OpenSeaMap',
      description: 'Denizcilik haritası',
      icon: Anchor,
      enabled: false
    },
    {
      id: 'bathymetry',
      name: 'Derinlik Haritası',
      description: 'Deniz derinlik kontürleri',
      icon: Waves,
      enabled: false
    }
  ]
}


export function MapSidebar({ onStyleChange, currentStyle, isOpenFreeMap }: MapSidebarProps) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  
  const mapStyles = getMapStyles(t)
  const overlayLayers = getOverlayLayers()

  return (
    <div className="absolute top-0 left-0 h-full z-10 flex">
      {/* Main Sidebar - Always Visible */}
      <div className="bg-white/95 dark:bg-background/95 backdrop-blur-sm border-r dark:border-border shadow-lg h-full w-[58px] flex flex-col">
        {/* Toggle Button */}
        <div className="p-2 border-b dark:border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full h-8 p-0 hover:bg-gray-100 dark:hover:bg-accent"
          >
            {isExpanded ? (
              <ChevronLeft className="h-[18px] w-[18px] text-foreground" />
            ) : (
              <ChevronRight className="h-[18px] w-[18px] text-foreground" />
            )}
          </Button>
        </div>

        {/* Icon-only Menu Items */}
        <div className="flex-1 py-2">
          {/* Map Styles */}
          <div className="mb-4">
            {mapStyles.map((mapStyle) => {
              const IconComponent = mapStyle.icon
              return (
                <button
                  key={mapStyle.id}
                  onClick={() => {
                    onStyleChange(mapStyle.style)
                    if (!isExpanded) setIsExpanded(true)
                  }}
                  className={cn(
                    "w-10 h-10 mx-auto flex items-center justify-center hover:bg-gray-100 dark:hover:bg-accent transition-colors mb-1 rounded-md relative",
                    currentStyle === mapStyle.style ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                  title={mapStyle.name}
                >
                  <IconComponent className="h-[18px] w-[18px]" />
                </button>
              )
            })}
          </div>

        </div>
      </div>

      {/* Expanded Panel */}
      <div className={cn(
        "bg-white/95 dark:bg-background/95 backdrop-blur-sm shadow-lg h-full border-r dark:border-border transition-all duration-300 ease-in-out overflow-hidden",
        isExpanded ? "w-64 opacity-100" : "w-0 opacity-0"
      )}>
        {isExpanded && (
          <div className="p-4 min-w-64">
            {/* Map Styles Section */}
            <div className="mb-6">
              <TypographyH6 className="mb-3">{t('map.mapLayers')}</TypographyH6>
              <div className="space-y-1">
                {mapStyles.map((mapStyle) => {
                  const IconComponent = mapStyle.icon
                  return (
                    <button
                      key={mapStyle.id}
                      onClick={() => onStyleChange(mapStyle.style)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors",
                        currentStyle === mapStyle.style ? "bg-primary/10 text-primary" : "text-muted-foreground"
                      )}
                    >
                      <IconComponent className="h-[18px] w-[18px]" />
                      <TypographySmall>{mapStyle.name}</TypographySmall>
                    </button>
                  )
                })}
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  )
}