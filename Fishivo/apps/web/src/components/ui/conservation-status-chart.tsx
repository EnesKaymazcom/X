import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { getConservationStatusInfo } from '@/lib/utils'

interface ConservationStatusChartProps {
  currentStatus: string
  locale: 'tr' | 'en'
  showLabels?: boolean
  size?: 'small' | 'medium' | 'large'
  className?: string
}

// IUCN conservation status categories in order
const CONSERVATION_CATEGORIES = [
  { code: 'EX', group: 'extinct' },
  { code: 'EW', group: 'extinct' },
  { code: 'CR', group: 'threatened' },
  { code: 'EN', group: 'threatened' },
  { code: 'VU', group: 'threatened' },
  { code: 'NT', group: 'threatened' },
  { code: 'LC', group: 'leastConcern' }
]

const GROUP_LABELS = {
  extinct: {
    en: 'Extinct',
    tr: 'Tükenmiş'
  },
  threatened: {
    en: 'Threatened',
    tr: 'Tehdit Altında'
  },
  leastConcern: {
    en: 'Least Concern',
    tr: 'Düşük Risk'
  }
}

// IUCN resmi renk standartlarına yakın renkler
const getCategoryActiveColor = (code: string): string => {
  switch (code) {
    case 'EX': // Extinct - Koyu Gri (Dark mode için daha iyi görünürlük)
      return 'bg-gray-900 border-gray-900 dark:bg-gray-700 dark:border-gray-700'
    case 'EW': // Extinct in the Wild - Mor
      return 'bg-purple-900 border-purple-900'
    case 'CR': // Critically Endangered - Koyu Kırmızı
      return 'bg-red-700 border-red-700 dark:bg-red-600 dark:border-red-600'
    case 'EN': // Endangered - Turuncu
      return 'bg-orange-600 border-orange-600 dark:bg-orange-500 dark:border-orange-500'
    case 'VU': // Vulnerable - Sarı
      return 'bg-yellow-500 border-yellow-500 dark:bg-yellow-400 dark:border-yellow-400'
    case 'NT': // Near Threatened - Açık Yeşil
      return 'bg-lime-600 border-lime-600 dark:bg-lime-500 dark:border-lime-500'
    case 'LC': // Least Concern - Yeşil
      return 'bg-green-600 border-green-600 dark:bg-green-500 dark:border-green-500'
    default:
      return 'bg-gray-600 border-gray-600'
  }
}

const getRingColor = (code: string): string => {
  switch (code) {
    case 'EX': return 'ring-gray-900/20 dark:ring-gray-700/20'
    case 'EW': return 'ring-purple-900/20'
    case 'CR': return 'ring-red-700/20'
    case 'EN': return 'ring-orange-600/20'
    case 'VU': return 'ring-yellow-500/20'
    case 'NT': return 'ring-lime-600/20'
    case 'LC': return 'ring-green-600/20'
    default: return 'ring-gray-600/20'
  }
}

const getCategoryHoverColor = (code: string): string => {
  switch (code) {
    case 'EX': // Extinct - Koyu Gri
      return 'hover:bg-gray-900 hover:text-white hover:border-gray-900 dark:hover:bg-gray-700 dark:hover:text-white dark:hover:border-gray-700'
    case 'EW': // Extinct in the Wild - Mor
      return 'hover:bg-purple-900 hover:text-white hover:border-purple-900 dark:hover:bg-purple-900 dark:hover:text-white dark:hover:border-purple-900'
    case 'CR': // Critically Endangered - Koyu Kırmızı
      return 'hover:bg-red-700 hover:text-white hover:border-red-700 dark:hover:bg-red-600 dark:hover:text-white dark:hover:border-red-600'
    case 'EN': // Endangered - Turuncu
      return 'hover:bg-orange-600 hover:text-white hover:border-orange-600 dark:hover:bg-orange-500 dark:hover:text-white dark:hover:border-orange-500'
    case 'VU': // Vulnerable - Sarı
      return 'hover:bg-yellow-500 hover:text-white hover:border-yellow-500 dark:hover:bg-yellow-400 dark:hover:text-white dark:hover:border-yellow-400'
    case 'NT': // Near Threatened - Açık Yeşil
      return 'hover:bg-lime-600 hover:text-white hover:border-lime-600 dark:hover:bg-lime-500 dark:hover:text-white dark:hover:border-lime-500'
    case 'LC': // Least Concern - Yeşil
      return 'hover:bg-green-600 hover:text-white hover:border-green-600 dark:hover:bg-green-500 dark:hover:text-white dark:hover:border-green-500'
    default:
      return 'hover:bg-gray-600 hover:text-white hover:border-gray-600 dark:hover:bg-gray-500 dark:hover:text-white dark:hover:border-gray-500'
  }
}

