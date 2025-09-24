import { WeatherError, WeatherErrorCode } from './errors';

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  timeout: number;
  jitter: boolean;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  timeout: 30000,
  jitter: true
};

export class RetryManager {
  constructor(private config: RetryConfig = DEFAULT_RETRY_CONFIG) {}

  async execute<T>(
    operation: () => Promise<T>,
    onRetry?: (attempt: number, error: WeatherError) => void
  ): Promise<T> {
    let lastError: WeatherError | undefined;
    
    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        return await this.withTimeout(operation(), this.config.timeout);
      } catch (error) {
        lastError = error instanceof WeatherError 
          ? error 
          : new WeatherError(WeatherErrorCode.UNKNOWN, String(error));

        if (!lastError.isRetryable || attempt === this.config.maxAttempts) {
          throw lastError;
        }

        onRetry?.(attempt, lastError);
        
        const delay = this.calculateDelay(attempt);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private calculateDelay(attempt: number): number {
    const exponentialDelay = this.config.initialDelay * 
      Math.pow(this.config.backoffMultiplier, attempt - 1);
    
    const delay = Math.min(exponentialDelay, this.config.maxDelay);
    
    if (this.config.jitter) {
      return delay * (0.5 + Math.random() * 0.5);
    }
    
    return delay;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new WeatherError(WeatherErrorCode.TIMEOUT, `Operation timed out after ${timeout}ms`)), timeout)
      )
    ]);
  }
}

export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private readonly threshold = 5,
    private readonly resetTimeout = 60000,
    private readonly halfOpenRequests = 3
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
        this.failures = 0;
      } else {
        throw new WeatherError(WeatherErrorCode.PROVIDER_ERROR, 'Circuit breaker is open');
      }
    }

    try {
      const result = await operation();
      
      if (this.state === 'half-open') {
        this.failures = 0;
        this.state = 'closed';
      }
      
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      if (this.failures >= this.threshold) {
        this.state = 'open';
      }
      
      throw error;
    }
  }

  get isOpen(): boolean {
    return this.state === 'open';
  }

  reset(): void {
    this.failures = 0;
    this.state = 'closed';
    this.lastFailureTime = 0;
  }
}