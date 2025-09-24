"use client"

import dynamic from 'next/dynamic'
import { PageContainer } from '@/components/ui/page-container'
import { useTranslation } from '@/lib/i18n'

export const runtime = 'edge'
export const dynamicParams = false

export default function MapPage() {
  const { t } = useTranslation()

  const MapLibreMap = dynamic(() => import('@/components/ui/maplibre-map').then(mod => ({ default: mod.MapLibreMap })), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center">{t('map.loading')}</div>
  })

  return (
    <div className="h-screen w-full pt-navbar">
      <MapLibreMap 
        zoom={10}
        className="w-full h-full -mt-px"
      />
    </div>
  )
}
