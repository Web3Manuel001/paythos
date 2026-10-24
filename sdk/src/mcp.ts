import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { formatUnits, isAddress, type Address } from 'viem';
import { PaythosVaultClient } from './client/vaultClient.js';

export const ARC_TESTNET = {
  chainId: 5042002,
  rpcUrl: 'https://rpc.testnet.arc.io',
  explorerUrl: 'https://testnet.arcscan.app',
} as const;

export interface PaythosMcpConfig {
  vaultAddress: Address;
  agentAddress: Address;
  rpcUrl?: string;
}

/**
 * Creates a read-only MCP server for inspecting an Arc Testnet Paythos session.
 * No private key is accepted and importing this module has no side effects.
 */
export function createPaythosMcpServer(config: PaythosMcpConfig): McpServer {
  if (!isAddress(config.vaultAddress) || !isAddress(config.agentAddress)) {
    throw new Error('Paythos MCP requires valid vaultAddress and agentAddress values.');
  }

  const client = new PaythosVaultClient(
    config.vaultAddress,
    config.rpcUrl ?? ARC_TESTNET.rpcUrl,
  );
  const server = new McpServer({ name: 'paythos-arc', version: '1.0.0' });

  server.registerTool(
    'paythos_get_session_status',
    {
      title: 'Read Paythos session status',
      description: 'Read the configured agent session allowance and expiry from the Paythos vault on Arc Testnet. This tool cannot move funds or sign transactions.',
      inputSchema: { },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async () => {
      const observedChainId = await client.publicClient.getChainId();
      if (observedChainId !== ARC_TESTNET.chainId) {
        throw new Error(`Expected Arc Testnet (${ARC_TESTNET.chainId}), RPC returned chain ${observedChainId}.`);
      }
      const session = await client.getSession(config.agentAddress);
      const remaining = session.dailyLimit > session.spentToday
        ? session.dailyLimit - session.spentToday
        : 0n;
      const status = {
        network: 'Arc Testnet',
        chainId: ARC_TESTNET.chainId,
        vaultAddress: config.vaultAddress,
        agentAddress: config.agentAddress,
        dailyLimitUsdc: formatUnits(session.dailyLimit, 6),
        spentTodayUsdc: formatUnits(session.spentToday, 6),
        remainingTodayUsdc: formatUnits(remaining, 6),
        expiresAt: new Date(Number(session.expiresAt) * 1000).toISOString(),
        isActive: session.isActive,
      };
      return { content: [{ type: 'text', text: JSON.stringify(status, null, 2) }] };
    },
  );

  server.registerTool(
    'paythos_get_settled_amount',
    {
      title: 'Read settled payment total',
      description: 'Read the cumulative amount already settled for a merchant and token in a Paythos session. This tool cannot move funds or sign transactions.',
      inputSchema: {
        merchantAddress: z.string().refine(isAddress, 'Expected an EVM address'),
        tokenAddress: z.string().refine(isAddress, 'Expected an EVM address'),
        sessionId: z.string().regex(/^\d+$/, 'Expected an unsigned integer string').default('1'),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ merchantAddress, tokenAddress, sessionId }) => {
      const observedChainId = await client.publicClient.getChainId();
      if (observedChainId !== ARC_TESTNET.chainId) {
        throw new Error(`Expected Arc Testnet (${ARC_TESTNET.chainId}), RPC returned chain ${observedChainId}.`);
      }
      const amount = await client.getSettledAmount(
        config.agentAddress,
        merchantAddress as Address,
        BigInt(sessionId),
        tokenAddress as Address,
      );
      return { content: [{ type: 'text', text: JSON.stringify({
        network: 'Arc Testnet',
        amountAtomic: amount.toString(),
        decimals: 6,
        amountUsdc: formatUnits(amount, 6),
      }, null, 2) }] };
    },
  );

  return server;
}

/** Explicit stdio entry point for local MCP clients. */
export async function startPaythosMcpServer(config: PaythosMcpConfig): Promise<void> {
  const server = createPaythosMcpServer(config);
  await server.connect(new StdioServerTransport());
}
