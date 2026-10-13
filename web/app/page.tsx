'use client';

import React, { useState } from 'react';

export default function PaythosInterface() {
  const [activeCodeTab, setActiveCodeTab] = useState<'agent' | 'merchant' | 'mcp' | 'vault'>('agent');
  const [simStep, setSimStep] = useState<number>(1);
  const [copiedContract, setCopiedContract] = useState<boolean>(false);

  const CONTRACT_ADDRESS = '0x6E0837c166c01710dC86f2E25DAE2fFD574343D9';
  const DOMAIN_SEPARATOR = '0xae08bdc403dec2914b402d5fd5f4a21d6d29290aac10a3e646ef5630be5e8b4b';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] selection:bg-zinc-200 selection:text-zinc-950 font-sans antialiased">
      {/* Top Protocol Status Ticker */}
      <div className="border-b border-zinc-800/80 bg-zinc-950 px-4 py-1.5 text-xs font-mono text-zinc-400 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center space-x-6 min-w-max">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-zinc-300">Base Sepolia (84532)</span>
          </div>
          <span className="text-zinc-600">/</span>
          <div>
            Contract: <span className="text-zinc-300">0x6E08...43D9</span>
          </div>
          <span className="text-zinc-600">/</span>
          <div>
            Verified Block: <span className="text-zinc-300">#48001033</span>
          </div>
          <span className="text-zinc-600">/</span>
          <div>
            Take Rate: <span className="text-zinc-300">1.50% (150 bps)</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-4 min-w-max text-[11px]">
          <a
            href="https://sepolia.basescan.org/address/0x6E0837c166c01710dC86f2E25DAE2fFD574343D9"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-white transition flex items-center gap-1"
          >
            Basescan ↗
          </a>
          <a
            href="https://github.com/Web3Manuel001/paythos"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-white transition flex items-center gap-1"
          >
            GitHub ↗
          </a>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="border-b border-zinc-800/60 bg-[#09090b]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-white text-zinc-950 flex items-center justify-center font-mono font-black text-sm tracking-tighter">
              P
            </div>
            <span className="font-semibold text-base tracking-tight text-white font-mono">PAYTHOS</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-400">
              v2.0-core
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-xs font-mono text-zinc-400">
            <a href="#architecture" className="hover:text-white transition">Architecture</a>
            <a href="#simulator" className="hover:text-white transition">Voucher Simulator</a>
            <a href="#integration" className="hover:text-white transition">Integration</a>
            <a href="#enterprise" className="hover:text-white transition">Enterprise Fleets</a>
            <a href="#specs" className="hover:text-white transition">Specifications</a>
          </div>

          <div className="flex items-center space-x-3 font-mono text-xs">
            <button
              onClick={() => copyToClipboard(CONTRACT_ADDRESS)}
              className="px-3 py-1.5 border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 rounded transition"
            >
              {copiedContract ? 'Copied 0x6E08...' : 'Copy Address'}
            </button>
            <a
              href="https://github.com/Web3Manuel001/paythos"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-white text-zinc-950 font-medium hover:bg-zinc-200 rounded transition"
            >
              Get SDK
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-20 pb-16 border-b border-zinc-800/60">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-zinc-400 border border-zinc-800 px-2.5 py-1 mb-6 rounded-sm">
            <span>EIP-712 CUMULATIVE STATE CHANNELS</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-300">BASE L2 ATOMIC SETTLEMENT</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-tight">
            Cryptographic settlement for autonomous agents.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
            Paythos eliminates fixed credit card friction ($0.30 fees) and Layer-2 gas overhead (500% penalty on micro-billing). Agents sign monotonic debt vouchers off-chain in sub-milliseconds; API providers verify them in memory and settle atomically on Base L2.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="flex items-center space-x-2 border border-zinc-800 bg-zinc-900/40 px-3 py-2 rounded">
              <span className="text-zinc-500">Standard Gas:</span>
              <span className="text-red-400 font-semibold line-through">~$1.50 / 100 calls</span>
            </div>
            <div className="flex items-center space-x-2 border border-emerald-950 bg-emerald-950/20 px-3 py-2 rounded">
              <span className="text-emerald-500 font-bold">Paythos Batched:</span>
              <span className="text-emerald-400 font-semibold">~$0.03 / 100 calls (98% reduction)</span>
            </div>
            <div className="flex items-center space-x-2 border border-zinc-800 bg-zinc-900/40 px-3 py-2 rounded">
              <span className="text-zinc-500">Sign Latency:</span>
              <span className="text-white font-semibold">&lt; 1ms off-chain</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Protocol Simulator */}
        <div id="simulator" className="mt-16 border border-zinc-800 rounded-lg bg-zinc-950 overflow-hidden shadow-2xl">
          <div className="border-b border-zinc-800 px-4 py-3 bg-zinc-900/40 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block"></span>
              <span>PAYTHOS INTERACTIVE TRANSACTION LIFECYCLE</span>
            </div>
            <div className="flex items-center space-x-1">
              {[1, 2, 3].map((step) => (
                <button
                  key={step}
                  onClick={() => setSimStep(step)}
                  className={`px-2.5 py-1 text-[11px] rounded transition ${
                    simStep === step
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Step 0{step}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800 p-6 gap-6 font-mono text-xs">
            {/* Step 1: Client Negotiation */}
            <div className={`space-y-3 ${simStep === 1 ? 'opacity-100' : 'opacity-40'} transition-opacity`}>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-2 border-b border-zinc-800">
                <span className="text-white font-semibold">1. HTTP 402 Challenge</span>
                <span className="text-amber-400">402 Payment Required</span>
              </div>
              <p className="text-zinc-500 text-[11px]">
                Autonomous agent requests protected inference. Gateway returns x402 challenge header with price parameters.
              </p>
              <div className="p-3 bg-zinc-900 rounded border border-zinc-800/80 text-[11px] text-zinc-300 overflow-x-auto">
                <div className="text-zinc-500">// Header Response</div>
                <div>HTTP/1.1 402 Payment Required</div>
                <div>x-paythos-price: <span className="text-amber-400">2000</span> (0.002 USDC)</div>
                <div>x-paythos-vault: <span className="text-zinc-400">0x6E08...43D9</span></div>
                <div>x-paythos-merchant: <span className="text-zinc-400">0x0000...0003</span></div>
              </div>
            </div>

            {/* Step 2: Off-Chain Signature */}
            <div className={`space-y-3 ${simStep === 2 ? 'opacity-100' : 'opacity-40'} transition-opacity`}>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-2 border-b border-zinc-800">
                <span className="text-white font-semibold">2. EIP-712 Voucher Sign</span>
                <span className="text-cyan-400">&lt; 1ms Signature</span>
              </div>
              <p className="text-zinc-500 text-[11px]">
                Agent session key signs typed monotonic debt ticket off-chain. Zero gas paid; zero network delay.
              </p>
              <div className="p-3 bg-zinc-900 rounded border border-zinc-800/80 text-[11px] text-zinc-300 overflow-x-auto">
                <div className="text-zinc-500">// Signed Payload Hash</div>
                <div>cumulativeAmount: <span className="text-cyan-400">100000</span> (0.100 USDC)</div>
                <div>sessionId: 1</div>
                <div>nonce: 50</div>
                <div className="text-zinc-500 mt-1">// ECDSA Signature (65 bytes)</div>
                <div className="truncate text-zinc-400">0x7fe2bd83bb839481...</div>
              </div>
            </div>

            {/* Step 3: Base L2 Settlement */}
            <div className={`space-y-3 ${simStep === 3 ? 'opacity-100' : 'opacity-40'} transition-opacity`}>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-2 border-b border-zinc-800">
                <span className="text-white font-semibold">3. Base L2 Settlement</span>
                <span className="text-emerald-400">Atomic Delta Payout</span>
              </div>
              <p className="text-zinc-500 text-[11px]">
                When cumulative debt hits merchant threshold ($5.00), accumulator flushes 1 single transaction on Base L2.
              </p>
              <div className="p-3 bg-zinc-900 rounded border border-zinc-800/80 text-[11px] text-zinc-300 overflow-x-auto">
                <div className="text-zinc-500">// PaythosVault.settleVoucher()</div>
                <div>payoutDelta: <span className="text-emerald-400">100000</span> units</div>
                <div>merchantPayout (98.5%): 98500</div>
                <div>protocolTreasury (1.5%): 1500</div>
                <div className="text-emerald-400 mt-1">✓ Conservation of Balance: 100%</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Protocol Architecture Breakdown */}
      <section id="architecture" className="max-w-7xl mx-auto px-6 py-20 border-b border-zinc-800/60">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">System Topology</div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-1">
              Engineered for absolute zero token leakage.
            </h2>
          </div>
          <p className="text-xs font-mono text-zinc-500 max-w-sm mt-3 md:mt-0">
            A three-tier separation of concerns: ephemeral client execution, fast transport validation, and immutable L2 clearing.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="border border-zinc-800 rounded p-5 bg-zinc-950 flex flex-col justify-between">
            <div>
              <div className="text-zinc-500 text-[11px]">TIER 01 / CLIENT</div>
              <h3 className="text-sm font-semibold text-white mt-1">Session Key Sandbox</h3>
              <p className="text-zinc-400 text-xs mt-3 font-sans leading-relaxed">
                Autonomous LLMs are prone to prompt injection. Paythos never exposes master custody keys to the agent. Agents operate under temporary session keys with hard daily limits and automatic TTL cutoffs enforced directly by smart contracts.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-500">
              Contract Enforced: <span className="text-zinc-300">dailyLimit, expiresAt</span>
            </div>
          </div>

          <div className="border border-zinc-800 rounded p-5 bg-zinc-950 flex flex-col justify-between">
            <div>
              <div className="text-zinc-500 text-[11px]">TIER 02 / TRANSPORT</div>
              <h3 className="text-sm font-semibold text-white mt-1">x402 Transport Gate</h3>
              <p className="text-zinc-400 text-xs mt-3 font-sans leading-relaxed">
                Publishers install the drop-in middleware on Express, Hono, or Next.js endpoints. It validates EIP-712 cryptographic proofs in memory, enforces token-bucket rate limiting against runaway loops, and buffers pending claims in memory.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-500">
              Transport Spec: <span className="text-zinc-300">RFC x402-v2 + TokenBucket</span>
            </div>
          </div>

          <div className="border border-zinc-800 rounded p-5 bg-zinc-950 flex flex-col justify-between">
            <div>
              <div className="text-zinc-500 text-[11px]">TIER 03 / SETTLEMENT</div>
              <h3 className="text-sm font-semibold text-white mt-1">PaythosVault Core</h3>
              <p className="text-zinc-400 text-xs mt-3 font-sans leading-relaxed">
                Deployed on Base L2. Implements monotonic cumulative settlement, non-reentrant state transitions, a 6-hour anti-rug withdrawal timelock for merchant security, and a 1-hour revocation challenge window.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-500">
              Security: <span className="text-zinc-300">Checks-Effects-Interactions (CEI)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Integration Code Console */}
      <section id="integration" className="max-w-7xl mx-auto px-6 py-20 border-b border-zinc-800/60">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Implementation</div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-1">
              Integrate in four lines of TypeScript.
            </h2>
          </div>
          <div className="flex space-x-1 mt-4 md:mt-0 font-mono text-xs border border-zinc-800 p-1 rounded bg-zinc-950">
            {(['agent', 'merchant', 'mcp', 'vault'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCodeTab(tab)}
                className={`px-3 py-1 rounded transition uppercase ${
                  activeCodeTab === tab
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-zinc-800 rounded-lg bg-zinc-950 overflow-hidden font-mono text-xs shadow-xl">
          <div className="border-b border-zinc-800 px-4 py-2.5 bg-zinc-900/40 flex items-center justify-between text-zinc-500 text-[11px]">
            <span>
              {activeCodeTab === 'agent' && 'agent/runtime.ts — Client-side signer'}
              {activeCodeTab === 'merchant' && 'server/middleware.ts — Merchant x402 route guard'}
              {activeCodeTab === 'mcp' && 'claude_desktop_config.json — Anthropic MCP setup'}
              {activeCodeTab === 'vault' && 'contracts/PaythosVault.sol — Core settlement interface'}
            </span>
            <span className="text-zinc-400">TypeScript 5.x / Viem 2.x</span>
          </div>

          <div className="p-6 overflow-x-auto text-zinc-300 leading-relaxed text-xs">
            {activeCodeTab === 'agent' && (
              <pre>{`import { AgentVoucherSigner } from '@paythos/sdk';

// 1. Initialize signer with ephemeral session key (NOT master private key)
const signer = new AgentVoucherSigner(
  process.env.AGENT_SESSION_KEY,
  '0x6E0837c166c01710dC86f2E25DAE2fFD574343D9', // PaythosVault on Base
  84532 // Base Sepolia
);

// 2. Sign incremental cumulative debt off-chain (< 1ms)
const ticket = await signer.signCumulativePayment(
  merchantAddress,
  usdcAddress,
  2000n // $0.002 per call
);

// 3. Attach standard x402 voucher header
const response = await fetch('https://api.scraper.com/query', {
  headers: { 'X-Paythos-Voucher': ticket.headerPayload }
});`}</pre>
            )}

            {activeCodeTab === 'merchant' && (
              <pre>{`import express from 'express';
import { createX402Paywall, VoucherAccumulator, PaythosVaultClient } from '@paythos/sdk';

const app = express();
const vaultClient = new PaythosVaultClient('0x6E0837c166c01710dC86f2E25DAE2fFD574343D9', RPC_URL, merchantWallet);

// Protect API with token-bucket rate limiter and auto-flush accumulator
app.use('/api/v1/inference', createX402Paywall({
  merchantAddress: '0x0000000000000000000000000000000000000003',
  vaultAddress: '0x6E0837c166c01710dC86f2E25DAE2fFD574343D9',
  tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC
  pricePerCall: 2000n, // $0.002
  accumulator: new VoucherAccumulator(vaultClient, 5_000_000n) // Auto-flush on Base at $5.00
}));

app.listen(8080);`}</pre>
            )}

            {activeCodeTab === 'mcp' && (
              <pre>{`{
  "mcpServers": {
    "paythos": {
      "command": "npx",
      "args": ["-y", "@paythos/mcp-server"],
      "env": {
        "PAYTHOS_SESSION_KEY": "0x_your_ephemeral_agent_key",
        "PAYTHOS_VAULT_ADDRESS": "0x6E0837c166c01710dC86f2E25DAE2fFD574343D9",
        "PAYTHOS_CHAIN_ID": "84532"
      }
    }
  }
}`}</pre>
            )}

            {activeCodeTab === 'vault' && (
              <pre>{`// SPDX-License-Identifier: MIT
// Verified on Base Sepolia (Block 48001033)
interface IPaythosVault {
    function settleVoucher(
        PaymentVoucher calldata voucher,
        bytes calldata signature
    ) external;

    function createSession(
        address agentKey,
        uint256 dailyLimit,
        uint256 durationInSeconds
    ) external;

    function queueWithdrawal(address token, uint256 amount) external;
    function executeWithdrawal(address token, address to) external;
}`}</pre>
            )}
          </div>
        </div>
      </section>

      {/* Enterprise B2B Governance Section */}
      <section id="enterprise" className="max-w-7xl mx-auto px-6 py-20 border-b border-zinc-800/60">
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Enterprise B2B</div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-1">
            Institutional fleet governance and spend telemetry.
          </h2>
          <p className="mt-3 text-zinc-400 text-sm font-sans leading-relaxed">
            Managing fleets of 50+ autonomous agents requires granular guardrails, deterministic audit logs, and non-custodial balance protection. Paythos bridges enterprise security with trustless machine execution.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          <div className="border border-zinc-800 p-5 rounded bg-zinc-950">
            <div className="text-zinc-500 text-[10px]">SECURITY PARAMETER</div>
            <div className="text-sm font-semibold text-white mt-1">6-Hour Anti-Rug Timelock</div>
            <p className="text-zinc-400 text-xs mt-2 font-sans">
              Vault owners must queue withdrawals with a 6-hour delay, guaranteeing merchants a protected window to submit all in-flight vouchers.
            </p>
          </div>

          <div className="border border-zinc-800 p-5 rounded bg-zinc-950">
            <div className="text-zinc-500 text-[10px]">RISK MITIGATION</div>
            <div className="text-sm font-semibold text-white mt-1">Instant Session Revocation</div>
            <p className="text-zinc-400 text-xs mt-2 font-sans">
              Administrative kill-switch immediately disables rogue agents with a 1-hour grace window for existing merchant claims.
            </p>
          </div>

          <div className="border border-zinc-800 p-5 rounded bg-zinc-950">
            <div className="text-zinc-500 text-[10px]">POLICY CONTROL</div>
            <div className="text-sm font-semibold text-white mt-1">Rolling 24h Spend Caps</div>
            <p className="text-zinc-400 text-xs mt-2 font-sans">
              Deterministic rolling window reset prevents clock-drift attacks and strictly confines maximum exposure per session.
            </p>
          </div>

          <div className="border border-zinc-800 p-5 rounded bg-zinc-950">
            <div className="text-zinc-500 text-[10px]">CASH FLOW PROTOCOL</div>
            <div className="text-sm font-semibold text-white mt-1">1.50% Clearing Fee</div>
            <p className="text-zinc-400 text-xs mt-2 font-sans">
              Protocol fee routes atomically to company treasury on Base upon batch redemption. Zero invoice reconciliation overhead.
            </p>
          </div>
        </div>
      </section>

      {/* Verified On-Chain Specifications */}
      <section id="specs" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">Verified Artifacts</div>
        <h2 className="text-2xl font-semibold text-white tracking-tight mb-8">
          Immutable Protocol Parameters (Base Sepolia)
        </h2>

        <div className="border border-zinc-800 rounded bg-zinc-950 font-mono text-xs divide-y divide-zinc-800">
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-zinc-500">Core Settlement Vault:</span>
            <a
              href={`https://sepolia.basescan.org/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="text-white hover:underline truncate"
            >
              {CONTRACT_ADDRESS}
            </a>
          </div>

          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-zinc-500">EIP-712 Domain Separator:</span>
            <span className="text-zinc-300 truncate">{DOMAIN_SEPARATOR}</span>
          </div>

          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-zinc-500">Target Native Token:</span>
            <span className="text-zinc-300">0x036CbD53842c5426634e7929541eC2318f3dCF7e (USDC on Base Sepolia)</span>
          </div>

          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-zinc-500">Protocol Fee Rate:</span>
            <span className="text-zinc-300">150 basis points (1.50% fee cap at 500 bps)</span>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-12 text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-white">PAYTHOS</span>
            <span>— The Non-Custodial Monetary Operating System for Autonomous Agents.</span>
          </div>
          <div className="flex items-center space-x-6">
            <a
              href="https://sepolia.basescan.org/address/0x6E0837c166c01710dC86f2E25DAE2fFD574343D9"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition"
            >
              Basescan Explorer
            </a>
            <a
              href="https://github.com/Web3Manuel001/paythos"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition"
            >
              GitHub Source
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
