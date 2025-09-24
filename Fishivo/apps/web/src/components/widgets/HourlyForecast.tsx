"use client"
// TODO: @fishivo/shared import'ları kaldırıldı, geçici tip tanımlamaları eklendi
// import { HourlyWeatherData } from "@fishivo/shared"
import { WeatherCard as Card } from "@/components/ui/weather-card"
import { useRef } from "react"
import { useDraggable } from "react-use-draggable-scroll"
import IconComponent from "@/components/ui/icon-component"
import { TypographySmall } from '@/lib/typography'

// Geçici tip tanımlaması
interface HourlyWeatherData {
  dt?: number
  main: {
    temp: number
  }
  weather: Array<{
    main: string
  }>
}

interface HourlyForecastProps {
  data: HourlyWeatherData[]
}

export default function HourlyForecast({ data }: HourlyForecastProps) {
  function extractHoursFromDate(dt: number): number {
    const date = new Date(dt * 1000)
    return date.getHours()
  }
  const ref =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>
  const { events } = useDraggable(ref, {
    safeDisplacement: 2,
  })

  return (
    <>
      <Card
        ref={ref}
        {...events}
        tabIndex={0}
        className="order-first col-span-2 flex h-48 cursor-grab touch-auto touch-pan-x select-none scroll-px-0.5 flex-row items-center justify-between gap-12 overflow-hidden overscroll-contain scroll-smooth p-6 ring-offset-background transition-colors scrollbar-hide hover:overflow-x-auto focus:scroll-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:order-2 lg:order-3"
      >
        {data.slice(0, 12).map((item: any, i) => (
          <div key={item.dt || i} className="flex h-full flex-col justify-between">
            <TypographySmall className="flex justify-center text-neutral-600 dark:text-neutral-400">
              {i === 0 ? "Now" : extractHoursFromDate(item.dt || Math.floor(Date.now() / 1000) + (i * 3600))}
            </TypographySmall>
            <div className="flex h-full items-center justify-center">
              <IconComponent
                weatherCode={item.weather[0].main}
                className="h-8 w-8"
              />
            </div>
            <div className="flex justify-center">
              {Math.floor(item.main.temp)}&deg;
            </div>
          </div>
        ))}
      </Card>
    </>
  )
}