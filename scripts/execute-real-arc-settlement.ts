import fs from 'fs';
import path from 'path';
import {
  createPublicClient,
  createWalletClient,
  http,
  Address,
  Hex,
  keccak256,
  toHex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { AgentVoucherSigner } from '../sdk/src/signer/voucherSigner';

function getDeployerKey(): Hex {
  const envPath = path.resolve(process.cwd(), '.env');
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/DEPLOYER_PRIVATE_KEY=["']?(0x[a-fA-F0-9]+|[a-fA-F0-9]+)["']?/);
  if (!match) throw new Error('DEPLOYER_PRIVATE_KEY not found in .env');
  const k = match[1];
  return k.startsWith('0x') ? (k as Hex) : (`0x${k}` as Hex);
}

const ARC_RPC = 'https://rpc.testnet.arc.io';
const ARC_CHAIN_ID = 5042002;
const ARC_USDC: Address = '0x3600000000000000000000000000000000000000';
const LIVE_VAULT: Address = '0xa9d5525BE440831c64695d30c915DF303E0151EF';

async function main() {
  const deployerKey = getDeployerKey();
  const relayerAccount = privateKeyToAccount(deployerKey);
  const publicClient = createPublicClient({ transport: http(ARC_RPC) });
  const walletClient = createWalletClient({ account: relayerAccount, transport: http(ARC_RPC) });

  console.log('======================================================');
  console.log('⚡ EXECUTING REAL ON-CHAIN SETTLEMENT ON ARC TESTNET');
  console.log(`Vault Address: ${LIVE_VAULT}`);
  console.log(`Relayer:       ${relayerAccount.address}`);
  console.log('======================================================\n');

  const agentKey: Hex = '0x00000000000000000000000000000000000000000000000000000000000a11ce';
  const agentAccount = privateKeyToAccount(agentKey);

  // 1. Fund Vault with 0.1 USDC collateral so it can pay claims
  console.log('1. Funding PaythosVault with 0.1 USDC collateral on Arc...');
  const erc20Abi = [
    {
      type: 'function',
      name: 'transfer',
      inputs: [{ name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }],
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
    },
  ] as const;

  try {
    const fundTx = await walletClient.writeContract({
      address: ARC_USDC,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [LIVE_VAULT, 100_000n], // 0.1 USDC (6 decimals)
    });
    console.log(`   Fund Tx: ${fundTx}`);
    await publicClient.waitForTransactionReceipt({ hash: fundTx });
    console.log(`   ✓ Vault collateral funded on Arc Testnet!\n`);
  } catch (err: any) {
    console.log(`   (Note on funding: ${err.message?.slice(0, 80)}...)\n`);
  }

  // 2. Authorize Agent Session on-chain
  console.log('2. Creating on-chain agent session policy...');
  const vaultAbi = [
    {
      type: 'function',
      name: 'createSession',
      inputs: [
        { name: 'agentKey', type: 'address' },
        { name: 'dailyLimit', type: 'uint256' },
        { name: 'durationInSeconds', type: 'uint256' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
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
  ] as const;

  const createTx = await walletClient.writeContract({
    address: LIVE_VAULT,
    abi: vaultAbi,
    functionName: 'createSession',
    args: [agentAccount.address, 10_000_000n, 86400n * 30n], // $10 USDC daily limit, 30 days
  });
  console.log(`   Session Tx: ${createTx}`);
  await publicClient.waitForTransactionReceipt({ hash: createTx });
  console.log(`   ✓ Agent authorized on-chain at block height!\n`);

  // 3. Sign EIP-712 Voucher Off-Chain (<1ms)
  console.log('3. Signing real EIP-712 voucher off-chain...');
  const signer = new AgentVoucherSigner(agentKey, LIVE_VAULT, ARC_CHAIN_ID);
  const ticket = await signer.signCumulativePayment(relayerAccount.address, ARC_USDC, 10_000n); // $0.01 USDC
  console.log(`   ✓ Voucher signed for: $0.01 USDC (Nonce: ${ticket.voucher.nonce})`);

  // 4. Settle on Arc Testnet with Arc Structured Memo
  console.log('4. Broadcasting settleVoucherWithMemo() to Arc Testnet...');
  const arcMemoHash = keccak256(toHex(`paythos:first-settlement:${Date.now()}`));

  const settleTx = await walletClient.writeContract({
    address: LIVE_VAULT,
    abi: vaultAbi,
    functionName: 'settleVoucherWithMemo',
    args: [ticket.voucher, arcMemoHash, ticket.signature],
  });

  console.log(`   Broadcasted Tx: ${settleTx}`);
  console.log(`   Waiting for on-chain block confirmation...`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: settleTx });

  console.log('\n======================================================');
  console.log('🎉 REAL ON-CHAIN SETTLEMENT CONFIRMED ON ARC TESTNET!');
  console.log(`Status:         ${receipt.status === 'success' ? 'SUCCESS (Confirmed)' : 'FAILED'}`);
  console.log(`Block Number:   #${receipt.blockNumber}`);
  console.log(`Tx Hash:        ${receipt.transactionHash}`);
  console.log(`Explorer Link:  https://testnet.arcscan.app/tx/${receipt.transactionHash}`);
  console.log(`Arc Memo Hash:  ${arcMemoHash}`);
  console.log('======================================================\n');
}

main().catch(console.error);
