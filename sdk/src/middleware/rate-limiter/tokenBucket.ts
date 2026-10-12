export class TokenBucketRateLimiter {
  private capacity: number;
  private refillRatePerSecond: number;
  private buckets: Map<string, { tokens: number; lastRefill: number }> = new Map();

  /**
   * @param capacity Maximum burst capacity (e.g. 20 requests)
   * @param refillRatePerSecond Refill rate (e.g. 5 requests per second)
   */
  constructor(capacity: number = 20, refillRatePerSecond: number = 5) {
    this.capacity = capacity;
    this.refillRatePerSecond = refillRatePerSecond;
  }

  /**
   * Consumes a token for a given agent address. Returns false if rate limit is exceeded.
   */
  allowRequest(agentKey: string): boolean {
    const key = agentKey.toLowerCase();
    const now = Date.now();
    const bucket = this.buckets.get(key) || { tokens: this.capacity, lastRefill: now };

    // Refill tokens based on elapsed time
    const elapsedSeconds = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(this.capacity, bucket.tokens + elapsedSeconds * this.refillRatePerSecond);
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      this.buckets.set(key, bucket);
      return true;
    }

    this.buckets.set(key, bucket);
    return false;
  }
}
