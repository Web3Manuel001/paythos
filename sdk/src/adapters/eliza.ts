import { formatUnits, type Address } from 'viem';
import { PaythosVaultClient } from '../client/vaultClient.js';

export interface ElizaPaythosConfig {
  client: PaythosVaultClient;
  agentAddress: Address;
}

export interface ElizaProviderResult {
  text: string;
  values: Record<string, string | boolean>;
  data: Record<string, string | boolean>;
}

export interface ElizaProvider {
  name: string;
  description: string;
  get: (...args: never[]) => Promise<ElizaProviderResult>;
}

export interface ElizaPlugin {
  name: string;
  description: string;
  providers: ElizaProvider[];
  actions: [];
}

/**
 * Returns an ElizaOS plugin with a read-only session provider. It intentionally
 * exposes no payment action: signing and transaction approval need a separate,
 * user-authorized execution flow.
 */
export function createAgentPayElizaPlugin(config: ElizaPaythosConfig): ElizaPlugin {
  return {
    name: 'paythos-arc',
    description: 'Read-only Arc Testnet Paythos session context.',
    actions: [],
    providers: [{
      name: 'PAYTHOS_SESSION',
      description: 'Current Arc Testnet Paythos allowance, remaining amount, and session status.',
      get: async () => {
        const session = await config.client.getSession(config.agentAddress);
        const remaining = session.dailyLimit > session.spentToday
          ? session.dailyLimit - session.spentToday
          : 0n;
        const values = {
          network: 'Arc Testnet',
          dailyLimitUsdc: formatUnits(session.dailyLimit, 6),
          spentTodayUsdc: formatUnits(session.spentToday, 6),
          remainingTodayUsdc: formatUnits(remaining, 6),
          isActive: session.isActive,
        };
        return {
          text: `Paythos Arc Testnet session: daily limit $${values.dailyLimitUsdc} USDC; spent $${values.spentTodayUsdc}; remaining $${values.remainingTodayUsdc}; ${session.isActive ? 'active' : 'inactive'}. Read-only status.`,
          values,
          data: values,
        };
      },
    }],
  };
}
