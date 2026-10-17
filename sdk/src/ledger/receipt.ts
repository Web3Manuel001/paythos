export interface ItemizedCall {
  endpoint: string;
  scheme: 'x402' | 'arc-memo';
  pricePaidUsdc: string;
  timestamp: number;
}

export interface ReconciledRunReceipt {
  runId: string;
  calls: ItemizedCall[];
  totalPaidUsdc: string;
  vaultRemainingCapUsdc: string;
}

export class RunReceiptLedger {
  private runs: Map<string, ItemizedCall[]> = new Map();

  recordCall(runId: string, call: ItemizedCall) {
    const existing = this.runs.get(runId) || [];
    existing.push(call);
    this.runs.set(runId, existing);
  }

  generateReceipt(runId: string, remainingDailyLimitUnits: bigint): ReconciledRunReceipt {
    const calls = this.runs.get(runId) || [];
    let totalAtomic = 0n;

    for (const c of calls) {
      totalAtomic += BigInt(Math.round(parseFloat(c.pricePaidUsdc) * 1e6));
    }

    return {
      runId,
      calls,
      totalPaidUsdc: (Number(totalAtomic) / 1e6).toFixed(4),
      vaultRemainingCapUsdc: (Number(remainingDailyLimitUnits) / 1e6).toFixed(4),
    };
  }
}
