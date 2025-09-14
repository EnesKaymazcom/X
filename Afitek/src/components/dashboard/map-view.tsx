"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Layers3 } from "lucide-react"

// Mapbox CSS'i dinamik olarak yükle
if (typeof window !== 'undefined') {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.1.0/mapbox-gl.css'
  document.head.appendChild(link)

  // Mapbox logo ve attributions'ı küçültmek için custom CSS
  const style = document.createElement('style')
  style.textContent = `
    .mapboxgl-ctrl-logo {
      transform: scale(0.7);
      transform-origin: bottom left;
    }
    .mapboxgl-ctrl-attrib {
      font-size: 9px !important;
      padding: 2px 4px !important;
      margin: 0 !important;
      max-width: 200px;
      opacity: 0.6;
    }
    .mapboxgl-ctrl-attrib-inner {
      font-size: 9px !important;
    }
    .mapboxgl-ctrl-attrib-button {
      width: 16px !important;
      height: 16px !important;
    }
  `
  document.head.appendChild(style)
}

// Demo için OpenStreetMap tile kullanacağız (API key gerekmez)
const DEMO_VEHICLES = [
  {
    id: "888811118888",
    name: "Mercedes Actros",
    plate: "34 ABC 123",
    lat: 41.0082,
    lng: 28.9784,
    status: "online",
    speed: 65,
  },
  {
    id: "888811118889",
    name: "Volvo FH16",
    plate: "06 DEF 456",
    lat: 39.9334,
    lng: 32.8597,
    status: "offline",
    speed: 0,
  },
  {
    id: "888811118890",
    name: "Scania R450",
    plate: "35 GHI 789",
    lat: 38.4237,
    lng: 27.1428,
    status: "idle",
    speed: 0,
  },
]

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([])
  const [is3DView, setIs3DView] = useState(false)

  useEffect(() => {
    if (!mapContainer.current) return

    // Mapbox token yoksa demo map kullan
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1IjoiZGVtby11c2VyIiwiYSI6ImNrZGVtbzEyMzQ1Njc4OTBhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAifQ.demo"

    try {
      mapboxgl.accessToken = token

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11", // Orijinal streets
        center: [32.8597, 39.9334], // Türkiye merkez
        zoom: 5,
        pitch: 0, // Başlangıçta düz görünüm
        bearing: 0, // Başlangıçta düz
        antialias: true,
        failIfMajorPerformanceCaveat: false,
      })

      // Globe ayarları
      map.current.on('style.load', () => {
        // Globe projection ekle
        map.current!.setProjection({ name: 'globe' })

        // Atmosfer efekti
        map.current!.setFog({
          'range': [0.5, 10],
          'color': '#ffffff',
          'horizon-blend': 0.1,
          'star-intensity': 0.15
        } as any)
      })

      // Harita yüklendiğinde
      map.current.on("load", () => {
        // 3D Buildings Layer Ekle
        const layers = map.current!.getStyle().layers as mapboxgl.Layer[]
        const labelLayerId = layers.find(
          (layer) => layer.type === 'symbol' && (layer as mapboxgl.SymbolLayer).layout?.['text-field']
        )?.id

        // 3D binalar için layer ekle
        map.current!.addLayer(
          {
            'id': '3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
              // Bina renklerini daha parlak ve renkli yap
              'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['get', 'height'],
                0, '#3182ce',   // Mavi
                25, '#38a169',  // Yeşil
                50, '#d69e2e',  // Sarı
                100, '#e53e3e', // Kırmızı
                200, '#805ad5'  // Mor
              ],

              // Zoom seviyesine göre yükseklik animasyonu
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.8
            }
          } as mapboxgl.FillExtrusionLayer,
          labelLayerId
        )

        // Araçları haritaya ekle
        const newMarkers: mapboxgl.Marker[] = []

        DEMO_VEHICLES.forEach((vehicle) => {
          // Custom marker element
          const el = document.createElement("div")
          el.className = "custom-marker"
          el.style.width = "30px"
          el.style.height = "30px"
          el.style.borderRadius = "50%"
          el.style.border = "3px solid white"
          el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)"
          el.style.cursor = "pointer"
          el.style.backgroundColor =
            vehicle.status === "online" ? "#22c55e" :
            vehicle.status === "idle" ? "#f59e0b" : "#ef4444"

          // Popup
          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="padding: 8px;">
                <h3 style="margin: 0 0 4px 0; font-weight: 600;">${vehicle.name}</h3>
                <p style="margin: 0; font-size: 12px; color: #666;">
                  ${vehicle.plate} • ${vehicle.speed} km/h
                </p>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #999;">
                  Durum: ${
                    vehicle.status === "online" ? "Çevrimiçi" :
                    vehicle.status === "idle" ? "Beklemede" : "Çevrimdışı"
                  }
                </p>
              </div>
            `)

          const marker = new mapboxgl.Marker(el)
            .setLngLat([vehicle.lng, vehicle.lat])
            .setPopup(popup)
            .addTo(map.current!)

          newMarkers.push(marker)
        })

        setMarkers(newMarkers)
      })

      // Navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

      // Scale control
      map.current.addControl(new mapboxgl.ScaleControl(), "bottom-left")

    } catch (error) {
      console.error("Harita yüklenirken hata:", error)
      // Hata durumunda basit bir harita göster
      if (mapContainer.current) {
        mapContainer.current.innerHTML = `
          <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
              <h3 style="margin: 0 0 10px 0;">🗺️ Harita Demo Modu</h3>
              <p style="margin: 0; color: #666;">Gerçek harita için Mapbox API key gerekli</p>
              <div style="margin-top: 15px;">
                ${DEMO_VEHICLES.map(v => `
                  <div style="padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; text-align: left;">
                    <strong>${v.name}</strong> (${v.plate})<br>
                    <small>Konum: ${v.lat.toFixed(2)}, ${v.lng.toFixed(2)}</small>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>
        `
      }
    }

    return () => {
      markers.forEach(marker => marker.remove())
      map.current?.remove()
    }
  }, [])

  // 3D/2D görünüm değiştir
  const toggle3DView = () => {
    if (!map.current) return

    if (is3DView) {
      map.current.easeTo({ pitch: 0, bearing: 0 })
    } else {
      map.current.easeTo({ pitch: 45, bearing: -17.6 })
    }
    setIs3DView(!is3DView)
  }


  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 flex flex-col space-y-2">
        <Badge variant="secondary" className="bg-background/90 backdrop-blur">
          {DEMO_VEHICLES.filter(v => v.status === "online").length} Araç Çevrimiçi
        </Badge>

        {/* Görünüm Kontrol Butonu */}
        <Button
          size="sm"
          variant={is3DView ? "default" : "secondary"}
          onClick={toggle3DView}
          className="bg-background/90 backdrop-blur"
        >
          <Layers3 className="h-4 w-4 mr-2" />
          {is3DView ? "3D" : "2D"}
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur p-3 rounded-lg">
        <div className="text-xs space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Çevrimiçi</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Beklemede</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Çevrimdışı</span>
          </div>
        </div>
      </div>
    </div>
  )
}