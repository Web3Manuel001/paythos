import { Address, Hex } from 'viem';
import { GoferAgent, ErrandTask } from './agent';

const MOCK_SESSION_KEY: Hex = '0x00000000000000000000000000000000000000000000000000000000000a11ce';
const ARC_VAULT_ADDRESS: Address = '0x6E0837c166c01710dC86f2E25DAE2fFD574343D9';
const MOCK_MERCHANT: Address = '0x0000000000000000000000000000000000000003';
const NATIVE_USDC: Address = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

async function main() {
  console.log('🤖 Starting Gofer Autonomous Errand Desk...\n');

  const gofer = new GoferAgent(MOCK_SESSION_KEY, ARC_VAULT_ADDRESS, 50420);

  // Define an autonomous multi-step research pipeline
  const tasks: ErrandTask[] = [
    {
      category: 'TELEMETRY',
      description: 'Fetch real-time Circle USDC and crypto token pricing data',
    },
    {
      category: 'SEARCH',
      description: 'Run neural web search for Circle Arc Layer 1 announcements',
    },
    {
      category: 'INFERENCE',
      description: 'Synthesize research brief using BlockRun AI 95+ model gateway',
    },
  ];

  const runId = `errand-${Date.now()}`;
  const result = await gofer.executeErrand(runId, tasks, MOCK_MERCHANT, NATIVE_USDC);

  // Print execution stream
  result.log.forEach((line) => console.log(line));
}

main().catch(console.error);
