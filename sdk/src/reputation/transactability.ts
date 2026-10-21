export interface EndpointHealth {
  endpoint: string;
  statusCode: number;
  latencyMs: number;
  isLive: boolean;
  timestamp: number;
}

/**
 * Real-world live network probe.
 * Zero mock seeds. Measures actual public internet latency and HTTP status.
 */
export class LiveNetworkProbe {
  private healthCache: Map<string, EndpointHealth> = new Map();

  async probe(url: string, timeoutMs: number = 4000): Promise<EndpointHealth> {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Execute real HTTP request over the internet
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Paythos-Network-Probe/2.1 (Arc L1 Clearinghouse)',
        },
      });
      clearTimeout(timeoutId);

      const latency = Math.round(performance.now() - start);
      const isLive = response.status >= 200 && response.status < 400;

      const health: EndpointHealth = {
        endpoint: url,
        statusCode: response.status,
        latencyMs: latency,
        isLive,
        timestamp: Date.now(),
      };

      this.healthCache.set(url, health);
      return health;
    } catch (err: any) {
      const latency = Math.round(performance.now() - start);
      const statusCode = err.name === 'AbortError' ? 408 : 503;

      const health: EndpointHealth = {
        endpoint: url,
        statusCode,
        latencyMs: latency,
        isLive: false,
        timestamp: Date.now(),
      };

      this.healthCache.set(url, health);
      return health;
    }
  }

  getCachedHealth(url: string): EndpointHealth | undefined {
    return this.healthCache.get(url);
  }
}
