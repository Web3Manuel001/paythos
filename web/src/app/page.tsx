'use client';

import React, { useState } from 'react';

const CONTRACT_ADDRESS = '0x6E0837c166c01710dC86f2E25DAE2fFD574343D9';
const BASESCAN_URL = `https://sepolia.basescan.org/address/${CONTRACT_ADDRESS}`;

export default function PaythosLanding() {
  const [activeTab, setActiveTab] = useState<'middleware' | 'agent'>('middleware');

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-indigo-950/40 border-b border-indigo-500/20 px-4 py-2 text-center text-xs text-indigo-300 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Paythos Protocol Core v2.0 is live on Base Sepolia:</span>
        <a 
          href={BASESCAN_URL} 
          target="_blank" 
          rel="noreferrer"
          className="font-mono text-indigo-200 underline hover:text-white transition-colors"
        >
          {CONTRACT_ADDRESS.slice(0, 8)}...{CONTRACT_ADDRESS.slice(-6)}
        </a>
      </div>

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            P
          </div>
          <span className="font-bold text-xl tracking-tight text-white">PAYTHOS</span>
          <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-white/10 text-slate-300 font-medium ml-1">
            Enterprise
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Architecture</a>
          <a href="#code" className="hover:text-white transition-colors">Developers</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href={BASESCAN_URL} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Contracts</a>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Web3Manuel001/paythos"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-all"
          >
            GitHub
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-white px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/30"
          >
            Deploy Fleet Vault
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-indigo-300 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          The Monetary Operating System for Autonomous Agents
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
          High-Velocity Micropayments for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">Autonomous AI</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Non-custodial smart session custody, off-chain EIP-712 cumulative vouchers, and HTTP 402 paywall tollbooths on Base. Eliminate prompt-injection wallet drains and slash gas overhead by 98%.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#code"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-xl shadow-indigo-600/25 transition-all"
          >
            Install x402 Middleware
          </a>
          <a
            href={BASESCAN_URL}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold text-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <span>View Verified Contract</span>
            <span className="text-xs text-indigo-400">↗</span>
          </a>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-20 p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-left">
          <div className="p-4">
            <div className="text-3xl font-mono font-bold text-white mb-1">98.0%</div>
            <div className="text-xs text-slate-400">L2 Gas Reduction</div>
          </div>
          <div className="p-4 border-l border-white/5">
            <div className="text-3xl font-mono font-bold text-white mb-1">&lt; 2ms</div>
            <div className="text-xs text-slate-400">Verification Latency</div>
          </div>
          <div className="p-4 border-l border-white/5">
            <div className="text-3xl font-mono font-bold text-emerald-400 mb-1">100%</div>
            <div className="text-xs text-slate-400">Prompt Injection Guard</div>
          </div>
          <div className="p-4 border-l border-white/5">
            <div className="text-3xl font-mono font-bold text-indigo-400 mb-1">1.5%</div>
            <div className="text-xs text-slate-400">Automated Take Rate</div>
          </div>
        </div>
      </section>

      {/* Interactive Code Switcher */}
      <section id="code" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">Engineered for Builders in 5 Lines</h2>
          <p className="text-slate-400 text-sm">Drop into any Node/Next.js API route or autonomous agent runtime in seconds.</p>
        </div>

        <div className="rounded-2xl bg-[#0c1017] border border-white/10 overflow-hidden shadow-2xl">
          <div className="flex border-b border-white/10 bg-white/[0.02] px-4 pt-3">
            <button
              onClick={() => setActiveTab('middleware')}
              className={`px-5 py-2.5 text-xs font-semibold rounded-t-lg transition-all ${
                activeTab === 'middleware'
                  ? 'bg-[#0c1017] text-white border-t-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. API Provider (x402 Paywall)
            </button>
            <button
              onClick={() => setActiveTab('agent')}
              className={`px-5 py-2.5 text-xs font-semibold rounded-t-lg transition-all ${
                activeTab === 'agent'
                  ? 'bg-[#0c1017] text-white border-t-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Autonomous Agent (Viem Signer / MCP)
            </button>
          </div>

          <div className="p-6 font-mono text-xs overflow-x-auto text-slate-300 leading-relaxed">
            {activeTab === 'middleware' ? (
              <pre>{`// Express / Hono / Next.js API Tollbooth
import { createX402Paywall, VoucherAccumulator } from '@paythos/middleware';

const accumulator = new VoucherAccumulator(vaultClient, 5_000_000n); // Auto-flush at $5.00

app.use('/api/inference', createX402Paywall({
  merchantAddress: '0x0000...0003',
  vaultAddress: '${CONTRACT_ADDRESS}',
  tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
  chainId: 84532,
  pricePerCall: 2_000n, // $0.002 USDC per query
  accumulator,
}));`}</pre>
            ) : (
              <pre>{`// Autonomous Agent Signer (Sub-2ms off-chain ticket)
import { AgentVoucherSigner } from '@paythos/sdk';

const signer = new AgentVoucherSigner(process.env.SESSION_KEY, '${CONTRACT_ADDRESS}', 84532);

// Generates cumulative EIP-712 voucher with zero on-chain gas
const signed = await signer.signCumulativePayment(merchantAddress, usdcAddress, 2_000n);

const res = await fetch('https://api.provider.com/inference', {
  headers: { 'X-Paythos-Voucher': signed.headerPayload }
});`}</pre>
            )}
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold mb-6">
              01
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Prompt-Injection Shield</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Never give an LLM master keys. Ephemeral session keys enforce non-custodial daily allowances and TTL cutoffs enforced strictly by the EVM.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold mb-6">
              02
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Cumulative Voucher Math</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Agents sign monotonic balance increments. Merchants batch 1,000 requests into a single on-chain L2 settlement transaction, eliminating micropayment gas overhead.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold mb-6">
              03
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Anti-Rug Timelock</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Vaults enforce a 6-hour withdrawal challenge window and a 1-hour revocation grace period, giving merchants mathematical certainty of payment.
            </p>
          </div>
        </div>
      </section>

      {/* B2B Pricing Table */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-3">Enterprise Fleet Monetization</h2>
          <p className="text-slate-400 text-sm">Scale from a single agent prototype to enterprise autonomous fleets.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Open Source</div>
              <div className="text-3xl font-bold text-white mb-4">$0 <span className="text-xs font-normal text-slate-500">/ forever</span></div>
              <p className="text-slate-400 text-xs mb-6">For individual developers testing autonomous agents.</p>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">✓ 1 Paythos Vault deployment</li>
                <li className="flex items-center gap-2">✓ Viem TypeScript SDK</li>
                <li className="flex items-center gap-2">✓ Anthropic MCP Server tool</li>
                <li className="flex items-center gap-2">✓ ElizaOS Agent Plugin</li>
              </ul>
            </div>
            <button className="mt-8 w-full py-2.5 rounded-lg border border-white/10 hover:border-white/20 text-xs font-semibold text-white transition-all">
              Deploy Free Vault
            </button>
          </div>

          {/* Startup Fleet ($299/mo) */}
          <div className="p-8 rounded-2xl bg-indigo-950/20 border-2 border-indigo-500/50 flex flex-col justify-between relative shadow-xl shadow-indigo-500/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-[10px] font-bold uppercase tracking-wider text-white">
              Most Popular
            </div>
            <div>
              <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">Startup Fleet</div>
              <div className="text-3xl font-bold text-white mb-4">$299 <span className="text-xs font-normal text-slate-500">/ month</span></div>
              <p className="text-slate-400 text-xs mb-6">For startups deploying swarms of commercial AI agents.</p>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">✓ Up to 50 active Agent Sessions</li>
                <li className="flex items-center gap-2">✓ Hosted Redis Accumulator Relayer</li>
                <li className="flex items-center gap-2">✓ Automated Base L2 Batch Settlement</li>
                <li className="flex items-center gap-2">✓ Real-time Fleet Telemetry & Alerts</li>
                <li className="flex items-center gap-2">✓ 1.5% take rate automated splits</li>
              </ul>
            </div>
            <button className="mt-8 w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/30">
              Start Fleet Trial
            </button>
          </div>

          {/* Enterprise Sovereign ($999/mo) */}
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Enterprise Sovereign</div>
              <div className="text-3xl font-bold text-white mb-4">$999 <span className="text-xs font-normal text-slate-500">/ month</span></div>
              <p className="text-slate-400 text-xs mb-6">For institutions and large-scale autonomous agent networks.</p>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">✓ Unlimited Agent Fleets</li>
                <li className="flex items-center gap-2">✓ Dedicated Multi-Sig Governance</li>
                <li className="flex items-center gap-2">✓ AWS Nitro Enclave / TEE Key Isolation</li>
                <li className="flex items-center gap-2">✓ Custom Treasury Routing Logic</li>
                <li className="flex items-center gap-2">✓ SOC2 Compliance & Audit Logs</li>
              </ul>
            </div>
            <button className="mt-8 w-full py-2.5 rounded-lg border border-white/10 hover:border-white/20 text-xs font-semibold text-white transition-all">
              Contact Enterprise Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>© 2026 Paythos Protocol. Non-custodial AI Agent Economic Rails.</div>
        <div className="flex gap-6">
          <a href={BASESCAN_URL} target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">Basescan</a>
          <a href="https://github.com/Web3Manuel001/paythos" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">GitHub</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Documentation</a>
        </div>
      </footer>
    </div>
  );
}
