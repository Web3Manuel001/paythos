import { formatUnits, type Address } from 'viem';
import { z } from 'zod';
import { PaythosVaultClient } from '../client/vaultClient.js';

export interface LangChainPaythosConfig {
  client: PaythosVaultClient;
  agentAddress: Address;
}

/**
 * Creates native LangChain tools for read-only Paythos session inspection.
 * Install `langchain` in the consuming agent application. This adapter does
 * not sign vouchers, initiate swaps, or submit transactions.
 */
export async function createLangChainTools(
  config: LangChainPaythosConfig,
): Promise<unknown[]> {
  let langchain: { tool?: (func: (...args: never[]) => unknown, options: Record<string, unknown>) => unknown };
  try {
    const packageName = 'langchain';
    langchain = await import(packageName) as typeof langchain;
  } catch {
    throw new Error('LangChain tools require the `langchain` package in the consuming application.');
  }
  if (typeof langchain.tool !== 'function') {
    throw new Error('The installed LangChain package does not export the current `tool` API.');
  }

  const checkBudget = langchain.tool(async () => {
    const session = await config.client.getSession(config.agentAddress);
    const remaining = session.dailyLimit > session.spentToday
      ? session.dailyLimit - session.spentToday
      : 0n;
    return JSON.stringify({
      network: 'Arc Testnet',
      dailyLimitUsdc: formatUnits(session.dailyLimit, 6),
      spentTodayUsdc: formatUnits(session.spentToday, 6),
      remainingTodayUsdc: formatUnits(remaining, 6),
      expiresAt: new Date(Number(session.expiresAt) * 1000).toISOString(),
      isActive: session.isActive,
    });
  }, {
    name: 'paythos_check_session',
    description: 'Read an Arc Testnet Paythos agent session budget and active status. Read-only; cannot move funds.',
    schema: z.object({}),
  });

  return [checkBudget];
}
