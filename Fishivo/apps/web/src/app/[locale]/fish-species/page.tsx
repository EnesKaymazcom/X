"use client"

import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/ui/page-container'
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/ui/page-header'
import { FishSpeciesCard } from '@/components/ui/fish-species-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Fish, AlertTriangle, BarChart3, Droplets, Shield, Globe, Search, Filter } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { TypographyH2, TypographyH3, TypographyH4, TypographyP } from '@/lib/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { speciesServiceWeb } from '@fishivo/api/services/species/species.web'
import { FishSpecies } from '@fishivo/types'
import { habitatTypeMap, getHabitatType } from '@/lib/fish-habitats'


function ErrorState({ message }: { message: string }) {
  const { locale } = useI18n()
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16">
      <div className="text-center max-w-md">
        <div className="relative mb-6">
          <div className="flex flex-col items-center">
            <img 
              src="/fishivo.svg" 
              alt="Fishivo" 
              className="h-12 w-12 mx-auto mb-4 opacity-60 text-blue-500 dark:text-white"
            />
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
          </div>
        </div>
        <TypographyH3 className="mb-3">
          {locale === 'tr' ? 'Bir Sorun Oluştu' : 'Something Went Wrong'}
        </TypographyH3>
        <Alert variant="destructive" className="text-left">
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">{locale === 'tr' ? 'Hata Detayı:' : 'Error Details:'}</p>
              <p className="text-sm">{message}</p>
            </div>
          </AlertDescription>
        </Alert>
        <div className="mt-6 space-y-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            {locale === 'tr' ? 'Sayfayı Yenile' : 'Refresh Page'}
          </button>
          <p className="text-xs text-muted-foreground">
            {locale === 'tr' 
              ? 'Sorun devam ederse, lütfen backend servisinin çalıştığından emin olun.' 
              : 'If the problem persists, please ensure the backend service is running.'}
          </p>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  const { locale } = useI18n()
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-pulse">
          <img 
            src="/fishivo.svg" 
            alt="Fishivo" 
            className="h-20 w-20 mx-auto opacity-30 text-blue-500 dark:text-white"
          />
          </div>
          <img 
            src="/fishivo.svg" 
            alt="Fishivo" 
            className="h-20 w-20 mx-auto relative z-10 text-blue-500 dark:text-white"
          />
        </div>
        <TypographyH2 className="mb-3">
          {locale === 'tr' ? 'Henüz Balık Türü Eklenmemiş' : 'No Fish Species Added Yet'}
        </TypographyH2>
        <p className="text-muted-foreground mb-6 max-w-md">
          {locale === 'tr' 
            ? 'Veritabanında henüz balık türü bulunmuyor. Admin panelinden balık türleri eklenebilir.'
            : 'No fish species found in the database. Fish species can be added from the admin panel.'}
        </p>
        <div className="space-y-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            {locale === 'tr' ? 'Yenile' : 'Refresh'}
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoSection() {
  const { t, locale } = useI18n()
  
  return (
    <div className="mt-16 text-center">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <TypographyH2 className="mb-4">
            {locale === 'tr' ? 'Daha Fazla Balık Türü Keşfetmek İster misiniz?' : 'Want to Discover More Fish Species?'}
          </TypographyH2>
          <p className="text-muted-foreground mb-6">
            {locale === 'tr' 
              ? 'Fishivo mobil uygulamasında 200+ balık türü hakkında detaylı bilgiler, fotoğraflar ve avlanma teknikleri bulabilirsiniz. Ayrıca kendi avlarınızı kataloglayarak kişisel balık arşivinizi oluşturabilirsiniz.'
              : 'In the Fishivo mobile app, you can find detailed information, photos and fishing techniques for over 200 fish species. You can also create your personal fish archive by cataloging your own catches.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {locale === 'tr' ? 'Uygulamayı İndir' : 'Download App'}
            </a>
            <a
              href={`/${locale}/map`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              {locale === 'tr' ? 'Harita' : 'Map'}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function FishSpeciesPage() {
  const { locale } = useI18n()
  const [species, setSpecies] = useState<FishSpecies[]>([])
  const [filteredSpecies, setFilteredSpecies] = useState<FishSpecies[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFamily, setSelectedFamily] = useState<string>('all')
  const [selectedHabitat, setSelectedHabitat] = useState<string>('all')

  useEffect(() => {
    fetchSpecies()
  }, [])

  const fetchSpecies = async () => {
    try {
      setLoading(true)
      
      const response = await speciesServiceWeb.getSpecies()
      
      setSpecies(response.data)
      setFilteredSpecies(response.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch species')
    } finally {
      setLoading(false)
    }
  }

  // Filter function
  useEffect(() => {
    let filtered = species

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(fish => {
        const searchLower = searchTerm.toLowerCase()
        
        // Search in display name
        const displayName = getFishDisplayName(fish).toLowerCase()
        if (displayName.includes(searchLower)) return true
        
        // Search in scientific name
        const scientificName = fish.scientific_name.toLowerCase()
        if (scientificName.includes(searchLower)) return true
        
        // Search in all English names
        if (fish.common_names_en && fish.common_names_en.length > 0) {
          if (fish.common_names_en.some(name => name.toLowerCase().includes(searchLower))) return true
        }
        
        // Search in all Turkish names
        if (fish.common_names_tr && fish.common_names_tr.length > 0) {
          if (fish.common_names_tr.some(name => name.toLowerCase().includes(searchLower))) return true
        }
        
        // Search in primary common name
        if (fish.common_name.toLowerCase().includes(searchLower)) return true
        
        return false
      })
    }

    // Filter by family
    if (selectedFamily && selectedFamily !== 'all') {
      filtered = filtered.filter(fish => fish.family === selectedFamily)
    }

    // Filter by habitat
    if (selectedHabitat && selectedHabitat !== 'all') {
      filtered = filtered.filter(fish => {
        if (!fish.habitats) return false
        return fish.habitats.includes(selectedHabitat)
      })
    }

    setFilteredSpecies(filtered)
  }, [species, searchTerm, selectedFamily, selectedHabitat])

  // Get unique families for filter
  const uniqueFamilies = Array.from(new Set(species.map(fish => fish.family))).filter(Boolean).sort()

  // Helper function to get fish name based on locale
  const getFishDisplayName = (fish: FishSpecies): string => {
    if (locale === 'tr' && fish.common_names_tr && fish.common_names_tr.length > 0) {
      return fish.common_names_tr[0]
    } else if (locale === 'en' && fish.common_names_en && fish.common_names_en.length > 0) {
      return fish.common_names_en[0]
    }
    return fish.common_name
  }

  // Convert FishSpecies to the format expected by FishSpeciesCard
  const convertToCardFormat = (fish: FishSpecies) => {
    // Determine water type based on first habitat
    let water_type = null
    
    if (fish.habitats && fish.habitats.length > 0) {
      const habitat = fish.habitats[0]
      // Check if it's one of our three main water types
      if (habitat === 'Tuzlu Su' || habitat === 'Tatlı Su' || habitat === 'Acı Su') {
        water_type = habitat
      } else {
        // Default fallback based on habitat name
        const habitatLower = habitat.toLowerCase()
        if (habitatLower.includes('nehir') || habitatLower.includes('göl') || 
            habitatLower.includes('river') || habitatLower.includes('lake') ||
            habitatLower.includes('freshwater')) {
          water_type = locale === 'tr' ? 'Tatlı Su' : 'Freshwater'
        } else if (habitatLower.includes('lagün') || habitatLower.includes('lagoon') ||
                   habitatLower.includes('brackish')) {
          water_type = locale === 'tr' ? 'Acı Su' : 'Brackish'
        } else {
          water_type = locale === 'tr' ? 'Tuzlu Su' : 'Saltwater'
        }
      }
    }
    
    return {
      id: fish.id,
      name: getFishDisplayName(fish),
      scientific_name: fish.scientific_name,
      image_url: fish.image_url,
      family: fish.family,
      order: fish.order,
      water_type,
      conservation_status: fish.conservation_status,
      min_size: 0, // Not available in current data
      max_size: fish.max_length || 0,
      avg_weight: 0, // Not available in current data
      max_weight: fish.max_weight || 0
    }
  }

  const labels = {
    habitat: locale === 'tr' ? 'Habitat' : 'Habitat',
    bestSeason: locale === 'tr' ? 'En İyi Sezon' : 'Best Season',
    size: locale === 'tr' ? 'Boyut' : 'Size',
    weight: locale === 'tr' ? 'Ağırlık' : 'Weight',
    bestBait: locale === 'tr' ? 'En İyi Yem' : 'Best Bait',
    difficulty: locale === 'tr' ? 'Zorluk' : 'Difficulty'
  }

  return (
    <PageContainer>
      <PageHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Title and Description */}
          <div>
            <PageHeaderHeading>
              {locale === 'tr' ? 'Balık Türleri' : 'Fish Species'}
            </PageHeaderHeading>
            <PageHeaderDescription>
              {locale === 'tr' 
                ? 'Farklı balık türlerini keşfedin, habitat bilgilerini öğrenin ve avlanma teknikleri ile mevsimsel özellikler hakkında bilgi edinin.'
                : 'Discover different fish species, learn about their habitats and get information about fishing techniques and seasonal characteristics.'}
            </PageHeaderDescription>
          </div>

          {/* Right Column - Search and Filters */}
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={locale === 'tr' ? 'Balık adı veya bilimsel adı ara...' : 'Search fish name or scientific name...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Family Filter */}
              <Select value={selectedFamily} onValueChange={setSelectedFamily}>
                <SelectTrigger>
                  <SelectValue placeholder={locale === 'tr' ? 'Familya Seç' : 'Select Family'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{locale === 'tr' ? 'Tüm Familyalar' : 'All Families'}</SelectItem>
                  {uniqueFamilies.map((family) => (
                    <SelectItem key={family} value={family}>
                      {family}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Habitat Filter */}
              <Select value={selectedHabitat} onValueChange={setSelectedHabitat}>
                <SelectTrigger>
                  <SelectValue placeholder={locale === 'tr' ? 'Yaşam Alanı Seç' : 'Select Habitat'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{locale === 'tr' ? 'Tüm Yaşam Alanları' : 'All Habitats'}</SelectItem>
                  {Object.entries(habitatTypeMap).map(([key, habitat]) => (
                    <SelectItem key={key} value={key}>
                      {locale === 'tr' ? habitat.tr : habitat.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || (selectedFamily && selectedFamily !== 'all') || (selectedHabitat && selectedHabitat !== 'all')) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedFamily('all')
                  setSelectedHabitat('all')
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                {locale === 'tr' ? 'Filtreleri Temizle' : 'Clear Filters'}
              </Button>
            )}
          </div>
        </div>
      </PageHeader>

      <div className="mb-12"></div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Fish className="h-8 w-8 animate-pulse text-primary mx-auto mb-4" />
            <TypographyP className="text-muted-foreground">
              {locale === 'tr' ? 'Balık türleri yükleniyor...' : 'Loading fish species...'}
            </TypographyP>
          </div>
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : species.length === 0 ? (
        <EmptyState />
      ) : filteredSpecies.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <Fish className="h-16 w-16 text-muted-foreground mb-4" />
          <TypographyH3 className="mb-2">
            {locale === 'tr' ? 'Balık Bulunamadı' : 'No Fish Found'}
          </TypographyH3>
          <TypographyP className="text-muted-foreground max-w-md">
            {locale === 'tr' 
              ? 'Arama kriterlerinize uygun balık türü bulunamadı. Lütfen filtreleri değiştirin veya temizleyin.'
              : 'No fish species found matching your search criteria. Please try different filters or clear them.'}
          </TypographyP>
        </div>
      ) : (
        <div>
          {/* Results Count */}
          <div className="mb-6">
            <TypographyP className="text-muted-foreground">
              {locale === 'tr' 
                ? `${filteredSpecies.length} balık türü bulundu`
                : `${filteredSpecies.length} fish species found`}
            </TypographyP>
          </div>
          
          {/* Fish Species Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredSpecies.map((fish) => (
                <FishSpeciesCard
                  key={fish.id}
                  fish={convertToCardFormat(fish)}
                  locale={locale}
                  labels={labels}
                />
              ))}
          </div>
        </div>
      )}

      <InfoSection />
    </PageContainer>
  )
}
