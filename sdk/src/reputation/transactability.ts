export interface EndpointHealth {
  endpoint: string;
  successRate24h: number; // e.g. 99.8%
  lastPaidStatusCode: number; // e.g. 200
  latencyMs: number;
  isTransactable: boolean;
}

// In-memory Transactability Index (Inspired by Selat AI, secured on Arc)
export class TransactabilityIndex {
  private healthLedger: Map<string, EndpointHealth> = new Map();

  constructor() {
    // Seed verified Arc Marketplace endpoints
    this.recordResult('https://api.blockrun.ai/v1/chat/completions', 200, 180);
    this.recordResult('https://api.exa.ai/search', 200, 240);
    this.recordResult('https://api.coingecko.com/api/v3/simple/price', 200, 95);
  }

  recordResult(endpoint: string, statusCode: number, latencyMs: number) {
    const existing = this.healthLedger.get(endpoint) || {
      endpoint,
      successRate24h: 100,
      lastPaidStatusCode: statusCode,
      latencyMs,
      isTransactable: true,
    };

    const isSuccess = statusCode >= 200 && statusCode < 300;
    existing.lastPaidStatusCode = statusCode;
    existing.latencyMs = latencyMs;
    existing.isTransactable = isSuccess;

    this.healthLedger.set(endpoint, existing);
  }

  /**
   * Pre-flight check before spending: Returns false if endpoint is degraded.
   */
  canTransact(endpoint: string): { allowed: boolean; reason?: string } {
    const health = this.healthLedger.get(endpoint);
    if (!health) {
      return { allowed: true }; // First-time discovery allowed
    }

    if (!health.isTransactable) {
      return {
        allowed: false,
        reason: `Endpoint ${endpoint} failed last call with HTTP ${health.lastPaidStatusCode}. Spend blocked.`,
      };
    }

    return { allowed: true };
  }

  getScore(endpoint: string): EndpointHealth | undefined {
    return this.healthLedger.get(endpoint);
  }
}
