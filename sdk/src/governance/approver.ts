export interface SpendAuthorizationRequest {
  agentAddress: string;
  merchantAddress: string;
  amountUsdc: string;
  taskIntent: string;
  timestamp: number;
}

export interface SpendApprovalResponse {
  approved: boolean;
  approvedBy: string; // "AUTONOMOUS_POLICY" | "HUMAN_OPERATOR"
  reason: string;
}

export class PolicyApprovalEngine {
  private autonomousThresholdUsdc: number; // e.g. $10.00 max for autonomous machine execution

  constructor(autonomousThresholdUsdc: number = 10.0) {
    this.autonomousThresholdUsdc = autonomousThresholdUsdc;
  }

  /**
   * Evaluates if a spend requires human-in-the-loop escalation
   */
  async requestSpendApproval(req: SpendAuthorizationRequest): Promise<SpendApprovalResponse> {
    const amount = parseFloat(req.amountUsdc);

    // 1. Below Threshold: Autonomous approval under spend cap
    if (amount <= this.autonomousThresholdUsdc) {
      return {
        approved: true,
        approvedBy: 'AUTONOMOUS_POLICY',
        reason: `Amount $${amount} is within autonomous threshold ($${this.autonomousThresholdUsdc})`,
      };
    }

    // 2. Above Threshold: Real-time escalation hook (Slack / Webhook / Passkey)
    console.warn(`⚠️ [Paythos Governance Alert] High-value spend requested: $${amount} USDC by ${req.agentAddress}`);
    console.warn(`   Task: "${req.taskIntent}"`);
    console.warn(`   Target Merchant: ${req.merchantAddress}`);
    
    // In production, this dispatches a Slack/Discord webhook or mobile push notification
    // For local evaluation, we reject unauthorized over-threshold attempts by default (Fail Closed)
    return {
      approved: false,
      approvedBy: 'HUMAN_OPERATOR',
      reason: `Spend ($${amount} USDC) exceeds autonomous limit ($${this.autonomousThresholdUsdc}). Requires human authorization.`,
    };
  }
}
