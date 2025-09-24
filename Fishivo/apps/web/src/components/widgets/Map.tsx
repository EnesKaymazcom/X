"use client"
import "maplibre-gl/dist/maplibre-gl.css"
import { useEffect, useMemo, useState } from "react"
import ReactMapGL, { Layer, Source } from "react-map-gl/maplibre"
import type { LayerProps } from "react-map-gl/maplibre"
import { WeatherCard as Card } from "@/components/ui/weather-card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSearchParams } from "next/navigation"
// TODO: @fishivo/shared import'ları kaldırıldı, geçici veri tanımlaması eklendi
// import { DEFAULT_LOCATION } from "@fishivo/shared"
import { useTheme } from "next-themes"
import { OPENWEATHERMAP_TOKEN } from "@/lib/utils"

// Geçici veri tanımlaması
const DEFAULT_LOCATION = {
  city: "Istanbul",
  coord: {
    lat: 41.0082,
    lon: 28.9784
  }
}

export default function Map() {
  const { theme } = useTheme()
  const MapTheme = useMemo(() => {
    return theme === "system"
      ? window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme
  }, [theme])

  const searchParams = useSearchParams()
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  const [defaultLat, defaultLon] = useMemo(() => {
    const latNumber = lat ? Number(lat) : Number(DEFAULT_LOCATION.coord.lat)
    const lonNumber = lon ? Number(lon) : Number(DEFAULT_LOCATION.coord.lon)
    return [latNumber, lonNumber]
  }, [lat, lon])

  const weatherTiles = useMemo(() => {
    return [
      { label: "Temperature (°C)", code: "TA2" },
      { label: "Precipitation Intensity (mm/s)", code: "PR0" },
      { label: "Wind Speed and Direction (m/s)", code: "WND" },
      { label: "Relative Humidity (%)", code: "HRD0" },
      { label: "Cloudiness (%)", code: "CL" },
      { label: "Atmospheric Pressure (hPa)", code: "APM" },
    ]
  }, [])

  const weatherLayer: LayerProps = {
    id: "weatherLayer",
    type: "raster",
    minzoom: 0,
    maxzoom: 15,
  }

  const [viewport, setViewport] = useState({
    latitude: lat ? Number(lat) : Number(defaultLat),
    longitude: lon ? Number(lon) : Number(defaultLon),
    zoom: 7,
    pitch: 60,
    bearing: -60,
  })

  const [MapCode, setMapCode] = useState("PR0")

  useEffect(() => {
    setViewport((prevViewport) => ({
      ...prevViewport,
      latitude: lat ? Number(lat) : Number(defaultLat),
      longitude: lon ? Number(lon) : Number(defaultLon),
    }))
  }, [lat, lon, defaultLat, defaultLon])

  // OpenWeatherMap API key yoksa uyarı göster ama haritayı yine de göster
  if (!OPENWEATHERMAP_TOKEN) {
    return (
      <Card className="order-11 col-span-2 h-[25rem] overflow-hidden overscroll-contain p-0 md:p-0 xl:col-span-3 2xl:order-8">
        <ReactMapGL
          reuseMaps
          {...viewport}
          attributionControl={false}
          mapLib={import('maplibre-gl')}
          mapStyle="https://tiles.openfreemap.org/styles/liberty"
          style={{
            flex: "1",
            position: "relative",
            width: "100%",
            height: "100%",
            top: "0",
            left: "0",
            zIndex: 0,
          }}
        >
          <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded-md p-2 z-10">
            <p className="text-xs text-muted-foreground">
              Hava durumu katmanı için API anahtarı gerekli
            </p>
          </div>
        </ReactMapGL>
      </Card>
    )
  }

  return (
    <Card className="order-11 col-span-2 h-[25rem] overflow-hidden overscroll-contain p-0 md:p-0 xl:col-span-3 2xl:order-8">
      <div className="absolute right-0 z-10 m-2">
        <Select value={MapCode} onValueChange={setMapCode}>
          <SelectTrigger aria-label="Map layer" className="w-fit">
            <SelectValue placeholder="Map Layers" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectGroup>
              {weatherTiles.map((tile) => (
                <SelectItem key={tile.code} value={tile.code}>
                  {tile.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <ReactMapGL
        reuseMaps
        {...viewport}
        attributionControl={false}
        mapLib={import('maplibre-gl')}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        style={{
          flex: "1",
          position: "relative",
          width: "100%",
          height: "100%",
          top: "0",
          left: "0",
          zIndex: 0,
        }}
      >
        <Source
          key={MapCode}
          id="weatherSource"
          type="raster"
          tiles={[
            `https://maps.openweathermap.org/maps/2.0/weather/${MapCode}/{z}/{x}/{y}?appid=${OPENWEATHERMAP_TOKEN}`,
          ]}
          tileSize={256}
        >
          <Layer {...weatherLayer} />
        </Source>
      </ReactMapGL>
    </Card>
  )
}