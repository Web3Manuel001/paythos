import readline from 'readline';
import { Address, Hex } from 'viem';
import { GoferRuntime, ErrandStepPlan } from './core/runtime';

// Live Arc Testnet Configuration
const LIVE_VAULT: Address = '0xFb57ceAEF685B73Dc0270f806545e195393Cc277';
const CANONICAL_USDC: Address = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const MERCHANT: Address = '0xB7800423D65aB8aa92E5BD3791aa1733ca44673a';
const AGENT_PK: Hex = '0x00000000000000000000000000000000000000000000000000000000000a11ce';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  const runtime = new GoferRuntime(AGENT_PK, LIVE_VAULT, 5042002);

  console.clear();
  console.log('======================================================');
  console.log('🤖 GOFER v2: OPERATOR COMMAND DESK (ARC L1 NATIVE)');
  console.log('======================================================');
  console.log(`Vault:      ${LIVE_VAULT}`);
  console.log(`Settlement: Circle USDC on Arc Testnet (5042002)`);
  console.log(`Engine:     Jev System One + Proof.com PoA Witness Chain`);
  console.log('------------------------------------------------------');
  console.log('Available Commands:');
  console.log('  1. run <intent>   - Execute custom autonomous errand pipeline');
  console.log('  2. market         - Run crypto pricing intelligence pipeline');
  console.log('  3. research       - Run live web probe & synthesis pipeline');
  console.log('  4. exit           - Exit operator desk');
  console.log('======================================================\n');

  const prompt = () => {
    rl.question('Gofer > ', async (input) => {
      const trimmed = input.trim();
      const [cmd, ...rest] = trimmed.split(' ');

      if (cmd === 'exit') {
        rl.close();
        process.exit(0);
      }

      let intent = rest.join(' ');
      let steps: ErrandStepPlan[] = [];

      if (cmd === 'market' || (cmd === 'run' && (!intent || intent.includes('market')))) {
        intent = intent || 'Fetch real-time crypto price telemetry';
        steps = [
          { name: 'CoinGecko Live API Ping', url: 'https://api.coingecko.com/api/v3/ping', costUsdc: '0.0005' },
          { name: 'Circle Arc Testnet RPC Node Probe', url: 'https://rpc.testnet.arc.io', costUsdc: '0.0010' },
        ];
      } else if (cmd === 'research' || (cmd === 'run' && intent.includes('research'))) {
        intent = intent || 'Run neural search and synthesize research brief';
        steps = [
          { name: 'Live Web Connectivity Check', url: 'https://api.coingecko.com/api/v3/ping', costUsdc: '0.0010' },
          { name: 'Arc L1 Explorer Telemetry', url: 'https://testnet.arcscan.app', costUsdc: '0.0025' },
        ];
      } else if (cmd === 'run') {
        steps = [
          { name: 'Live Endpoint Probe', url: 'https://api.coingecko.com/api/v3/ping', costUsdc: '0.0020' }
        ];
      } else {
        console.log(`Unknown command: "${trimmed}". Type "market", "research", "run <intent>", or "exit".\n`);
        prompt();
        return;
      }

      try {
        const result = await runtime.executeErrand(intent, steps, MERCHANT, CANONICAL_USDC);
        result.log.forEach((l) => console.log(l));
      } catch (err: any) {
        console.error(`\n❌ Errand Failed: ${err.message}\n`);
      }

      prompt();
    });
  };

  prompt();
}

main().catch(console.error);
