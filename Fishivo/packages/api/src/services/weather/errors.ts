export enum WeatherErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  INVALID_COORDINATES = 'INVALID_COORDINATES',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  PARSE_ERROR = 'PARSE_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  UNKNOWN = 'UNKNOWN'
}

export type WeatherErrorCodeType = keyof typeof WeatherErrorCode;

export interface WeatherErrorMetadata {
  provider?: string;
  statusCode?: number;
  originalError?: unknown;
  coordinates?: { lat: number; lon: number };
  retryAfter?: number;
}

export class WeatherError extends Error {
  constructor(
    public readonly code: WeatherErrorCode,
    message: string,
    public readonly metadata?: WeatherErrorMetadata
  ) {
    super(message);
    this.name = 'WeatherError';
    Object.setPrototypeOf(this, WeatherError.prototype);
  }

  get isRetryable(): boolean {
    return [
      WeatherErrorCode.NETWORK_ERROR,
      WeatherErrorCode.TIMEOUT,
      WeatherErrorCode.PROVIDER_ERROR
    ].includes(this.code);
  }

  get isRateLimit(): boolean {
    return this.code === WeatherErrorCode.RATE_LIMIT;
  }

  get shouldFallback(): boolean {
    return [
      WeatherErrorCode.PROVIDER_ERROR,
      WeatherErrorCode.RATE_LIMIT,
      WeatherErrorCode.TIMEOUT
    ].includes(this.code);
  }
}

export class NetworkError extends WeatherError {
  constructor(message: string, metadata?: WeatherErrorMetadata) {
    super(WeatherErrorCode.NETWORK_ERROR, message, metadata);
  }
}

export class TimeoutError extends WeatherError {
  constructor(timeout: number, metadata?: WeatherErrorMetadata) {
    super(
      WeatherErrorCode.TIMEOUT,
      `Request timed out after ${timeout}ms`,
      metadata
    );
  }
}

export class InvalidCoordinatesError extends WeatherError {
  constructor(lat: number, lon: number) {
    super(
      WeatherErrorCode.INVALID_COORDINATES,
      `Invalid coordinates: ${lat}, ${lon}`,
      { coordinates: { lat, lon } }
    );
  }
}

export class ProviderError extends WeatherError {
  constructor(provider: string, message: string, statusCode?: number) {
    super(
      WeatherErrorCode.PROVIDER_ERROR,
      `${provider}: ${message}`,
      { provider, statusCode }
    );
  }
}

export class RateLimitError extends WeatherError {
  constructor(provider: string, retryAfter?: number) {
    super(
      WeatherErrorCode.RATE_LIMIT,
      `Rate limit exceeded for ${provider}`,
      { provider, retryAfter }
    );
  }
}

export class ParseError extends WeatherError {
  constructor(provider: string, originalError: unknown) {
    super(
      WeatherErrorCode.PARSE_ERROR,
      `Failed to parse response from ${provider}`,
      { provider, originalError }
    );
  }
}

export class CacheError extends WeatherError {
  constructor(operation: string, originalError: unknown) {
    super(
      WeatherErrorCode.CACHE_ERROR,
      `Cache ${operation} failed`,
      { originalError }
    );
  }
}