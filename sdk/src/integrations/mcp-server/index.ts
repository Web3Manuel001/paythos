import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Address, Hex } from 'viem';
import { AgentVoucherSigner } from '../../signer/voucherSigner';
import { PaythosVaultClient } from '../../client/vaultClient';

// Configuration loaded from Agent environment
const SESSION_PRIVATE_KEY = (process.env.PAYTHOS_SESSION_KEY || '0x0') as Hex;
const VAULT_ADDRESS = (process.env.PAYTHOS_VAULT_ADDRESS || '0x0') as Address;
const CHAIN_ID = Number(process.env.PAYTHOS_CHAIN_ID || 84532); // Default Base Sepolia
const RPC_URL = process.env.PAYTHOS_RPC_URL || 'https://sepolia.base.org';

const signer = new AgentVoucherSigner(SESSION_PRIVATE_KEY, VAULT_ADDRESS, CHAIN_ID);
const client = new PaythosVaultClient(VAULT_ADDRESS, RPC_URL);

const server = new Server(
  { name: 'paythos-agent-mcp', version: '2.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'paythos_get_session_status',
        description: 'Check active spending allowance, daily cap, and remaining balance for this AI agent session.',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'paythos_generate_payment_voucher',
        description: 'Sign an off-chain cumulative EIP-712 payment voucher to unlock an HTTP 402 paywalled tool or API.',
        inputSchema: {
          type: 'object',
          properties: {
            merchantAddress: { type: 'string', description: 'Address of the merchant or API provider' },
            tokenAddress: { type: 'string', description: 'Address of the payment token (e.g. USDC)' },
            amountUnits: { type: 'string', description: 'Incremental cost in atomic token units (e.g. 2000 for $0.002)' },
            sessionId: { type: 'string', description: 'Session identifier (default: 1)' },
          },
          required: ['merchantAddress', 'tokenAddress', 'amountUnits'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'paythos_get_session_status') {
    try {
      const session = await client.getSession(signer.agentAddress);
      const remainingToday = session.dailyLimit > session.spentToday ? session.dailyLimit - session.spentToday : 0n;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              agentAddress: signer.agentAddress,
              dailyLimit: session.dailyLimit.toString(),
              spentToday: session.spentToday.toString(),
              remainingToday: remainingToday.toString(),
              expiresAt: new Date(Number(session.expiresAt) * 1000).toISOString(),
              isActive: session.isActive,
            }, null, 2),
          },
        ],
      };
    } catch (err: any) {
      return { content: [{ type: 'text', text: `Failed to query session: ${err.message}` }], isError: true };
    }
  }

  if (name === 'paythos_generate_payment_voucher') {
    try {
      const merchant = args?.merchantAddress as Address;
      const token = args?.tokenAddress as Address;
      const delta = BigInt(args?.amountUnits as string);
      const sessionId = args?.sessionId ? BigInt(args?.sessionId as string) : 1n;

      const signed = await signer.signCumulativePayment(merchant, token, delta, sessionId);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'signed',
              voucher: {
                ...signed.voucher,
                sessionId: signed.voucher.sessionId.toString(),
                cumulativeAmount: signed.voucher.cumulativeAmount.toString(),
                expiresAt: signed.voucher.expiresAt.toString(),
                nonce: signed.voucher.nonce.toString(),
              },
              signature: signed.signature,
              headerPayload: Buffer.from(
                JSON.stringify({
                  voucher: {
                    ...signed.voucher,
                    sessionId: signed.voucher.sessionId.toString(),
                    cumulativeAmount: signed.voucher.cumulativeAmount.toString(),
                    expiresAt: signed.voucher.expiresAt.toString(),
                    nonce: signed.voucher.nonce.toString(),
                  },
                  signature: signed.signature,
                })
              ).toString('base64'),
            }, null, 2),
          },
        ],
      };
    } catch (err: any) {
      return { content: [{ type: 'text', text: `Failed to sign voucher: ${err.message}` }], isError: true };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
