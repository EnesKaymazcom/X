"use client"

import { Card } from "@/components/ui/card"
// TODO: @fishivo/shared import'ları kaldırıldı, geçici tip tanımlamaları eklendi
// import { WeatherCity, HourlyWeatherData } from "@fishivo/shared"
import WeatherClock from "./weather-clock"
import { formatDateWithTimezone } from "@/lib/utils"
import { TypographyH1, TypographyLarge, TypographySmall, TypographyP } from '@/lib/typography'

const formatTemperature = (temp: number) => `${Math.round(temp)}°`
import { MapPin } from "lucide-react"

// Geçici tip tanımlamaları
interface WeatherCity {
  name: string
  country: string
  timezone: number
}

interface HourlyWeatherData {
  dt: number
  main: {
    temp: number
    temp_min: number
    temp_max: number
    feels_like: number
  }
  weather: Array<{
    main: string
    description: string
  }>
}

interface CurrentWeatherProps {
  data: HourlyWeatherData
  city: WeatherCity
}

export default function CurrentWeather({ data, city }: CurrentWeatherProps) {
  const initial = new Date()

  return (
    <Card className="relative flex h-fit w-full shrink-0 flex-col justify-between overflow-hidden md:h-[25rem] p-6">
      {/* Header with date and time */}
      <div>
        <div className="flex justify-between">
          <TypographyLarge>{formatDateWithTimezone(data.dt, city.timezone, "long")}</TypographyLarge>
          <WeatherClock initial={initial} timezone={city.timezone} />
        </div>
        <div className="mt-2 flex items-center">
          <TypographyP className="font-bold">{city.name}, {city.country}</TypographyP>
          <MapPin className="ml-1 h-4 w-4" />
        </div>
      </div>

      {/* Main temperature display */}
      <div className="flex justify-center py-7 md:py-10">
        <TypographyH1 className="text-7xl sm:text-8xl md:text-8xl">
          {formatTemperature(data.main.temp)}
        </TypographyH1>
      </div>

      {/* Weather condition and temperature range */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          {/* Weather icon placeholder - we'll implement this */}
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <TypographySmall className="text-white font-semibold">
              {data.weather[0].main.charAt(0)}
            </TypographySmall>
          </div>
          <TypographyP className="font-semibold">{data.weather[0].description}</TypographyP>
        </div>
        <div className="flex gap-2">
          <TypographySmall className="text-muted-foreground">Maks: {formatTemperature(data.main.temp_max)}</TypographySmall>
          <TypographySmall className="text-muted-foreground">Min: {formatTemperature(data.main.temp_min)}</TypographySmall>
        </div>
        <div className="flex gap-2 mt-1">
          <TypographySmall className="text-muted-foreground">Hissedilen: {formatTemperature(data.main.feels_like)}</TypographySmall>
        </div>
      </div>
    </Card>
  )
}