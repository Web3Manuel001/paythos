import assert from 'node:assert/strict';
import test from 'node:test';
import { isAddress, type Address } from 'viem';
import { PaythosVaultClient } from '../src/client/vaultClient.js';

const ARC_TESTNET_CHAIN_ID = 5042002;
const ARC_TESTNET_RPC_URL = process.env.PAYTHOS_TEST_RPC_URL ?? 'https://rpc.testnet.arc.io';
const VAULT_ADDRESS = (process.env.PAYTHOS_TEST_VAULT_ADDRESS
  ?? '0xa9d5525BE440831c64695d30c915DF303E0151EF') as Address;
const NATIVE_USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
const EMPTY_AGENT_ADDRESS = '0x0000000000000000000000000000000000000000' as Address;

test('SDK reads the deployed Paythos vault on Arc Testnet', async () => {
  assert.ok(isAddress(VAULT_ADDRESS), 'configured vault address must be valid');

  const client = new PaythosVaultClient(VAULT_ADDRESS, ARC_TESTNET_RPC_URL);
  const chainId = await client.publicClient.getChainId();
  assert.equal(chainId, ARC_TESTNET_CHAIN_ID, 'RPC must point to Arc Testnet');

  const [settlementToken, emptyAgentSession] = await Promise.all([
    client.getSettlementToken(),
    client.getSession(EMPTY_AGENT_ADDRESS),
  ]);
  const proofReceipt = await client.publicClient.getTransactionReceipt({
    hash: '0xf7113e7d05dad2ae241439afd16c3dc8f093cbe415cf9c99b87134014bad193d',
  });

  assert.equal(settlementToken.toLowerCase(), NATIVE_USDC_ADDRESS.toLowerCase());
  assert.equal(emptyAgentSession.dailyLimit, 0n);
  assert.equal(emptyAgentSession.isActive, false);
  assert.equal(proofReceipt.status, 'success');
  assert.equal(proofReceipt.to?.toLowerCase(), VAULT_ADDRESS.toLowerCase());
});
