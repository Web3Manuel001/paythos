'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'agent' | 'merchant' | 'enterprise'>('agent');
  const [apiCalls, setApiCalls] = useState<number>(1000);

  // Gas calculation metrics (Base L2)
  const standardCost = (apiCalls * 0.015).toFixed(2);
  const paythosCost = ((apiCalls / 50) * 0.015).toFixed(2); // Settled in batches of 50
  const savingsPercent = 98;

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Navigation */}
      <nav className="border-b border-slate-800/80 bg-[#07090E]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-black text-lg">
              P
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">PAYTHOS</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              Protocol v2.0
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
            <a href="#story" className="hover:text-white transition">The Story</a>
            <a href="#how-it-works" className="hover:text-white transition">Engine</a>
            <a href="#calculator" className="hover:text-white transition">Economics</a>
            <a href="#b2b" className="hover:text-white transition">Enterprise B2B</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="https://sepolia.basescan.org/address/0x6E0837c166c01710dC86f2E25DAE2fFD574343D9"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono text-cyan-400 hover:underline hidden sm:inline"
            >
              Base Sepolia: 0x6E08...43D9 ↗
            </a>
            <Link
              href="/fleet"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:opacity-90 transition shadow-lg shadow-cyan-500/20"
            >
              Launch Desk
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-mono mb-8">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Live on Base Sepolia Ledger (Block #48001033)</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-tight sm:leading-none">
          The Monetary Ethos for <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Autonomous AI Agents
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
          AI agents cannot open bank accounts, hold credit cards, or pass KYC. Paythos provides non-custodial session vaults and off-chain EIP-712 micro-settlement channels on Base L2—slashing machine payment overhead by 98%.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/fleet"
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-sm hover:opacity-90 transition shadow-xl shadow-cyan-500/25"
          >
            Deploy Enterprise Vault
          </Link>
          <a
            href="https://github.com/Web3Manuel001/paythos"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-200 font-semibold text-sm hover:bg-slate-800 transition"
          >
            Read GitHub Docs ↗
          </a>
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border border-slate-800/80 rounded-xl p-6 bg-slate-900/30 backdrop-blur">
          <div>
            <div className="text-2xl font-bold font-mono text-cyan-400">&lt; 1ms</div>
            <div className="text-xs text-slate-400 mt-1">Off-chain Signing</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-emerald-400">98%</div>
            <div className="text-xs text-slate-400 mt-1">Gas Overhead Cut</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-blue-400">1.50%</div>
            <div className="text-xs text-slate-400 mt-1">Protocol Take Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-purple-400">EIP-712</div>
            <div className="text-xs text-slate-400 mt-1">Cryptographic Standard</div>
          </div>
        </div>
      </section>

      {/* Act 1: The Story (Problem & Solution) */}
      <section id="story" className="py-20 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs uppercase font-mono tracking-widest text-cyan-400">The Problem</h2>
            <p className="mt-2 text-3xl font-bold text-white tracking-tight">The Autonomous Economy is Here. Its Banking Rails are Broken.</p>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-8">
            <div className="border border-slate-800/80 rounded-xl p-6 bg-slate-900/40">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-lg mb-4">✕</div>
              <h3 className="text-lg font-bold text-white">TradFi Credit Cards Fail</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Stripe charges $0.30 + 2.9% per transaction. If an agent queries a search API for $0.002, paying $0.30 in fixed processing fees makes the micro-economy mathematically dead on arrival.
              </p>
            </div>

            <div className="border border-slate-800/80 rounded-xl p-6 bg-slate-900/40">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center font-bold text-lg mb-4">⚠</div>
              <h3 className="text-lg font-bold text-white">Vanilla Crypto Has a Gas Paradox</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Even on Base L2, executing an on-chain transfer for every single API call costs $0.01 in gas. That represents a 500% penalty on a $0.002 micro-payment.
              </p>
            </div>

            <div className="border border-slate-800/80 rounded-xl p-6 bg-slate-900/40">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-lg mb-4">✓</div>
              <h3 className="text-lg font-bold text-white">The Paythos Cumulative Solution</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Agents sign monotonic cumulative vouchers off-chain in microseconds. Merchants verify them in memory and batch-settle on Base once debt hits $5.00—collapsing 100 on-chain writes into two.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Act 2: Interactive Persona Engine (How it works) */}
      <section id="how-it-works" className="py-20 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs uppercase font-mono tracking-widest text-cyan-400">The Dual Engine</h2>
            <p className="mt-2 text-3xl font-bold text-white tracking-tight">Built for Agents, Merchants, and Enterprises</p>
            <p className="mt-3 text-slate-400 text-sm">Select your role to see how Paythos drops into your workflow.</p>

            <div className="mt-8 inline-flex p-1 rounded-lg bg-slate-900 border border-slate-800">
              <button
                onClick={() => setActiveTab('agent')}
                className={`px-5 py-2 text-xs font-semibold rounded-md transition ${activeTab === 'agent' ? 'bg-cyan-500 text-black shadow' : 'text-slate-400 hover:text-white'}`}
              >
                1. For AI Agents (Consumers)
              </button>
              <button
                onClick={() => setActiveTab('merchant')}
                className={`px-5 py-2 text-xs font-semibold rounded-md transition ${activeTab === 'merchant' ? 'bg-cyan-500 text-black shadow' : 'text-slate-400 hover:text-white'}`}
              >
                2. For API Merchants (Sellers)
              </button>
              <button
                onClick={() => setActiveTab('enterprise')}
                className={`px-5 py-2 text-xs font-semibold rounded-md transition ${activeTab === 'enterprise' ? 'bg-cyan-500 text-black shadow' : 'text-slate-400 hover:text-white'}`}
              >
                3. For Enterprise B2B (Fleets)
              </button>
            </div>
          </div>

          {/* Interactive Code / Feature Display */}
          <div className="border border-slate-800 rounded-2xl bg-slate-900/60 p-8 max-w-4xl mx-auto font-mono text-sm overflow-hidden">
            {activeTab === 'agent' && (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs text-slate-400">
                  <span>agent-runtime.ts</span>
                  <span className="text-cyan-400">Sub-millisecond off-chain signature</span>
                </div>
                <pre className="mt-4 text-slate-300 overflow-x-auto text-xs sm:text-sm">
{`import { AgentVoucherSigner } from '@paythos/sdk';

// 1. Initialize with an ephemeral session key (NOT master key)
const agent = new AgentVoucherSigner(process.env.AGENT_SESSION_KEY, VAULT_ADDRESS, 8453);

// 2. Sign cumulative voucher off-chain (< 1ms)
const payment = await agent.signCumulativePayment(
  merchantAddress,
  usdcAddress,
  2000n // $0.002 incremental hit
);

// 3. Attach standard x402 header
const res = await fetch('https://api.merchant.com/scrape', {
  headers: { 'X-Paythos-Voucher': payment.headerPayload }
});`}
                </pre>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">✓ Prompt Injection Immune:</span>
                  <span>Even if jailbroken, attackers cannot exceed daily session cap.</span>
                </div>
              </div>
            )}

            {activeTab === 'merchant' && (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs text-slate-400">
                  <span>server-middleware.ts</span>
                  <span className="text-cyan-400">Instant HTTP 402 Paywall in 3 lines</span>
                </div>
                <pre className="mt-4 text-slate-300 overflow-x-auto text-xs sm:text-sm">
{`import { createX402Paywall, VoucherAccumulator } from '@paythos/sdk';

// Turn any Express, Hono, or Next.js route into an autonomous tollbooth
app.use('/api/inference', createX402Paywall({
  merchantAddress: '0xYourMerchantWallet',
  vaultAddress: '0xPaythosVault',
  tokenAddress: '0xUSDC',
  pricePerCall: 2000n, // $0.002
  accumulator: new VoucherAccumulator(vaultClient, 5_000_000n) // Auto-flush at $5.00
}));`}
                </pre>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">✓ Built-in Defense:</span>
                  <span>Integrated Token-Bucket rate limiter blocks runaway LLM loops with HTTP 429.</span>
                </div>
              </div>
            )}

            {activeTab === 'enterprise' && (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs text-slate-400">
                  <span>fleet-policy.sol</span>
                  <span className="text-cyan-400">On-Chain Governance & Custody</span>
                </div>
                <pre className="mt-4 text-slate-300 overflow-x-auto text-xs sm:text-sm">
{`// Enterprise controls enforced directly by PaythosVault.sol
vault.createSession(
  agentKey,
  1000 * 1e6,  // Daily Spend Cap: $1,000 USDC
  30 days      // Hard TTL Expiration
);

// Emergency Killswitch: Instant revocation with 1h grace period for pending claims
vault.revokeSession(agentKey);

// Anti-Rug Protection: 6-hour timelock on fund withdrawals guarantees merchant security
vault.queueWithdrawal(usdc, 5000 * 1e6);`}
                </pre>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">✓ Institutional Compliance:</span>
                  <span>Non-custodial, 100% on-chain verifiable audit trails and spend limits.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Act 3: Economic Calculator */}
      <section id="calculator" className="py-20 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-xs uppercase font-mono tracking-widest text-cyan-400">The Economics</h2>
            <p className="mt-2 text-3xl font-bold text-white tracking-tight">Interactive Gas & Settlement Savings Calculator</p>
            <p className="mt-2 text-sm text-slate-400">See how Paythos cumulative delta batching scales against vanilla on-chain transactions.</p>
          </div>

          <div className="border border-slate-800 rounded-2xl p-8 bg-slate-900/60 max-w-3xl mx-auto">
            <div className="mb-6">
              <label className="text-xs uppercase font-mono text-slate-400 flex justify-between">
                <span>Monthly API Inferences by Agent Fleet:</span>
                <span className="font-bold text-cyan-400">{apiCalls.toLocaleString()} Calls</span>
              </label>
              <input
                type="range"
                min="100"
                max="50000"
                step="100"
                value={apiCalls}
                onChange={(e) => setApiCalls(Number(e.target.value))}
                className="w-full mt-3 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-800">
              <div className="border border-red-900/30 bg-red-950/10 rounded-xl p-4 text-center">
                <div className="text-xs font-mono text-slate-400">Standard On-Chain Gas</div>
                <div className="text-2xl font-extrabold font-mono text-red-400 mt-1">${standardCost}</div>
                <div className="text-[11px] text-slate-500 mt-1">{apiCalls} separate L2 transactions</div>
              </div>

              <div className="border border-emerald-900/30 bg-emerald-950/10 rounded-xl p-4 text-center">
                <div className="text-xs font-mono text-slate-400">With Paythos Batching</div>
                <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">${paythosCost}</div>
                <div className="text-[11px] text-emerald-400 mt-1">{savingsPercent}% Gas Reduction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Business Model */}
      <section id="pricing" className="py-20 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-mono tracking-widest text-cyan-400">Commercial Model</h2>
            <p className="mt-2 text-3xl font-bold text-white tracking-tight">Transparent, Cash-Flow Aligned Pricing</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Developer Tier */}
            <div className="border border-slate-800 rounded-xl p-6 bg-slate-900/30 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Developer / Open Source</h3>
                <p className="text-xs text-slate-400 mt-1">For individual builders and hackathons</p>
                <div className="text-3xl font-extrabold text-white mt-6">$0 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li>✓ Open-Source SDK (Viem)</li>
                  <li>✓ Base Sepolia Testnet</li>
                  <li>✓ Anthropic MCP Server</li>
                  <li>✓ ElizaOS Action Plugin</li>
                  <li>✓ 1.5% Settlement Take Rate</li>
                </ul>
              </div>
              <a href="https://github.com/Web3Manuel001/paythos" target="_blank" rel="noreferrer" className="mt-8 block w-full py-2.5 rounded-lg border border-slate-700 text-center text-xs font-bold hover:bg-slate-800 transition">
                Start Building Free
              </a>
            </div>

            {/* Growth Tier */}
            <div className="border border-cyan-500/50 rounded-xl p-6 bg-cyan-950/10 flex flex-col justify-between relative shadow-xl shadow-cyan-500/10">
              <span className="absolute -top-3 right-4 px-2 py-0.5 rounded bg-cyan-500 text-black text-[10px] font-bold uppercase tracking-wider">
                Most Popular
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">Growth Merchant</h3>
                <p className="text-xs text-slate-400 mt-1">For API and compute providers monetizing machines</p>
                <div className="text-3xl font-extrabold text-cyan-400 mt-6">$99 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li>✓ All Developer Features</li>
                  <li>✓ Hosted x402 Auto-Flusher Relayer</li>
                  <li>✓ Token-Bucket Rate Limiting Engine</li>
                  <li>✓ Real-Time Webhook Notifications</li>
                  <li>✓ 1.5% Settlement Take Rate</li>
                </ul>
              </div>
              <Link href="/fleet" className="mt-8 block w-full py-2.5 rounded-lg bg-cyan-500 text-black text-center text-xs font-bold hover:opacity-90 transition">
                Get Started
              </Link>
            </div>

            {/* Enterprise Fleet Tier */}
            <div className="border border-slate-800 rounded-xl p-6 bg-slate-900/30 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Enterprise Fleet</h3>
                <p className="text-xs text-slate-400 mt-1">For AI labs and hedge funds running 50+ agent fleets</p>
                <div className="text-3xl font-extrabold text-white mt-6">$499 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li>✓ Multi-Tenant Session Management Desk</li>
                  <li>✓ Scoped Spending Policies & Daily Caps</li>
                  <li>✓ Dedicated RPC Relayer Clusters</li>
                  <li>✓ IRS 1099 / W-8BEN Tax Compliance Export</li>
                  <li>✓ Custom TEE Secure Key Enclave Support</li>
                </ul>
              </div>
              <Link href="/fleet" className="mt-8 block w-full py-2.5 rounded-lg border border-slate-700 text-center text-xs font-bold hover:bg-slate-800 transition">
                Contact Enterprise
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800/80 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">PAYTHOS PROTOCOL</span>
            <span>— The Monetary Operating System for Autonomous Agents.</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="https://sepolia.basescan.org/address/0x6E0837c166c01710dC86f2E25DAE2fFD574343D9" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition">
              Basescan Explorer
            </a>
            <a href="https://github.com/Web3Manuel001/paythos" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition">
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
