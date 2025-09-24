// TODO: @fishivo/shared import'ları kaldırıldı, geçici tip tanımlamaları eklendi
// import { HourlyForecastResponse } from "@fishivo/shared"
import { WeatherCard as Card, WeatherCardContent as CardContent, WeatherCardHeader as CardHeader, WeatherCardTitle as CardTitle } from "@/components/ui/weather-card"
import { TemperatureRange } from "@/components/ui/temperature-range"
import { formatDateWithTimezone } from "@/lib/utils"
import IconComponent from "@/components/ui/icon-component"
import { Separator } from "@/components/ui/separator"
import { TypographyP, TypographySmall } from '@/lib/typography'

// Geçici tip tanımlaması
interface HourlyForecastResponse {
  list: Array<{
    dt?: number
    main: {
      temp_min: number
      temp_max: number
    }
    weather: Array<{
      main: string
    }>
  }>
}

interface TenDayForecastProps {
  data: HourlyForecastResponse
}

export default function TenDayForecast({ data }: TenDayForecastProps) {
  // Add defensive checks
  if (!data || !data.list || data.list.length === 0) {
    return (
      <Card className="h-fit shrink-0">
        <CardHeader>
          <CardTitle>10-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <TypographyP className="text-muted-foreground">No forecast data available</TypographyP>
        </CardContent>
      </Card>
    )
  }

  // Backend'den gelen veri yapısına uygun şekilde işle
  const validTemperatures = data.list.filter((item: any) => 
    item.main && typeof item.main.temp_min === 'number' && typeof item.main.temp_max === 'number'
  )

  if (validTemperatures.length === 0) {
    return (
      <Card className="h-fit shrink-0">
        <CardHeader>
          <CardTitle>10-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <TypographyP className="text-muted-foreground">Temperature data unavailable</TypographyP>
        </CardContent>
      </Card>
    )
  }

  const minTemperature = Math.min(...validTemperatures.map((item: any) => item.main.temp_min))
  const maxTemperature = Math.max(...validTemperatures.map((item: any) => item.main.temp_max))

  return (
    <>
      <Card className="h-fit shrink-0">
        <CardHeader>
          <CardTitle>
            <i>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-[17.6px] w-[17.6px]"
              >
                <path
                  d="M8 2V5"
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 2V5"
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.5 9.08984H20.5"
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.6947 13.7002H15.7037"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.6947 16.7002H15.7037"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.9955 13.7002H12.0045"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.9955 16.7002H12.0045"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.29431 13.7002H8.30329"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.29431 16.7002H8.30329"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </i>
            10-Day Forecast
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 md:mb-1">
          {validTemperatures.map((item: any, i) => (
            <div key={item.dt || i}>
              <div className="flex w-full flex-row items-center justify-between gap-2 last:mb-0">
                <TypographyP className="min-w-[3rem] font-medium">
                  {i === 0
                    ? "Today"
                    : formatDateWithTimezone(item.dt || Math.floor(Date.now() / 1000) + (i * 86400), 0, "short")}
                </TypographyP>
                <IconComponent
                  weatherCode={item.weather[0].main}
                  className="h-[35.2px] w-[35.2px]"
                />
                <div className="flex w-[60%] flex-row gap-2 overflow-hidden">
                  <div className="flex w-full select-none flex-row items-center justify-between gap-2 pr-2">
                    <TypographySmall className="flex w-[3rem] min-w-fit justify-end text-neutral-600 dark:text-neutral-400">
                      {Math.floor(item.main.temp_min)}&deg;
                    </TypographySmall>
                    <TemperatureRange
                      min={minTemperature}
                      max={maxTemperature}
                      value={[item.main.temp_min, item.main.temp_max]}
                    />
                    <TypographySmall className="flex w-[3rem] min-w-fit justify-end">
                      {Math.floor(item.main.temp_max)}&deg;
                    </TypographySmall>
                  </div>
                </div>
              </div>
              {i !== validTemperatures.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}