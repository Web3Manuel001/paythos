export interface ArcServiceEndpoint {
  id: string;
  name: string;
  category: 'INFERENCE' | 'SEARCH' | 'TELEMETRY' | 'VOICE';
  costPerCallUsdc: string;
  url: string;
  paymentScheme: 'exact' | 'upto';
}

// Circle for Agents / arc.market catalog index
export const ARC_MARKETPLACE_CATALOG: ArcServiceEndpoint[] = [
  {
    id: 'blockrun-inference',
    name: 'BlockRun AI Universal Gateway (95+ Models)',
    category: 'INFERENCE',
    costPerCallUsdc: '0.0035',
    url: 'https://api.blockrun.ai/v1/chat/completions',
    paymentScheme: 'upto',
  },
  {
    id: 'exa-neural-search',
    name: 'Exa Neural Agent Search',
    category: 'SEARCH',
    costPerCallUsdc: '0.0010',
    url: 'https://api.exa.ai/search',
    paymentScheme: 'exact',
  },
  {
    id: 'coingecko-onchain',
    name: 'CoinGecko Institutional Ticker',
    category: 'TELEMETRY',
    costPerCallUsdc: '0.0005',
    url: 'https://api.coingecko.com/api/v3/simple/price',
    paymentScheme: 'exact',
  },
  {
    id: 'bland-voice',
    name: 'Bland.ai Conversational Voice Agent',
    category: 'VOICE',
    costPerCallUsdc: '0.0500',
    url: 'https://api.bland.ai/v1/calls',
    paymentScheme: 'exact',
  },
];

export function queryArcMarketplace(category?: string) {
  if (!category) return ARC_MARKETPLACE_CATALOG;
  return ARC_MARKETPLACE_CATALOG.filter(
    (s) => s.category.toLowerCase() === category.toLowerCase()
  );
}
