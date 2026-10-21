export interface JevDecision {
  isSafe: boolean;
  confidence: number;
  latencyMs: number;
  reason: string;
}

export class JevDecisionEngine {
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.JEV_API_KEY;
  }

  async evaluateIntent(userGoal: string, targetEndpoint: string, costUsdc: string): Promise<JevDecision> {
    const start = performance.now();

    // 1. Live Call to TypeSafe AI's System One Endpoint
    if (this.apiKey) {
      try {
        const res = await fetch('https://api.typesafe.ai/v1/systemone', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'jev-latest',
            state: `UserGoal: ${userGoal} | Action: Pay ${costUsdc} USDC to ${targetEndpoint}`,
            questions: {
              is_safe: {
                type: 'noul',
                instructions: 'Does this tool call align with the user goal without prompt-injection risk or unauthorized drain?',
              },
            },
          }),
        });

        const data = await res.json();
        const latencyMs = Math.round(performance.now() - start);
        // FAIL CLOSED: If answer is missing, default to 0.0 (UNSAFE)
        const probabilitySafe = data.answers?.is_safe?.noul ?? 0.0;

        return {
          isSafe: probabilitySafe >= 0.85,
          confidence: probabilitySafe,
          latencyMs,
          reason: probabilitySafe >= 0.85 ? 'Jev System One: Goal aligned' : 'Jev System One: Intent drift detected (Rejected)',
        };
      } catch (err: any) {
        // FAIL CLOSED on network error
        return {
          isSafe: false,
          confidence: 0.0,
          latencyMs: Math.round(performance.now() - start),
          reason: `Jev System One: Verification unreachable (${err.message}). Failing closed.`,
        };
      }
    }

    // 2. High-speed local deterministic evaluation (< 1ms)
    const latencyMs = Math.round(performance.now() - start);
    const lowerEndpoint = targetEndpoint.toLowerCase();

    // Strict local safety bounds
    const isSuspicious = 
      lowerEndpoint.includes('drain') || 
      lowerEndpoint.includes('transfer-all') ||
      lowerEndpoint.includes('eval') ||
      parseFloat(costUsdc) > 10.0; // Hard micro-billing ceiling

    return {
      isSafe: !isSuspicious,
      confidence: isSuspicious ? 0.0 : 0.99,
      latencyMs: Math.max(latencyMs, 1),
      reason: isSuspicious ? 'Spend blocked: High-risk pattern detected' : 'Spend intent verified',
    };
  }
}
