import CurrentWeather from "@/components/widgets/CurrentWeather"
import HourlyForecast from "@/components/widgets/HourlyForecast"
import SpotMap from "@/components/widgets/SpotMap"
import OtherLargeCities from "@/components/widgets/OtherLargeCities"
import TenDayForecast from "@/components/widgets/TenDayForecast"
import WeatherWidgets from "@/components/widgets/WeatherWidgets"

export default function WeatherPage() {
  // Statik örnek veri
  const mockWeatherData = {
    main: {
      temp: 22,
      temp_min: 18,
      temp_max: 26,
      feels_like: 23,
      pressure: 1013,
      humidity: 65
    },
    weather: [{ main: "Clear" }],
    wind: { speed: 15, deg: 180 },
    visibility: 10000
  }

  const mockCity = {
    name: "Istanbul",
    country: "TR",
    timezone: 10800,
    sunrise: 1234567890,
    sunset: 1234567890
  }

  const mockAirQuality = {
    main: { aqi: 2 },
    components: {}
  }

  const mockForecastData = {
    list: Array(10).fill(null).map(() => mockWeatherData)
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sol taraf - Current Weather ve 10-Day Forecast */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          <CurrentWeather data={mockWeatherData} city={mockCity} />
          <TenDayForecast data={mockForecastData} />
        </div>
        
        {/* Sağ taraf - Widget'lar */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-5xl">
            <WeatherWidgets
              data={mockWeatherData}
              city={mockCity}
              airQuality={mockAirQuality}
              uvIndexForToday={5}
              fishing={undefined}
            />
            <HourlyForecast data={[mockWeatherData]} />
            <SpotMap />
            <OtherLargeCities />
          </div>
        </div>
      </div>
    </div>
  )
}