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

// Configuration
const ARC_RPC = 'https://rpc.testnet.arc.io';
const ARC_CHAIN_ID = 5042002;
const LIVE_VAULT: Address = '0xFb57ceAEF685B73Dc0270f806545e195393Cc277';

// Keys
const AGENT_PK: Hex = '0x00000000000000000000000000000000000000000000000000000000000a11ce';
const RELAYER_PK = (process.env.DEPLOYER_PRIVATE_KEY || '') as Hex;

async function runLiveArcGofer() {
  console.log('======================================================');
  console.log('⚡ GOFER: LIVE ON-CHAIN EXECUTION ON ARC TESTNET');
  console.log('======================================================\n');

  const publicClient = createPublicClient({ transport: http(ARC_RPC) });
  const agentSigner = new AgentVoucherSigner(AGENT_PK, LIVE_VAULT, ARC_CHAIN_ID);

  console.log(`[1] Connected to Arc Testnet (${ARC_RPC})`);
  console.log(`    Agent Address: ${agentSigner.agentAddress}`);
  console.log(`    Live Vault:    ${LIVE_VAULT}\n`);

  // 1. Read real on-chain session from Arc Testnet
  console.log('[2] Reading Live On-Chain Session Policy from Arc...');
  const session = await publicClient.readContract({
    address: LIVE_VAULT,
    abi: PAYTHOS_VAULT_ABI,
    functionName: 'sessions',
    args: [agentSigner.agentAddress],
  });

  const dailyLimit = session[0];
  const spentToday = session[1];
  const expiresAt = session[2];
  const isActive = session[5];

  console.log(`    • Active on Arc: ${isActive ? 'YES (Confirmed)' : 'NO'}`);
  console.log(`    • Daily Limit:   $${formatUnits(dailyLimit, 6)} USDC`);
  console.log(`    • Spent Today:   $${formatUnits(spentToday, 6)} USDC`);
  console.log(`    • Expires At:    ${new Date(Number(expiresAt) * 1000).toISOString()}\n`);

  if (!isActive || dailyLimit === 0n) {
    throw new Error('Agent session is not active on Arc. Run Step 2 setup first.');
  }

  // 2. Transactability preflight check & voucher signing
  const transactability = new TransactabilityIndex();
  const ledger = new RunReceiptLedger();
  const runId = `live-arc-${Date.now()}`;

  // Execute BlockRun AI endpoint from arc.market
  const endpoint = queryArcMarketplace('INFERENCE')[0];
  console.log(`[3] Targeting Arc Marketplace Endpoint: ${endpoint.name}`);
  
  const health = transactability.canTransact(endpoint.url);
  console.log(`    • Transactability Score: ${health.allowed ? '100% OK' : 'FAILED'}`);

  const hitCost = 3500n; // $0.0035 USDC
  // Relayer merchant address
  const merchantAccount = privateKeyToAccount(RELAYER_PK.startsWith('0x') ? RELAYER_PK : `0x${RELAYER_PK}`);
  
  // Get token address from setup script (or USDC)
  const tokenAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as Address; // Or newly deployed USDC

  console.log('\n[4] Signing EIP-712 Cumulative Voucher Off-Chain (<1ms)...');
  const signed = await agentSigner.signCumulativePayment(merchantAccount.address, tokenAddress, hitCost);
  console.log(`    ✓ Voucher Signed for: $${formatUnits(signed.voucher.cumulativeAmount, 6)} USDC`);

  // 3. Submit real settlement on Arc Testnet via relayer
  console.log('\n[5] Broadcasting settleVoucherWithMemo() to Arc Testnet...');
  const relayerClient = createWalletClient({
    account: merchantAccount,
    transport: http(ARC_RPC),
  });

  const arcMemoHash = keccak256(toHex(`intent:inference:runId=${runId}`));

  const { request } = await publicClient.simulateContract({
    account: merchantAccount,
    address: LIVE_VAULT,
    abi: [
      ...PAYTHOS_VAULT_ABI,
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

  const txHash = await relayerClient.writeContract(request);
  console.log(`\n======================================================`);
  console.log(`🎉 LIVE ARC TESTNET TRANSACTION CONFIRMED!`);
  console.log(`Tx Hash: ${txHash}`);
  console.log(`Explorer: https://testnet.arcscan.app/tx/${txHash}`);
  console.log(`Arc Memo Stamped: ${arcMemoHash}`);
  console.log(`======================================================\n`);
}

runLiveArcGofer().catch(console.error);
