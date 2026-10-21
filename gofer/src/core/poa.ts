import { Hex, keccak256, toHex } from 'viem';

export interface AuthorizationEnvelope {
  runId: string;
  humanIntent: string;
  intentHash: Hex;
  jevSafetyScore: number; // 0.0 to 1.0 (Higher is safer)
  timestamp: number;
}

export interface WitnessStep {
  stepIndex: number;
  endpoint: string;
  priceUsdc: string;
  voucherSignature: Hex;
  httpStatus: number;
  timestamp: number;
}

export interface MerkleizedAuditCertificate {
  runId: string;
  intentHash: Hex;
  finalWitnessHash: Hex; // Stamped into Arc Structured Memo
  totalSteps: number;
  steps: WitnessStep[];
  timestamp: number;
}

/**
 * Native Proof-of-Authorization & Merkleized Witness Chain.
 * Stolen from Proof.com's legal non-repudiation architecture.
 */
export class ProofOfAuthorizationEngine {
  private currentRollingHash: Hex = '0x0';
  private steps: WitnessStep[] = [];
  private envelope!: AuthorizationEnvelope;

  initRun(runId: string, humanIntent: string, jevSafetyScore: number): AuthorizationEnvelope {
    const intentHash = keccak256(toHex(`intent:${humanIntent}:ts=${Date.now()}`));
    this.envelope = {
      runId,
      humanIntent,
      intentHash,
      jevSafetyScore,
      timestamp: Date.now(),
    };

    // H_0 = keccak256(RunId + IntentHash + SafetyScore)
    this.currentRollingHash = keccak256(
      toHex(`${runId}:${intentHash}:${jevSafetyScore}`)
    );
    this.steps = [];

    return this.envelope;
  }

  recordStep(
    endpoint: string,
    priceUsdc: string,
    voucherSignature: Hex,
    httpStatus: number
  ): Hex {
    const stepIndex = this.steps.length + 1;
    const step: WitnessStep = {
      stepIndex,
      endpoint,
      priceUsdc,
      voucherSignature,
      httpStatus,
      timestamp: Date.now(),
    };
    this.steps.push(step);

    // Merkleized rolling witness update:
    // H_n = keccak256(H_{n-1} + endpoint + voucherSignature + status)
    this.currentRollingHash = keccak256(
      toHex(`${this.currentRollingHash}:${endpoint}:${voucherSignature}:${httpStatus}`)
    );

    return this.currentRollingHash;
  }

  generateCertificate(): MerkleizedAuditCertificate {
    return {
      runId: this.envelope.runId,
      intentHash: this.envelope.intentHash,
      finalWitnessHash: this.currentRollingHash,
      totalSteps: this.steps.length,
      steps: this.steps,
      timestamp: Date.now(),
    };
  }

  getArcMemoHash(): Hex {
    return this.currentRollingHash;
  }
}
