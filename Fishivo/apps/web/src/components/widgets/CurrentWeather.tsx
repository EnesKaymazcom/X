import { WeatherCard as Card } from "@/components/ui/weather-card"
// import { WeatherCity, HourlyWeatherData } from "@fishivo/shared" // TODO: Move to @fishivo/types

// Temporary type definitions
interface WeatherCity {
  name: string
  timezone: number
}

interface HourlyWeatherData {
  dt?: number
  main: {
    temp: number
    temp_max?: number
    temp_min?: number
  }
  weather: Array<{
    main: string
  }>
}
import Clock from "@/components/ui/clock"
import IconComponent from "@/components/ui/icon-component"
import { formatDateWithTimezone } from "@/lib/utils"
import { TypographyLarge, TypographyH1 } from "@/lib/typography"

interface CurrentWeatherProps {
  data: HourlyWeatherData
  city: WeatherCity
}

export default function CurrentWeather({ data, city }: CurrentWeatherProps) {
  const initial = new Date()

  return (
    <Card className="relative flex h-fit w-full shrink-0 flex-col justify-between overflow-hidden md:h-[25rem]">
      <div className="absolute " />
      <div>
        <TypographyLarge className="flex justify-between">
          <span>{formatDateWithTimezone(data.dt || Math.floor(Date.now() / 1000), city.timezone || 0, "long")}</span>
          <Clock initial={initial} timezone={city.timezone || 0} />
        </TypographyLarge>
        <div className="text-md mt-2 flex font-bold">
          <span>{city.name}</span>
          <i>
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="ml-0.5 h-4 w-4 fill-none stroke-[#EF4444]"
            >
              <path
                d="M7.39993 6.32003L15.8899 3.49003C19.6999 2.22003 21.7699 4.30003 20.5099 8.11003L17.6799 16.6C15.7799 22.31 12.6599 22.31 10.7599 16.6L9.91993 14.08L7.39993 13.24C1.68993 11.34 1.68993 8.23003 7.39993 6.32003Z"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10.1101 13.6501L13.6901 10.0601"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </i>
        </div>
      </div>
      <TypographyH1 className="flex justify-center py-7 text-8xl md:py-10">
        {Math.round(data.main.temp)}&deg;
      </TypographyH1>
      <div>
        <IconComponent
          weatherCode={data.weather[0].main}
          className="h-9 w-9"
        />
        <div className="font-semibold">{data.weather[0].main}</div>
        <div className="flex gap-2 dark:text-neutral-500">
          <span>H: {Math.round(data.main.temp_max || data.main.temp)}&deg;</span>
          <span>L: {Math.round(data.main.temp_min || data.main.temp)}&deg;</span>
        </div>
      </div>
    </Card>
  )
}