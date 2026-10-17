import { Address, Hex } from 'viem';
import { AgentVoucherSigner } from '../../sdk/src/signer/voucherSigner';
import { TransactabilityIndex } from '../../sdk/src/reputation/transactability';
import { RunReceiptLedger, ReconciledRunReceipt } from '../../sdk/src/ledger/receipt';
import { queryArcMarketplace, ArcServiceEndpoint } from '../tools/arc-market';

export interface ErrandTask {
  description: string;
  category: 'INFERENCE' | 'SEARCH' | 'TELEMETRY' | 'VOICE';
  payload?: any;
}

export class GoferAgent {
  private signer: AgentVoucherSigner;
  private transactability: TransactabilityIndex;
  private ledger: RunReceiptLedger;
  public readonly vaultAddress: Address;
  public readonly agentAddress: Address;

  constructor(
    sessionPrivateKey: Hex,
    vaultAddress: Address,
    chainId: number = 50420 // Arc L1 Mainnet (or 84532 Base Sepolia)
  ) {
    this.signer = new AgentVoucherSigner(sessionPrivateKey, vaultAddress, chainId);
    this.transactability = new TransactabilityIndex();
    this.ledger = new RunReceiptLedger();
    this.vaultAddress = vaultAddress;
    this.agentAddress = this.signer.agentAddress;
  }

  /**
   * Executes a multi-step autonomous errand flow:
   * Discover -> Health Preflight -> EIP-712 Sign -> Execute -> Reconcile Receipt
   */
  async executeErrand(
    runId: string,
    tasks: ErrandTask[],
    mockMerchantAddress: Address,
    usdcAddress: Address
  ): Promise<{
    receipt: ReconciledRunReceipt;
    completedTasks: number;
    log: string[];
  }> {
    const logs: string[] = [];
    logs.push(`🚀 [Gofer Agent ${this.agentAddress.slice(0, 8)}...] Initializing Errand Run: ${runId}`);

    let completedTasks = 0;

    for (const task of tasks) {
      logs.push(`\n▶ Task [${task.category}]: ${task.description}`);

      // 1. Discovery via Arc Marketplace
      const candidates = queryArcMarketplace(task.category);
      if (candidates.length === 0) {
        logs.push(`  ⚠ No endpoints found in arc.market catalog for category: ${task.category}`);
        continue;
      }
      const selectedEndpoint: ArcServiceEndpoint = candidates[0];
      logs.push(`  ✓ Matched arc.market Endpoint: ${selectedEndpoint.name} (${selectedEndpoint.url})`);

      // 2. Transactability Pre-flight Check (Selat Model)
      const healthCheck = this.transactability.canTransact(selectedEndpoint.url);
      if (!healthCheck.allowed) {
        logs.push(`  ✕ Pre-flight check failed: ${healthCheck.reason}. Skipping spend.`);
        continue;
      }
      logs.push(`  ✓ Pre-flight Transactability Score: 100% OK (Healthy)`);

      // 3. EIP-712 Off-Chain Voucher Generation (< 1ms)
      const costUnits = BigInt(Math.round(parseFloat(selectedEndpoint.costPerCallUsdc) * 1e6));
      const signedVoucher = await this.signer.signCumulativePayment(
        mockMerchantAddress,
        usdcAddress,
        costUnits
      );
      logs.push(`  ⚡ Generated EIP-712 Voucher: Cumulative Debt = $${(Number(signedVoucher.voucher.cumulativeAmount) / 1e6).toFixed(4)} USDC`);

      // 4. Record Call into Run Ledger
      this.ledger.recordCall(runId, {
        endpoint: selectedEndpoint.url,
        scheme: 'x402',
        pricePaidUsdc: selectedEndpoint.costPerCallUsdc,
        timestamp: Date.now(),
      });

      // 5. Update Transactability Telemetry
      this.transactability.recordResult(selectedEndpoint.url, 200, 140);
      logs.push(`  ✓ Mock Execution Succeeded: Response 200 OK (140ms latency)`);
      completedTasks++;
    }

    // 6. Generate Reconciled Itemized Receipt
    const remainingDailyLimitMock = 1000_000_000n - this.signer.getCurrentCumulative(mockMerchantAddress, 1n, usdcAddress);
    const receipt = this.ledger.generateReceipt(runId, remainingDailyLimitMock);

    logs.push(`\n======================================================`);
    logs.push(`📋 GOFER RUN RECONCILED RECEIPT: ${receipt.runId}`);
    logs.push(`• Total Inferences Settled: ${receipt.calls.length}`);
    logs.push(`• Total Paid in Circle USDC: $${receipt.totalPaidUsdc}`);
    logs.push(`• Vault Daily Limit Remaining: $${receipt.vaultRemainingCapUsdc}`);
    logs.push(`======================================================`);

    return { receipt, completedTasks, log: logs };
  }
}