export const ConservationStatusChart: React.FC<ConservationStatusChartProps> = ({
  currentStatus,
  locale = 'en',
  showLabels = true,
  size = 'medium',
  className
}) => {
  const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(null)
  const sizeConfig = {
    small: {
      circle: 'h-8 w-8 text-xs',
      gap: 'gap-2',
      groupGap: 'gap-4',
      fontSize: 'text-xs',
      padding: 'p-3'
    },
    medium: {
      circle: 'h-12 w-12 text-sm',
      gap: 'gap-3',
      groupGap: 'gap-6',
      fontSize: 'text-sm',
      padding: 'p-4'
    },
    large: {
      circle: 'h-16 w-16 text-base',
      gap: 'gap-4',
      groupGap: 'gap-8',
      fontSize: 'text-base',
      padding: 'p-6'
    }
  }

  const config = sizeConfig[size]

  // Group categories by their group
  const groups = CONSERVATION_CATEGORIES.reduce((acc, cat) => {
    if (!acc[cat.group]) {
      acc[cat.group] = []
    }
    acc[cat.group].push(cat)
    return acc
  }, {} as Record<string, typeof CONSERVATION_CATEGORIES>)

  const currentStatusUpper = currentStatus?.toUpperCase()

  return (
    <div className={cn('w-full', className)}>
      {/* Chart Container */}
      <div className={cn(
        'rounded-lg',
        config.padding
      )}>
        {/* Categories Grid */}
        <div className="flex items-center justify-between gap-2 md:gap-6">
          {Object.entries(groups).map(([groupKey, categories], groupIndex) => (
            <div key={groupKey} className="flex flex-col items-center flex-1">
              {/* Group Label */}
              {showLabels && (
                <div className={cn(
                  'text-gray-600 dark:text-gray-400 mb-2 text-center',
                  config.fontSize
                )}>
                  {GROUP_LABELS[groupKey as keyof typeof GROUP_LABELS][locale]}
                </div>
              )}
              
              {/* Categories in Group */}
              <div className={cn('flex items-center', config.gap)}>
                {categories.map((category, index) => {
                  const isActive = category.code === currentStatusUpper
                  const info = getConservationStatusInfo(category.code)
                  
                  const isHovered = hoveredCategory === category.code
                  
                  return (
                    <div key={category.code} className="relative group">
                      {/* Connection Line */}
                      {index > 0 && (
                        <div className="absolute left-0 top-1/2 w-full h-px bg-gray-300 dark:bg-gray-600 -translate-x-full" 
                             style={{ width: size === 'small' ? '8px' : size === 'medium' ? '12px' : '16px' }} />
                      )}
                      
                      {/* Status Circle */}
                      <button
                        className={cn(
                          'relative flex items-center justify-center rounded-full transition-all duration-200',
                          'border-2 font-semibold',
                          config.circle,
                          (isActive || isHovered) ? [
                            getCategoryActiveColor(category.code),
                            'text-white shadow-lg scale-110'
                          ] : [
                            'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600',
                            'hover:scale-105'
                          ]
                        )}
                        onMouseEnter={() => setHoveredCategory(category.code)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        title={info ? `${info.label[locale]}: ${info.description[locale]}` : category.code}
                      >
                        {category.code}
                        
                        {/* Active/Hover Indicator */}
                        {(isActive || isHovered) && (
                          <div className={cn(
                            "absolute inset-0 rounded-full ring-4",
                            getRingColor(category.code)
                          )} />
                        )}
                      </button>
                      
                      {/* Tooltip on Hover */}
                      {info && (
                        <div className={cn(
                          'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
                          'bg-gray-900 dark:bg-gray-700 text-white rounded px-2 py-1 text-xs',
                          'opacity-0 group-hover:opacity-100 transition-opacity',
                          'pointer-events-none whitespace-nowrap z-10',
                          'hidden md:block'
                        )}>
                          {info.label[locale]}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              
              {/* Group Separator */}
              {groupIndex < Object.keys(groups).length - 1 && (
                <div className={cn(
                  'hidden md:block absolute top-1/2 -translate-y-1/2',
                  'w-px bg-gray-300 dark:bg-gray-600'
                )} 
                style={{ 
                  right: '-1.5rem',
                  height: size === 'small' ? '2rem' : size === 'medium' ? '3rem' : '4rem'
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Attribution */}
        <div className={cn(
          'text-gray-500 dark:text-gray-400 text-center mt-4',
          size === 'small' ? 'text-xs' : 'text-sm'
        )}>
          *{locale === 'tr' ? 'IUCN Kırmızı Listesi kaynaklı' : 'sourced from IUNC Redlist'}
        </div>
      </div>

      {/* Current Status Info */}
      {currentStatusUpper && getConservationStatusInfo(currentStatusUpper) && (() => {
        const getStatusColors = (code: string) => {
          switch (code) {
            case 'EX':
              return {
                bg: 'bg-gray-100 dark:bg-gray-900/20',
                border: 'border-gray-300 dark:border-gray-700',
                titleText: 'text-gray-800 dark:text-gray-300',
                contentText: 'text-gray-700 dark:text-gray-400',
                descText: 'text-gray-600 dark:text-gray-400'
              }
            case 'EW':
              return {
                bg: 'bg-purple-50 dark:bg-purple-900/20',
                border: 'border-purple-200 dark:border-purple-800',
                titleText: 'text-purple-800 dark:text-purple-300',
                contentText: 'text-purple-700 dark:text-purple-400',
                descText: 'text-purple-600 dark:text-purple-400'
              }
            case 'CR':
              return {
                bg: 'bg-red-50 dark:bg-red-900/20',
                border: 'border-red-200 dark:border-red-800',
                titleText: 'text-red-800 dark:text-red-300',
                contentText: 'text-red-700 dark:text-red-400',
                descText: 'text-red-600 dark:text-red-400'
              }
            case 'EN':
              return {
                bg: 'bg-orange-50 dark:bg-orange-900/20',
                border: 'border-orange-200 dark:border-orange-800',
                titleText: 'text-orange-800 dark:text-orange-300',
                contentText: 'text-orange-700 dark:text-orange-400',
                descText: 'text-orange-600 dark:text-orange-400'
              }
            case 'VU':
              return {
                bg: 'bg-yellow-50 dark:bg-yellow-900/20',
                border: 'border-yellow-200 dark:border-yellow-800',
                titleText: 'text-yellow-800 dark:text-yellow-300',
                contentText: 'text-yellow-700 dark:text-yellow-400',
                descText: 'text-yellow-600 dark:text-yellow-400'
              }
            case 'NT':
              return {
                bg: 'bg-lime-50 dark:bg-lime-900/20',
                border: 'border-lime-200 dark:border-lime-800',
                titleText: 'text-lime-800 dark:text-lime-300',
                contentText: 'text-lime-700 dark:text-lime-400',
                descText: 'text-lime-600 dark:text-lime-400'
              }
            case 'LC':
              return {
                bg: 'bg-green-50 dark:bg-green-900/20',
                border: 'border-green-200 dark:border-green-800',
                titleText: 'text-green-800 dark:text-green-300',
                contentText: 'text-green-700 dark:text-green-400',
                descText: 'text-green-600 dark:text-green-400'
              }
            default:
              return {
                bg: 'bg-gray-50 dark:bg-gray-900/20',
                border: 'border-gray-200 dark:border-gray-800',
                titleText: 'text-gray-800 dark:text-gray-300',
                contentText: 'text-gray-700 dark:text-gray-400',
                descText: 'text-gray-600 dark:text-gray-400'
              }
          }
        }
        
        const colors = getStatusColors(currentStatusUpper)
        
        return (
          <div className={cn(
            'mt-3 p-3 rounded-lg border',
            colors.bg,
            colors.border,
            config.fontSize
          )}>
            <div className="flex items-center gap-2">
              <span className={cn('font-semibold', colors.titleText)}>
                {locale === 'tr' ? 'Mevcut Durum:' : 'Current Status:'}
              </span>
              <span className={colors.contentText}>
                {getConservationStatusInfo(currentStatusUpper)!.code} - {getConservationStatusInfo(currentStatusUpper)!.label[locale]}
              </span>
            </div>
            <p className={cn(colors.descText, 'mt-1 text-sm')}>
              {getConservationStatusInfo(currentStatusUpper)!.description[locale]}
            </p>
          </div>
        )
      })()}
    </div>
  )
}