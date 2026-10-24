import { isAddress, type Address } from 'viem';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ARC_TESTNET, startPaythosMcpServer } from '../../mcp.js';

/** Loads explicit read-only Arc Testnet MCP configuration from the environment. */
export async function startConfiguredPaythosMcpServer(): Promise<void> {
  const chainId = Number(process.env.PAYTHOS_CHAIN_ID ?? ARC_TESTNET.chainId);
  const vaultAddress = process.env.PAYTHOS_VAULT_ADDRESS;
  const agentAddress = process.env.PAYTHOS_AGENT_ADDRESS;

  if (chainId !== ARC_TESTNET.chainId) {
    throw new Error(`This MCP server currently supports Arc Testnet only (${ARC_TESTNET.chainId}).`);
  }
  if (!vaultAddress || !isAddress(vaultAddress)) {
    throw new Error('Set PAYTHOS_VAULT_ADDRESS to the deployed Arc Testnet vault address.');
  }
  if (!agentAddress || !isAddress(agentAddress)) {
    throw new Error('Set PAYTHOS_AGENT_ADDRESS to the agent wallet address whose session will be inspected.');
  }

  await startPaythosMcpServer({
    vaultAddress: vaultAddress as Address,
    agentAddress: agentAddress as Address,
    rpcUrl: process.env.PAYTHOS_RPC_URL ?? ARC_TESTNET.rpcUrl,
  });
}

const invokedPath = process.argv[1];
if (invokedPath && import.meta.url === pathToFileURL(resolve(invokedPath)).href) {
  startConfiguredPaythosMcpServer().catch((error: unknown) => {
    console.error('Paythos MCP server failed to start:', error);
    process.exitCode = 1;
  });
}
