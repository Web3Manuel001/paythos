import readline from 'readline';
import { Address, Hex, formatUnits, createPublicClient, http } from 'viem';
import { AgentVoucherSigner } from '../../sdk/src/signer/voucherSigner';
import { queryArcMarketplace, ARC_MARKETPLACE_CATALOG } from '../tools/arc-market';
import { PAYTHOS_VAULT_ABI } from '../../sdk/src/client/vaultClient';

const ARC_RPC = 'https://rpc.testnet.arc.io';
const LIVE_VAULT: Address = '0xFb57ceAEF685B73Dc0270f806545e195393Cc277';
const AGENT_PK: Hex = '0x00000000000000000000000000000000000000000000000000000000000a11ce';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  const publicClient = createPublicClient({ transport: http(ARC_RPC) });
  const agent = new AgentVoucherSigner(AGENT_PK, LIVE_VAULT, 5042002);

  console.clear();
  console.log('======================================================');
  console.log('🤖 GOFER INTERACTIVE AGENT OPERATOR DESK (ARC L1)');
  console.log('======================================================');
  console.log(`Agent Key:   ${agent.agentAddress}`);
  console.log(`Arc Vault:   ${LIVE_VAULT}`);
  console.log(`Network:     Arc Testnet (Native USDC Gas)`);
  console.log('------------------------------------------------------');
  console.log('Commands:');
  console.log('  1. status           - Read live on-chain policy & allowance from Arc');
  console.log('  2. catalog          - List 482+ live endpoints on arc.market');
  console.log('  3. search <query>   - Run neural search via Exa on Arc ($0.0010)');
  console.log('  4. infer <prompt>   - Execute LLM synthesis via BlockRun ($0.0035)');
  console.log('  5. telemetry        - Query institutional CoinGecko ticker ($0.0005)');
  console.log('  6. exit             - Quit operator desk');
  console.log('======================================================\n');

  const promptUser = () => {
    rl.question('Gofer Operator > ', async (input) => {
      const trimmed = input.trim();
      const [cmd, ...args] = trimmed.split(' ');

      if (cmd === 'exit') {
        console.log('Shutting down Gofer operator desk.');
        rl.close();
        process.exit(0);
      } else if (cmd === 'status') {
        console.log('\n[Querying Arc Testnet on-chain...]');
        const session = await publicClient.readContract({
          address: LIVE_VAULT,
          abi: PAYTHOS_VAULT_ABI,
          functionName: 'sessions',
          args: [agent.agentAddress],
        });
        console.log(`• Status:      ${session[5] ? 'ACTIVE' : 'REVOKED'}`);
        console.log(`• Daily Cap:   $${formatUnits(session[0], 6)} USDC`);
        console.log(`• Spent Today: $${formatUnits(session[1], 6)} USDC`);
        console.log(`• Expires:     ${new Date(Number(session[3]) * 1000).toISOString()}\n`);
      } else if (cmd === 'catalog') {
        console.log('\n=== arc.market Verified Services ===');
        ARC_MARKETPLACE_CATALOG.forEach((item, i) => {
          console.log(`${i + 1}. [${item.category}] ${item.name} — $${item.costPerCallUsdc} USDC (${item.url})`);
        });
        console.log('');
      } else if (cmd === 'search' || cmd === 'infer' || cmd === 'telemetry') {
        const catMap = { search: 'SEARCH', infer: 'INFERENCE', telemetry: 'TELEMETRY' } as const;
        const target = queryArcMarketplace(catMap[cmd as keyof typeof catMap])[0];
        console.log(`\n▶ Routing to Arc Marketplace: ${target.name}`);
        console.log(`  Target URL: ${target.url}`);
        console.log(`  Price:      $${target.costPerCallUsdc} USDC`);

        const costUnits = BigInt(Math.round(parseFloat(target.costPerCallUsdc) * 1e6));
        const ticket = await agent.signCumulativePayment(
          '0xB7800423D65aB8aa92E5BD3791aa1733ca44673a',
          LIVE_VAULT,
          costUnits
        );
        console.log(`  ✓ EIP-712 Voucher Signed (<1ms)! Cumulative Debt = $${formatUnits(ticket.voucher.cumulativeAmount, 6)} USDC`);
        console.log(`  ✓ Transmitted X-Paythos-Voucher header: ${ticket.headerPayload.slice(0, 32)}...`);
        console.log(`  ✓ Mock Execution Succeeded: Response 200 OK\n`);
      } else {
        console.log(`Unknown command: "${trimmed}". Type "status", "catalog", "infer <prompt>", or "exit".\n`);
      }

      promptUser();
    });
  };

  promptUser();
}

main().catch(console.error);
