"use client"
import "maplibre-gl/dist/maplibre-gl.css"
import { useEffect, useMemo, useState } from "react"
import ReactMapGL, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre"
import { WeatherCard as Card } from "@/components/ui/weather-card"
import { useTheme } from "next-themes"
// import { apiService } from "@fishivo/services/web"
import { MapPin, Navigation, Fish } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TypographyH3, TypographySmall, TypographyMuted } from "@/lib/typography"

interface Spot {
  id: number
  name: string
  description?: string
  location: {
    coordinates: [number, number]
  }
  spot_type: string
  rating?: number
}

export default function SpotMap() {
  const { theme } = useTheme()
  const [spots, setSpots] = useState<Spot[]>([])
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  const MapTheme = useMemo(() => {
    return theme === "system"
      ? window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme
  }, [theme])

  const [viewport, setViewport] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
    zoom: 10,
  })

  // Kullanıcının favori spotlarını getir - DUMMY DATA
  useEffect(() => {
    const fetchSpots = async () => {
      try {
        // Dummy spot data for UI testing
        const dummySpots = [
          {
            id: 1,
            name: "Galata Köprüsü",
            description: "Popüler balık tutma noktası",
            location: { coordinates: [28.9784, 41.0172] },
            spot_type: "fishing",
            rating: 4.5
          },
          {
            id: 2,
            name: "Beşiktaş Marina",
            description: "Marina ve tekne park alanı",
            location: { coordinates: [29.0059, 41.0426] },
            spot_type: "marina",
            rating: 4.2
          }
        ]
        setSpots(dummySpots)
      } catch (error) {
        console.error("Failed to fetch spots:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSpots()
  }, [])

  // Kullanıcının konumunu al
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([longitude, latitude])
          setViewport(prev => ({
            ...prev,
            latitude,
            longitude,
            zoom: 12
          }))
        },
        (error) => {
          console.error("Error getting location:", error)
        }
      )
    }
  }, [])

  // MapLibre doesn't need an API key for OpenFreeMap

  const getMarkerColor = (spotType: string) => {
    switch (spotType) {
      case 'fishing': return '#3B82F6'
      case 'marina': return '#10B981'
      case 'bait_shop': return '#F59E0B'
      case 'restaurant': return '#8B5CF6'
      default: return '#6B7280'
    }
  }

  return (
    <Card className="order-11 col-span-2 h-[25rem] overflow-hidden p-0 xl:col-span-3">
      <div className="relative h-full w-full">
        <ReactMapGL
          {...viewport}
          onMove={evt => setViewport(evt.viewState)}
          mapLib={import('maplibre-gl')}
          mapStyle="https://tiles.openfreemap.org/styles/liberty"
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <NavigationControl position="top-right" />

          {/* Spot işaretleri */}
          {spots.map((spot) => (
            <Marker
              key={spot.id}
              longitude={spot.location.coordinates[0]}
              latitude={spot.location.coordinates[1]}
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                setSelectedSpot(spot)
              }}
            >
              <div
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
                style={{ backgroundColor: getMarkerColor(spot.spot_type) }}
              >
                <MapPin className="h-4 w-4 text-white" />
              </div>
            </Marker>
          ))}

          {/* Popup */}
          {selectedSpot && (
            <Popup
              longitude={selectedSpot.location.coordinates[0]}
              latitude={selectedSpot.location.coordinates[1]}
              onClose={() => setSelectedSpot(null)}
              closeOnClick={false}
              anchor="bottom"
              maxWidth="200px"
            >
              <div className="p-2">
                <TypographyH3 className="text-sm">{selectedSpot.name}</TypographyH3>
                {selectedSpot.description && (
                  <TypographySmall className="text-muted-foreground mt-1">
                    {selectedSpot.description}
                  </TypographySmall>
                )}
                {selectedSpot.rating && (
                  <TypographySmall className="mt-1">
                    ⭐ {selectedSpot.rating.toFixed(1)}
                  </TypographySmall>
                )}
              </div>
            </Popup>
          )}
        </ReactMapGL>
      </div>
    </Card>
  )
}