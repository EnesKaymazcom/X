"use client"

// TODO: @fishivo/shared import'ları kaldırıldı, geçici veri tanımlaması eklendi
// import { OTHER_LARGE_CITIES } from "@fishivo/shared"
import Link from "next/link"
import { TypographyH3 } from '@/lib/typography'

// Geçici veri tanımlaması
const OTHER_LARGE_CITIES = [
  { city: "Istanbul", coord: { lat: 41.0082, lon: 28.9784 } },
  { city: "Ankara", coord: { lat: 39.9334, lon: 32.8597 } },
  { city: "Izmir", coord: { lat: 38.4192, lon: 27.1287 } },
  { city: "Bursa", coord: { lat: 40.1826, lon: 29.0665 } },
  { city: "Antalya", coord: { lat: 36.8969, lon: 30.7133 } }
]

export default function OtherLargeCities() {
  return (
    <div className="relative order-last hidden h-[25rem] w-full flex-col justify-between lg:block">
      <TypographyH3 className="py-3">Other large cities</TypographyH3>
      <div className="flex flex-col space-y-3.5">
        {OTHER_LARGE_CITIES.map((item) => (
          <Link
            key={item.city}
            scroll={false}
            href={`/search?lat=${item.coord.lat}&lon=${item.coord.lon}`}
            className="rounded-lg border bg-card px-6 py-4 text-card-foreground shadow-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {item.city}
          </Link>
        ))}
      </div>
    </div>
  )
}