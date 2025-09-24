import { z } from 'zod';

export const AirQualitySchema = z.object({
  pm25: z.number(),
  pm10: z.number(),
  o3: z.number(),
  no2: z.number(),
  so2: z.number(),
  co: z.number(),
  aqi: z.number()
});

export const CurrentWeatherSchema = z.object({
  temperature: z.number(),
  apparent_temperature: z.number(),
  humidity: z.number().min(0).max(100),
  pressure: z.number(),
  windSpeed: z.number().min(0),
  windDirection: z.number().min(0).max(360),
  windGust: z.number().min(0).optional(),
  uvIndex: z.number().min(0),
  visibility: z.number().min(0),
  cloudCover: z.number().min(0).max(100),
  precipitation: z.number().min(0),
  weatherCode: z.number(),
  airQuality: AirQualitySchema.optional()
});

export const HourlyWeatherSchema = z.object({
  time: z.string(),
  temperature: z.number(),
  humidity: z.number().min(0).max(100),
  windSpeed: z.number().min(0),
  windDirection: z.number().min(0).max(360),
  precipitation: z.number().min(0),
  precipitationProbability: z.number().min(0).max(100),
  weatherCode: z.number(),
  cloudCover: z.number().min(0).max(100),
  pressure: z.number().optional(),
  visibility: z.number().min(0).optional()
});

export const DailyWeatherSchema = z.object({
  date: z.string(),
  temperatureMax: z.number(),
  temperatureMin: z.number(),
  precipitationSum: z.number().min(0),
  precipitationProbability: z.number().min(0).max(100),
  windSpeedMax: z.number().min(0),
  uvIndexMax: z.number().min(0),
  sunrise: z.string(),
  sunset: z.string(),
  weatherCode: z.number()
});

export const AstronomyDataSchema = z.object({
  moonPhase: z.string(),
  moonIllumination: z.number().min(0).max(100),
  moonrise: z.string(),
  moonset: z.string(),
  sunrise: z.string(),
  sunset: z.string(),
  majorPeriods: z.array(z.object({
    start: z.string(),
    end: z.string()
  })),
  minorPeriods: z.array(z.object({
    start: z.string(),
    end: z.string()
  }))
});

export const MarineDataSchema = z.object({
  waveHeight: z.number().min(0),
  wavePeriod: z.number().min(0),
  waveDirection: z.number().min(0).max(360),
  seaTemperature: z.number(),
  tides: z.array(z.object({
    time: z.string(),
    height: z.number(),
    type: z.enum(['high', 'low'])
  }))
});

export const FishingConditionsSchema = z.object({
  score: z.number().min(0).max(100),
  rating: z.enum(['poor', 'fair', 'good', 'excellent']),
  bestTimes: z.array(z.object({
    start: z.string(),
    end: z.string(),
    quality: z.string()
  })),
  factors: z.object({
    pressure: z.object({
      value: z.number(),
      trend: z.string(),
      impact: z.string()
    }),
    moon: z.object({
      phase: z.string(),
      illumination: z.number(),
      impact: z.string()
    }),
    temperature: z.object({
      value: z.number(),
      impact: z.string()
    }),
    wind: z.object({
      speed: z.number(),
      impact: z.string()
    })
  }),
  recommendations: z.array(z.string())
});

export const WeatherAlertSchema = z.object({
  title: z.string(),
  description: z.string(),
  severity: z.string(),
  start: z.string(),
  end: z.string()
});

export const WeatherDataSchema = z.object({
  current: CurrentWeatherSchema,
  hourly: z.array(HourlyWeatherSchema),
  daily: z.array(DailyWeatherSchema),
  astronomy: AstronomyDataSchema.optional(),
  marine: MarineDataSchema.optional(),
  fishing: FishingConditionsSchema.optional(),
  alerts: z.array(WeatherAlertSchema).optional(),
  metadata: z.object({
    provider: z.string(),
    location: z.string(),
    lastUpdated: z.string(),
    cached: z.boolean(),
    stale: z.boolean().optional()
  })
});

export const OpenMeteoResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  current: z.object({
    time: z.string(),
    temperature_2m: z.number(),
    apparent_temperature: z.number(),
    relative_humidity_2m: z.number(),
    pressure_msl: z.number(),
    wind_speed_10m: z.number(),
    wind_direction_10m: z.number(),
    wind_gusts_10m: z.number().optional(),
    uv_index: z.number().optional(),
    cloud_cover: z.number(),
    precipitation: z.number(),
    weather_code: z.number()
  }),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number()),
    relative_humidity_2m: z.array(z.number()),
    pressure_msl: z.array(z.number()),
    wind_speed_10m: z.array(z.number()),
    wind_direction_10m: z.array(z.number()),
    precipitation: z.array(z.number()),
    precipitation_probability: z.array(z.number()).optional(),
    weather_code: z.array(z.number()),
    cloud_cover: z.array(z.number()),
    visibility: z.array(z.number()).optional()
  }),
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    precipitation_sum: z.array(z.number()),
    precipitation_probability_max: z.array(z.number()).optional(),
    wind_speed_10m_max: z.array(z.number()),
    uv_index_max: z.array(z.number()).optional(),
    sunrise: z.array(z.string()),
    sunset: z.array(z.string()),
    weather_code: z.array(z.number())
  })
});

export const IPGeolocationResponseSchema = z.object({
  sunrise: z.string(),
  sunset: z.string(),
  moonrise: z.string(),
  moonset: z.string(),
  moon_phase: z.string(),
  moon_altitude: z.number(),
  moon_azimuth: z.number(),
  moon_distance: z.number(),
  sun_altitude: z.number(),
  sun_azimuth: z.number(),
  sun_distance: z.number(),
  solar_noon: z.string(),
  day_length: z.string()
});

export const WindDataSchema = z.object({
  u: z.number(),
  v: z.number(),
  speed: z.number(),
  direction: z.number()
});

export const WindGridSchema = z.object({
  data: z.array(z.array(WindDataSchema)),
  bounds: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number()
  }),
  resolution: z.object({
    lat: z.number(),
    lon: z.number()
  })
});

export type WeatherData = z.infer<typeof WeatherDataSchema>;
export type CurrentWeather = z.infer<typeof CurrentWeatherSchema>;
export type HourlyWeather = z.infer<typeof HourlyWeatherSchema>;
export type DailyWeather = z.infer<typeof DailyWeatherSchema>;
export type AstronomyData = z.infer<typeof AstronomyDataSchema>;
export type FishingConditions = z.infer<typeof FishingConditionsSchema>;
export type WindData = z.infer<typeof WindDataSchema>;
export type WindGrid = z.infer<typeof WindGridSchema>;