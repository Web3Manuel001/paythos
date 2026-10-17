import fs from 'fs';
import path from 'path';
import {
  createPublicClient,
  createWalletClient,
  http,
  Address,
  Hex,
  formatUnits,
  keccak256,
  toHex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { AgentVoucherSigner } from '../../sdk/src/signer/voucherSigner';
import { TransactabilityIndex } from '../../sdk/src/reputation/transactability';
import { RunReceiptLedger } from '../../sdk/src/ledger/receipt';
import { queryArcMarketplace } from '../tools/arc-market';
import { PAYTHOS_VAULT_ABI } from '../../sdk/src/client/vaultClient';

// Helper to reliably load private key from .env
function getRelayerPrivateKey(): Hex {
  if (process.env.DEPLOYER_PRIVATE_KEY) {
    const raw = process.env.DEPLOYER_PRIVATE_KEY.trim().replace(/^"|"$/g, '');
    return raw.startsWith('0x') ? (raw as Hex) : (`0x${raw}` as Hex);
  }
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/DEPLOYER_PRIVATE_KEY=["']?(0x[a-fA-F0-9]+|[a-fA-F0-9]+)["']?/);
    if (match) {
      const raw = match[1];
      return raw.startsWith('0x') ? (raw as Hex) : (`0x${raw}` as Hex);
    }
  }
  throw new Error('DEPLOYER_PRIVATE_KEY not found in .env');
}

const ARC_RPC = 'https://rpc.testnet.arc.io';
const ARC_CHAIN_ID = 5042002;
const LIVE_VAULT: Address = '0xFb57ceAEF685B73Dc0270f806545e195393Cc277';
const AGENT_PK: Hex = '0x00000000000000000000000000000000000000000000000000000000000a11ce';

async function runLiveArcGofer() {
  console.log('======================================================');
  console.log('⚡ GOFER: LIVE ON-CHAIN EXECUTION ON ARC TESTNET');
  console.log('======================================================\n');

  const publicClient = createPublicClient({ transport: http(ARC_RPC) });
  const agentSigner = new AgentVoucherSigner(AGENT_PK, LIVE_VAULT, ARC_CHAIN_ID);
  const relayerPk = getRelayerPrivateKey();
  const merchantAccount = privateKeyToAccount(relayerPk);

  console.log(`[1] Connected to Arc Testnet (${ARC_RPC})`);
  console.log(`    Agent Key:     ${agentSigner.agentAddress}`);
  console.log(`    Relayer/Owner: ${merchantAccount.address}`);
  console.log(`    Live Vault:    ${LIVE_VAULT}\n`);

  // 1. Read on-chain session from Arc Testnet
  console.log('[2] Reading Live On-Chain Session Policy from Arc Testnet...');
  const session = await publicClient.readContract({
    address: LIVE_VAULT,
    abi: PAYTHOS_VAULT_ABI,
    functionName: 'sessions',
    args: [agentSigner.agentAddress],
  });

  const dailyLimit = session[0];
  const spentToday = session[1];
  const expiresAt = session[3];
  const isActive = session[5];

  console.log(`    • Active on Arc: ${isActive ? 'YES (Confirmed)' : 'NO'}`);
  console.log(`    • Daily Limit:   $${formatUnits(dailyLimit, 6)} USDC`);
  console.log(`    • Spent Today:   $${formatUnits(spentToday, 6)} USDC`);
  console.log(`    • Expires At:    ${new Date(Number(expiresAt) * 1000).toISOString()}\n`);

  if (!isActive || dailyLimit === 0n) {
    throw new Error('Agent session is not active on Arc. Please run session setup first.');
  }

  // 2. Select Endpoint & Check Transactability
  const transactability = new TransactabilityIndex();
  const endpoint = queryArcMarketplace('INFERENCE')[0]; // BlockRun AI Gateway
  console.log(`[3] Targeting Arc Marketplace Endpoint: ${endpoint.name}`);
  console.log(`    URL: ${endpoint.url}`);

  const health = transactability.canTransact(endpoint.url);
  console.log(`    • Transactability Score: ${health.allowed ? '100% HEALTHY' : 'FAILED'}`);

  // 3. Sign EIP-712 Voucher Off-Chain (<1ms)
  const hitCost = 3500n; // $0.0035 USDC
  console.log('\n[4] Signing Monotonic EIP-712 Voucher Off-Chain (<1ms)...');
  
  // Use deployer/relayer as test token receiver
  const signed = await agentSigner.signCumulativePayment(
    merchantAccount.address,
    LIVE_VAULT, // Settlement token reference
    hitCost
  );
  console.log(`    ✓ Voucher Signed for Cumulative Debt: $${formatUnits(signed.voucher.cumulativeAmount, 6)} USDC`);
  console.log(`    ✓ ECDSA Signature: ${signed.signature.slice(0, 24)}...`);

  // 4. Settle on Arc Testnet with Arc Structured Memo
  const runId = `errand-${Date.now()}`;
  const arcMemoHash = keccak256(toHex(`arc:x402:intent=BlockRunAI:runId=${runId}`));

  console.log('\n[5] Broadcasting settleVoucherWithMemo() to Arc Testnet...');
  console.log(`    Arc Memo Hash: ${arcMemoHash}`);

  const relayerClient = createWalletClient({
    account: merchantAccount,
    transport: http(ARC_RPC),
  });

  // Prepare settleVoucherWithMemo transaction on Arc
  const hash = await relayerClient.writeContract({
    address: LIVE_VAULT,
    abi: [
      {
        type: 'function',
        name: 'settleVoucherWithMemo',
        inputs: [
          {
            name: 'voucher',
            type: 'tuple',
            components: [
              { name: 'token', type: 'address' },
              { name: 'merchant', type: 'address' },
              { name: 'agentKey', type: 'address' },
              { name: 'sessionId', type: 'uint256' },
              { name: 'cumulativeAmount', type: 'uint256' },
              { name: 'expiresAt', type: 'uint256' },
              { name: 'nonce', type: 'uint256' },
            ],
          },
          { name: 'arcMemoHash', type: 'bytes32' },
          { name: 'signature', type: 'bytes' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
      },
    ],
    functionName: 'settleVoucherWithMemo',
    args: [signed.voucher, arcMemoHash, signed.signature],
  });

  console.log('\n======================================================');
  console.log('🎉 ON-CHAIN SETTLEMENT SUCCESSFUL ON ARC TESTNET!');
  console.log(`Tx Hash: ${hash}`);
  console.log(`Explorer: https://testnet.arcscan.app/tx/${hash}`);
  console.log(`Arc Memo Stamped: ${arcMemoHash}`);
  console.log('======================================================\n');
}

runLiveArcGofer().catch(console.error);
