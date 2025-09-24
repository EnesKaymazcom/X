import { WeatherProvider, WeatherData } from './types';
import { WeatherError, ProviderError } from './errors';
import { CircuitBreaker } from './retry';

export interface ProviderHealth {
  available: boolean;
  latency: number;
  errorRate: number;
  lastCheck: Date;
  score: number;
}

export interface ProviderMetrics {
  requests: number;
  errors: number;
  totalLatency: number;
  lastReset: Date;
}

export class ProviderManager {
  private providers = new Map<string, WeatherProvider>();
  private health = new Map<string, ProviderHealth>();
  private metrics = new Map<string, ProviderMetrics>();
  private circuitBreakers = new Map<string, CircuitBreaker>();

  register(provider: WeatherProvider): void {
    this.providers.set(provider.name, provider);
    this.circuitBreakers.set(provider.name, new CircuitBreaker());
    this.metrics.set(provider.name, {
      requests: 0,
      errors: 0,
      totalLatency: 0,
      lastReset: new Date()
    });
    this.health.set(provider.name, {
      available: true,
      latency: 0,
      errorRate: 0,
      lastCheck: new Date(),
      score: 100
    });
  }

  async selectProvider(lat: number, lon: number): Promise<WeatherProvider | null> {
    const available = this.getAvailableProviders(lat, lon);
    
    if (available.length === 0) {
      return null;
    }

    available.sort((a, b) => {
      const healthA = this.health.get(a.name)!;
      const healthB = this.health.get(b.name)!;
      return healthB.score - healthA.score;
    });

    return available[0];
  }

  async executeWithProvider(
    provider: WeatherProvider,
    lat: number,
    lon: number
  ): Promise<WeatherData> {
    const breaker = this.circuitBreakers.get(provider.name);
    if (!breaker) {
      throw new ProviderError(provider.name, 'Provider not registered');
    }

    const startTime = Date.now();
    const metrics = this.metrics.get(provider.name)!;

    try {
      const result = await breaker.execute(() => provider.fetchWeather(lat, lon));
      
      this.updateMetrics(provider.name, Date.now() - startTime, false);
      this.updateHealth(provider.name);
      
      return result;
    } catch (error) {
      this.updateMetrics(provider.name, Date.now() - startTime, true);
      this.updateHealth(provider.name);
      
      throw error;
    }
  }

  private getAvailableProviders(lat: number, lon: number): WeatherProvider[] {
    const available: WeatherProvider[] = [];
    
    for (const [name, provider] of this.providers) {
      const health = this.health.get(name)!;
      const breaker = this.circuitBreakers.get(name)!;
      
      if (health.available && !breaker.isOpen && provider.supports(lat, lon)) {
        available.push(provider);
      }
    }
    
    return available;
  }

  private updateMetrics(providerName: string, latency: number, isError: boolean): void {
    const metrics = this.metrics.get(providerName)!;
    
    metrics.requests++;
    metrics.totalLatency += latency;
    if (isError) metrics.errors++;
    
    if (Date.now() - metrics.lastReset.getTime() > 300000) {
      metrics.requests = 0;
      metrics.errors = 0;
      metrics.totalLatency = 0;
      metrics.lastReset = new Date();
    }
  }

  private updateHealth(providerName: string): void {
    const metrics = this.metrics.get(providerName)!;
    const health = this.health.get(providerName)!;
    
    if (metrics.requests === 0) return;
    
    const avgLatency = metrics.totalLatency / metrics.requests;
    const errorRate = metrics.errors / metrics.requests;
    
    health.latency = avgLatency;
    health.errorRate = errorRate;
    health.lastCheck = new Date();
    
    let score = 100;
    if (avgLatency > 5000) score -= 30;
    else if (avgLatency > 2000) score -= 15;
    else if (avgLatency > 1000) score -= 5;
    
    score -= errorRate * 100;
    
    health.score = Math.max(0, Math.min(100, score));
    health.available = health.score > 20;
  }

  getProviderHealth(): Map<string, ProviderHealth> {
    return new Map(this.health);
  }

  async healthCheck(): Promise<void> {
    const testCoordinates = { lat: 40.7128, lon: -74.0060 };
    
    for (const [name, provider] of this.providers) {
      if (!provider.supports(testCoordinates.lat, testCoordinates.lon)) {
        continue;
      }
      
      try {
        const startTime = Date.now();
        await provider.fetchWeather(testCoordinates.lat, testCoordinates.lon);
        
        this.updateMetrics(name, Date.now() - startTime, false);
        this.updateHealth(name);
      } catch (error) {
        this.updateMetrics(name, 0, true);
        this.updateHealth(name);
      }
    }
  }
}