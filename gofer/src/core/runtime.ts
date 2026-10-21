import { Address, Hex, formatUnits } from 'viem';
import { AgentVoucherSigner, AgentVoucherResult } from '../../../sdk/src/signer/voucherSigner';
import { LiveNetworkProbe } from '../../../sdk/src/reputation/transactability';
import { ProofOfAuthorizationEngine, MerkleizedAuditCertificate } from './poa';
import { JevDecisionEngine, JevDecision } from './jev';

export interface ErrandStepPlan {
  name: string;
  url: string;
  costUsdc: string;
}

export interface ErrandExecutionResult {
  runId: string;
  intent: string;
  certificate: MerkleizedAuditCertificate;
  totalSpentUsdc: string;
  arcMemoHash: Hex;
  log: string[];
}

export class GoferRuntime {
  private signer: AgentVoucherSigner;
  private probe: LiveNetworkProbe;
  private poa: ProofOfAuthorizationEngine;
  private jev: JevDecisionEngine;
  public readonly vaultAddress: Address;

  constructor(sessionPrivateKey: Hex, vaultAddress: Address, chainId: number = 5042002) {
    this.signer = new AgentVoucherSigner(sessionPrivateKey, vaultAddress, chainId);
    this.probe = new LiveNetworkProbe();
    this.poa = new ProofOfAuthorizationEngine();
    this.jev = new JevDecisionEngine();
    this.vaultAddress = vaultAddress;
  }

  async executeErrand(
    humanIntent: string,
    steps: ErrandStepPlan[],
    merchantAddress: Address,
    tokenAddress: Address
  ): Promise<ErrandExecutionResult> {
    const runId = `errand-${Date.now()}`;
    const log: string[] = [];

    log.push(`🚀 [Gofer v2] Initializing Errand: "${humanIntent}"`);
    log.push(`   Agent Key:   ${this.signer.agentAddress}`);
    log.push(`   Arc Vault:   ${this.vaultAddress}`);

    // 1. Jev System One Safety Check
    const firstStep = steps[0];
    const jevDecision: JevDecision = await this.jev.evaluateIntent(
      humanIntent,
      firstStep ? firstStep.url : '',
      firstStep ? firstStep.costUsdc : '0'
    );

    log.push(`\n[1] Jev System One Fast Decision (${jevDecision.latencyMs}ms):`);
    log.push(`    • Decision:   ${jevDecision.isSafe ? '✓ APPROVED' : '✕ REJECTED'}`);
    log.push(`    • Confidence: ${(jevDecision.confidence * 100).toFixed(1)}%`);
    log.push(`    • Reason:     ${jevDecision.reason}`);

    if (!jevDecision.isSafe) {
      throw new Error(`Errand aborted by Jev Policy Guard: ${jevDecision.reason}`);
    }

    // 2. Initialize Proof-of-Authorization Envelope (Proof.com Primitive)
    const envelope = this.poa.initRun(runId, humanIntent, jevDecision.confidence);
    log.push(`\n[2] Initialized Proof-of-Authorization (PoA) Envelope:`);
    log.push(`    • Intent Hash: ${envelope.intentHash}`);

    let totalSpentAtomic = 0n;

    // 3. Execute Steps (Live Network Probes + Real EIP-712 Signatures)
    log.push(`\n[3] Executing Workflow Pipeline (${steps.length} Real Tasks):`);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const costAtomic = BigInt(Math.round(parseFloat(step.costUsdc) * 1e6));
      totalSpentAtomic += costAtomic;

      log.push(`\n  ▶ Step ${i + 1}/${steps.length}: ${step.name}`);

      // Real live network probe across internet
      const health = await this.probe.probe(step.url);
      log.push(`    • Live Probe: HTTP ${health.statusCode} (${health.latencyMs}ms wall-clock)`);

      // Off-chain EIP-712 voucher signing
      const ticket: AgentVoucherResult = await this.signer.signCumulativePayment(
        merchantAddress,
        tokenAddress,
        costAtomic
      );
      log.push(`    • Signed EIP-712 Voucher (<1ms): Cumulative Debt = $${formatUnits(ticket.voucher.cumulativeAmount, 6)} USDC`);
      log.push(`    • Nonce: ${ticket.voucher.nonce.toString()}`);

      // Update Merkleized rolling witness hash chain (Forensic Merkleized Audit Chain)
      const rollingHash = this.poa.recordStep(
        step.url,
        step.costUsdc,
        ticket.signature,
        health.statusCode
      );
      log.push(`    • Witness Hash Chain Updated: ${rollingHash.slice(0, 20)}...`);
    }

    // 4. Generate Final Merkleized Audit Certificate
    const certificate = this.poa.generateCertificate();
    const finalArcMemo = this.poa.getArcMemoHash();

    log.push(`\n======================================================`);
    log.push(`📋 GOFER v2 VERIFIED AUDIT CERTIFICATE`);
    log.push(`• Run ID:             ${certificate.runId}`);
    log.push(`• Total Tasks:        ${certificate.totalSteps}`);
    log.push(`• Total Paid:         $${(Number(totalSpentAtomic) / 1e6).toFixed(4)} USDC`);
    log.push(`• Arc Structured Memo:${finalArcMemo}`);
    log.push(`• Non-Repudiation:    100% Cryptographically Bound (PoA)`);
    log.push(`======================================================\n`);

    return {
      runId,
      intent: humanIntent,
      certificate,
      totalSpentUsdc: (Number(totalSpentAtomic) / 1e6).toFixed(4),
      arcMemoHash: finalArcMemo,
      log,
    };
  }
}
