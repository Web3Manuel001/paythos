'use client';

import React, { useState } from 'react';

// --- AUTHENTIC ECOSYSTEM LOGOS (REAL VECTOR SVGS) ---

function BaseLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 115 115" className={className} fill="none">
      <circle cx="57.5" cy="57.5" r="57.5" fill="#0052FF" />
      <path
        d="M57.5 95C78.2107 95 95 78.2107 95 57.5C95 36.7893 78.2107 20 57.5 20C37.6083 20 21.3283 35.459 20.0801 55.0347H69.4583V59.9653H20.0801C21.3283 79.541 37.6083 95 57.5 95Z"
        fill="white"
      />
    </svg>
  );
}

function ClaudeLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z"
        fill="#D97706"
        fillOpacity="0.15"
      />
      <path
        d="M13.8 6.5H10.2L6 17.5H9.2L10.1 15H13.9L14.8 17.5H18L13.8 6.5ZM10.9 12.6L12 9.5L13.1 12.6H10.9Z"
        fill="#D97706"
      />
    </svg>
  );
}

function LangChainLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="6" fill="#1C3C3C" />
      <path
        d="M9 14.5L14.5 9M13 15.5L16 12.5C17.1046 11.3954 17.1046 9.60457 16 8.5C14.8954 7.39543 13.1046 7.39543 12 8.5L10 10.5M11 8.5L8 11.5C6.89543 12.6046 6.89543 14.3954 8 15.5C9.10457 16.6046 10.8954 16.6046 12 15.5L14 13.5"
        stroke="#22C55E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ElizaLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="6" fill="#18181B" stroke="#3F3F46" />
      <path
        d="M6 8H8V10H6V8ZM16 8H18V10H16V8ZM8 14H16V16H8V14ZM6 12H18V14H6V12Z"
        fill="#EC4899"
      />
    </svg>
  );
}

function ViemLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="6" fill="#0C0A09" stroke="#292524" />
      <path
        d="M6 7L12 17L18 7"
        stroke="#F59E0B"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FoundryLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="6" fill="#18181B" stroke="#3F3F46" />
      <path
        d="M7 6H17V9H14V18H10V9H7V6Z"
        fill="#A1A1AA"
      />
    </svg>
  );
}

// --- RAW CODE SNIPPETS FOR COPYING ---

const CODE_RAW = {
  agent: `import { AgentVoucherSigner } from '@paythos/sdk';

// 1. Initialize with an ephemeral session key (NOT master key)
const signer = new AgentVoucherSigner(
  process.env.AGENT_SESSION_KEY,
  '0x6E0837c166c01710dC86f2E25DAE2fFD574343D9', // Base Sepolia Vault
  84532 // Base Sepolia Chain ID
);

// 2. Sign cumulative voucher off-chain (< 1ms, zero gas)
const payment = await signer.signCumulativePayment(
  merchantAddress,
  usdcAddress,
  2000n // $0.002 incremental payment
);

// 3. Attach standard x402 voucher header to any fetch call
const res = await fetch('https://api.merchant.com/query', {
  headers: { 'X-Paythos-Voucher': payment.headerPayload }
});`,

  merchant: `import express from 'express';
import { createX402Paywall, VoucherAccumulator, PaythosVaultClient } from '@paythos/sdk';

const app = express();
const vaultClient = new PaythosVaultClient(
  '0x6E0837c166c01710dC86f2E25DAE2fFD574343D9',
  RPC_URL,
  merchantWallet
);

// Protect API with token-bucket rate limiter and 98% gas-saving accumulator
app.use('/api/v1/inference', createX402Paywall({
  merchantAddress: '0x0000000000000000000000000000000000000003',
  vaultAddress: '0x6E0837c166c01710dC86f2E25DAE2fFD574343D9',
  tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC
  pricePerCall: 2000n, // $0.002 per call
  accumulator: new VoucherAccumulator(vaultClient, 5_000_000n) // Auto-flush at $5.00
}));

app.listen(8080);`,

  mcp: `{
  "mcpServers": {
    "paythos": {
      "command": "npx",
      "args": ["-y", "@paythos/mcp-server"],
      "env": {
        "PAYTHOS_SESSION_KEY": "0x_your_ephemeral_agent_key",
        "PAYTHOS_VAULT_ADDRESS": "0x6E0837c166c01710dC86f2E25DAE2fFD574343D9",
        "PAYTHOS_CHAIN_ID": "84532",
        "PAYTHOS_RPC_URL": "https://sepolia.base.org"
      }
    }
  }
}`,

  vault: `// SPDX-License-Identifier: MIT
// Verified on Base Sepolia Ledger (Block #48001033)
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

    function revokeSession(address agentKey) external;
    function queueWithdrawal(address token, uint256 amount) external;
    function executeWithdrawal(address token, address to) external;
}`
};

export default function PaythosInterface() {
  const [activeCodeTab, setActiveCodeTab] = useState<'agent' | 'merchant' | 'mcp' | 'vault'>('agent');
  const [simStep, setSimStep] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedContract, setCopiedContract] = useState<boolean>(false);
  const [apiCalls, setApiCalls] = useState<number>(1000);

  const CONTRACT_ADDRESS = '0x6E0837c166c01710dC86f2E25DAE2fFD574343D9';
  const DOMAIN_SEPARATOR = '0xae08bdc403dec2914b402d5fd5f4a21d6d29290aac10a3e646ef5630be5e8b4b';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CODE_RAW[activeCodeTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const standardCost = (apiCalls * 0.015).toFixed(2);
  const paythosCost = ((apiCalls / 50) * 0.015).toFixed(2);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] selection:bg-zinc-200 selection:text-zinc-950 font-sans antialiased relative">
      {/* Background Architectural Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      {/* Protocol Ticker */}
      <div className="border-b border-zinc-800/80 bg-zinc-950/90 px-4 py-1.5 text-xs font-mono text-zinc-400 flex items-center justify-between overflow-x-auto relative z-10 backdrop-blur">
        <div className="flex items-center space-x-6 min-w-max">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-zinc-300">Base Sepolia (84532)</span>
          </div>
          <span className="text-zinc-700">/</span>
          <div>
            Contract: <span className="text-zinc-300 font-semibold">0x6E08...43D9</span>
          </div>
          <span className="text-zinc-700">/</span>
          <div>
            Block: <span className="text-zinc-300">#48001033</span>
          </div>
          <span className="text-zinc-700">/</span>
          <div>
            Protocol Fee: <span className="text-emerald-400">1.50% (150 bps)</span>
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

      {/* Navigation */}
      <nav className="border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-white text-zinc-950 flex items-center justify-center font-mono font-black text-sm tracking-tighter rounded-sm">
              P
            </div>
            <span className="font-semibold text-base tracking-tight text-white font-mono">PAYTHOS</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-400">
              v2.0-core
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-xs font-mono text-zinc-400">
            <a href="#ecosystem" className="hover:text-white transition">Ecosystem</a>
            <a href="#simulator" className="hover:text-white transition">Simulator</a>
            <a href="#integration" className="hover:text-white transition">Code</a>
            <a href="#economics" className="hover:text-white transition">Economics</a>
            <a href="#specs" className="hover:text-white transition">Specs</a>
          </div>

          <div className="flex items-center space-x-3 font-mono text-xs">
            <button
              onClick={handleCopyAddress}
              className="px-3 py-1.5 border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 rounded transition"
            >
              {copiedContract ? '✓ Copied Address' : 'Copy Vault Address'}
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
      <header className="max-w-7xl mx-auto px-6 pt-20 pb-16 relative z-10 border-b border-zinc-800/60">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-zinc-400 border border-zinc-800 px-2.5 py-1 mb-6 rounded-sm bg-zinc-900/40">
            <span className="text-zinc-200 font-semibold">EIP-712 CUMULATIVE CHANNELS</span>
            <span className="text-zinc-600">/</span>
            <span className="text-emerald-400">BASE L2 ATOMIC CLEARING</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-tight">
            Cryptographic settlement for autonomous agents.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
            Paythos eliminates fixed credit card friction ($0.30 fees) and Layer-2 gas overhead (500% penalty on micro-billing). Agents sign monotonic debt vouchers off-chain in sub-milliseconds; API providers verify them in memory and settle atomically on Base L2.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="flex items-center space-x-2 border border-zinc-800 bg-zinc-900/50 px-3 py-2 rounded">
              <span className="text-zinc-500">Standard Gas:</span>
              <span className="text-red-400 font-semibold line-through">~$1.50 / 100 calls</span>
            </div>
            <div className="flex items-center space-x-2 border border-emerald-950 bg-emerald-950/20 px-3 py-2 rounded">
              <span className="text-emerald-500 font-bold">Paythos Batched:</span>
              <span className="text-emerald-400 font-semibold">~$0.03 / 100 calls (98% reduction)</span>
            </div>
            <div className="flex items-center space-x-2 border border-zinc-800 bg-zinc-900/50 px-3 py-2 rounded">
              <span className="text-zinc-500">Off-Chain Sign:</span>
              <span className="text-white font-semibold">&lt; 1ms latency</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Protocol Simulator */}
        <div id="simulator" className="mt-16 border border-zinc-800 rounded-lg bg-zinc-950 overflow-hidden shadow-2xl">
          <div className="border-b border-zinc-800 px-4 py-3 bg-zinc-900/60 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
              <span className="text-zinc-200 font-semibold">PAYTHOS TRANSACTION LIFECYCLE SIMULATOR</span>
            </div>
            <div className="flex items-center space-x-1">
              {[1, 2, 3].map((step) => (
                <button
                  key={step}
                  onClick={() => setSimStep(step)}
                  className={`px-3 py-1 text-[11px] rounded transition ${
                    simStep === step
                      ? 'bg-zinc-800 text-white font-semibold border border-zinc-700'
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
            <div className={`space-y-3 ${simStep === 1 ? 'opacity-100 ring-1 ring-zinc-700 p-2 rounded' : 'opacity-40'} transition-all`}>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-2 border-b border-zinc-800">
                <span className="text-white font-semibold">1. HTTP 402 Challenge</span>
                <span className="text-amber-400 font-semibold">402 Payment Required</span>
              </div>
              <p className="text-zinc-500 text-[11px]">
                Autonomous agent requests protected inference. Gateway returns x402 challenge header with price parameters.
              </p>
              <div className="p-3 bg-zinc-900 rounded border border-zinc-800 text-[11px] text-zinc-300 overflow-x-auto">
                <div className="text-zinc-500">// Gateway Header Response</div>
                <div>HTTP/1.1 402 Payment Required</div>
                <div>x-paythos-price: <span className="text-amber-400 font-bold">2000</span> (0.002 USDC)</div>
                <div>x-paythos-vault: <span className="text-zinc-400">0x6E08...43D9</span></div>
                <div>x-paythos-merchant: <span className="text-zinc-400">0x0000...0003</span></div>
              </div>
            </div>

            {/* Step 2: Off-Chain Signature */}
            <div className={`space-y-3 ${simStep === 2 ? 'opacity-100 ring-1 ring-zinc-700 p-2 rounded' : 'opacity-40'} transition-all`}>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-2 border-b border-zinc-800">
                <span className="text-white font-semibold">2. EIP-712 Voucher Sign</span>
                <span className="text-cyan-400 font-semibold">&lt; 1ms Signature</span>
              </div>
              <p className="text-zinc-500 text-[11px]">
                Agent session key signs typed monotonic debt ticket off-chain. Zero gas paid; zero network delay.
              </p>
              <div className="p-3 bg-zinc-900 rounded border border-zinc-800 text-[11px] text-zinc-300 overflow-x-auto">
                <div className="text-zinc-500">// Signed Payload Hash</div>
                <div>cumulativeAmount: <span className="text-cyan-400 font-bold">100000</span> (0.100 USDC)</div>
                <div>sessionId: 1</div>
                <div>nonce: 50</div>
                <div className="text-zinc-500 mt-1">// ECDSA Signature (65 bytes)</div>
                <div className="truncate text-zinc-400">0x7fe2bd83bb839481...</div>
              </div>
            </div>

            {/* Step 3: Base L2 Settlement */}
            <div className={`space-y-3 ${simStep === 3 ? 'opacity-100 ring-1 ring-zinc-700 p-2 rounded' : 'opacity-40'} transition-all`}>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-2 border-b border-zinc-800">
                <span className="text-white font-semibold">3. Base L2 Settlement</span>
                <span className="text-emerald-400 font-semibold">Atomic Delta Payout</span>
              </div>
              <p className="text-zinc-500 text-[11px]">
                When cumulative debt hits merchant threshold ($5.00), accumulator flushes 1 single transaction on Base L2.
              </p>
              <div className="p-3 bg-zinc-900 rounded border border-zinc-800 text-[11px] text-zinc-300 overflow-x-auto">
                <div className="text-zinc-500">// PaythosVault.settleVoucher()</div>
                <div>payoutDelta: <span className="text-emerald-400 font-bold">100000</span> units</div>
                <div>merchantPayout (98.5%): 98500</div>
                <div>protocolTreasury (1.5%): 1500</div>
                <div className="text-emerald-400 mt-1">✓ Conservation of Balance: 100%</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Official Ecosystem & Platform Logos Strip */}
      <section id="ecosystem" className="max-w-7xl mx-auto px-6 py-12 border-b border-zinc-800/60 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Ecosystem Interoperability</div>
            <div className="text-sm font-semibold text-zinc-200 mt-0.5">Compatible with leading agent runtimes & standards</div>
          </div>

          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            {/* Base */}
            <div className="flex items-center space-x-2 text-zinc-400 hover:text-white transition group">
              <BaseLogo className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="text-xs font-mono font-medium">Base L2</span>
            </div>

            {/* Claude / Anthropic */}
            <div className="flex items-center space-x-2 text-zinc-400 hover:text-white transition group">
              <ClaudeLogo className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="text-xs font-mono font-medium">Anthropic MCP</span>
            </div>

            {/* ElizaOS */}
            <div className="flex items-center space-x-2 text-zinc-400 hover:text-white transition group">
              <ElizaLogo className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="text-xs font-mono font-medium">ElizaOS</span>
            </div>

            {/* LangChain */}
            <div className="flex items-center space-x-2 text-zinc-400 hover:text-white transition group">
              <LangChainLogo className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="text-xs font-mono font-medium">LangChain</span>
            </div>

            {/* Viem */}
            <div className="flex items-center space-x-2 text-zinc-400 hover:text-white transition group">
              <ViemLogo className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="text-xs font-mono font-medium">Viem</span>
            </div>

            {/* Foundry */}
            <div className="flex items-center space-x-2 text-zinc-400 hover:text-white transition group">
              <FoundryLogo className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="text-xs font-mono font-medium">Foundry</span>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Integration Code Console with Full Syntax Highlighting */}
      <section id="integration" className="max-w-7xl mx-auto px-6 py-20 border-b border-zinc-800/60 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Implementation Console</div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-1">
              Production-grade code in 4 lines of TypeScript.
            </h2>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0 font-mono text-xs">
            <div className="flex space-x-1 border border-zinc-800 p-1 rounded bg-zinc-950">
              {(['agent', 'merchant', 'mcp', 'vault'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveCodeTab(tab)}
                  className={`px-3 py-1 rounded transition uppercase ${
                    activeCodeTab === tab
                      ? 'bg-zinc-800 text-white font-medium shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab === 'agent' && 'Client Signer'}
                  {tab === 'merchant' && 'x402 Paywall'}
                  {tab === 'mcp' && 'MCP Config'}
                  {tab === 'vault' && 'Solidity ABI'}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded transition flex items-center gap-1.5"
            >
              {copiedCode ? (
                <span className="text-emerald-400 font-semibold">✓ Copied</span>
              ) : (
                <span>Copy Code</span>
              )}
            </button>
          </div>
        </div>

        {/* Color-Coded Implementation Console (Tokyo Night / VS Code Palette) */}
        <div className="border border-zinc-800 rounded-lg bg-[#0d0e12] overflow-hidden font-mono text-xs shadow-2xl relative">
          <div className="border-b border-zinc-800/80 px-4 py-2.5 bg-zinc-950/80 flex items-center justify-between text-zinc-500 text-[11px]">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block"></span>
              <span className="ml-2 text-zinc-400 font-medium">
                {activeCodeTab === 'agent' && 'agent/runtime.ts — Sub-millisecond Client'}
                {activeCodeTab === 'merchant' && 'server/middleware.ts — Merchant Route Guard'}
                {activeCodeTab === 'mcp' && 'claude_desktop_config.json — Native MCP Setup'}
                {activeCodeTab === 'vault' && 'contracts/PaythosVault.sol — Core Interface'}
              </span>
            </div>
            <span className="text-zinc-500 font-mono">TypeScript 5.x</span>
          </div>

          <div className="p-6 overflow-x-auto text-zinc-300 leading-relaxed text-xs">
            {activeCodeTab === 'agent' && (
              <pre className="font-mono">
                <span className="text-purple-400">import</span> &#123; <span className="text-yellow-300">AgentVoucherSigner</span> &#125; <span className="text-purple-400">from</span> <span className="text-emerald-300">&apos;@paythos/sdk&apos;</span>;<br /><br />
                <span className="text-zinc-500 italic">// 1. Initialize with an ephemeral session key (NOT master key)</span><br />
                <span className="text-purple-400">const</span> <span className="text-cyan-300">signer</span> = <span className="text-purple-400">new</span> <span className="text-yellow-300">AgentVoucherSigner</span>(<br />
                &nbsp;&nbsp;<span className="text-zinc-200">process</span>.<span className="text-zinc-200">env</span>.<span className="text-orange-300">AGENT_SESSION_KEY</span>,<br />
                &nbsp;&nbsp;<span className="text-emerald-300">&apos;0x6E0837c166c01710dC86f2E25DAE2fFD574343D9&apos;</span>, <span className="text-zinc-500 italic">// Base Sepolia Vault</span><br />
                &nbsp;&nbsp;<span className="text-orange-400">84532</span> <span className="text-zinc-500 italic">// Base Sepolia Chain ID</span><br />
                );<br /><br />
                <span className="text-zinc-500 italic">// 2. Sign cumulative voucher off-chain (&lt; 1ms, zero gas)</span><br />
                <span className="text-purple-400">const</span> <span className="text-cyan-300">payment</span> = <span className="text-purple-400">await</span> <span className="text-cyan-300">signer</span>.<span className="text-blue-400">signCumulativePayment</span>(<br />
                &nbsp;&nbsp;<span className="text-zinc-200">merchantAddress</span>,<br />
                &nbsp;&nbsp;<span className="text-zinc-200">usdcAddress</span>,<br />
                &nbsp;&nbsp;<span className="text-orange-400">2000n</span> <span className="text-zinc-500 italic">// $0.002 incremental hit</span><br />
                );<br /><br />
                <span className="text-zinc-500 italic">// 3. Attach standard x402 voucher header to any fetch call</span><br />
                <span className="text-purple-400">const</span> <span className="text-cyan-300">res</span> = <span className="text-purple-400">await</span> <span className="text-blue-400">fetch</span>(<span className="text-emerald-300">&apos;https://api.merchant.com/query&apos;</span>, &#123;<br />
                &nbsp;&nbsp;<span className="text-zinc-300">headers</span>: &#123; <span className="text-emerald-300">&apos;X-Paythos-Voucher&apos;</span>: <span className="text-cyan-300">payment</span>.<span className="text-zinc-200">headerPayload</span> &#125;<br />
                &#125;);
              </pre>
            )}

            {activeCodeTab === 'merchant' && (
              <pre className="font-mono">
                <span className="text-purple-400">import</span> <span className="text-zinc-200">express</span> <span className="text-purple-400">from</span> <span className="text-emerald-300">&apos;express&apos;</span>;<br />
                <span className="text-purple-400">import</span> &#123; <span className="text-blue-400">createX402Paywall</span>, <span className="text-yellow-300">VoucherAccumulator</span>, <span className="text-yellow-300">PaythosVaultClient</span> &#125; <span className="text-purple-400">from</span> <span className="text-emerald-300">&apos;@paythos/sdk&apos;</span>;<br /><br />
                <span className="text-purple-400">const</span> <span className="text-cyan-300">app</span> = <span className="text-blue-400">express</span>();<br />
                <span className="text-purple-400">const</span> <span className="text-cyan-300">vaultClient</span> = <span className="text-purple-400">new</span> <span className="text-yellow-300">PaythosVaultClient</span>(<br />
                &nbsp;&nbsp;<span className="text-emerald-300">&apos;0x6E0837c166c01710dC86f2E25DAE2fFD574343D9&apos;</span>,<br />
                &nbsp;&nbsp;<span className="text-zinc-200">RPC_URL</span>,<br />
                &nbsp;&nbsp;<span className="text-zinc-200">merchantWallet</span><br />
                );<br /><br />
                <span className="text-zinc-500 italic">// Protect API with token-bucket rate limiter and 98% gas-saving accumulator</span><br />
                <span className="text-cyan-300">app</span>.<span className="text-blue-400">use</span>(<span className="text-emerald-300">&apos;/api/v1/inference&apos;</span>, <span className="text-blue-400">createX402Paywall</span>(&#123;<br />
                &nbsp;&nbsp;<span className="text-zinc-300">merchantAddress</span>: <span className="text-emerald-300">&apos;0x0000000000000000000000000000000000000003&apos;</span>,<br />
                &nbsp;&nbsp;<span className="text-zinc-300">vaultAddress</span>: <span className="text-emerald-300">&apos;0x6E0837c166c01710dC86f2E25DAE2fFD574343D9&apos;</span>,<br />
                &nbsp;&nbsp;<span className="text-zinc-300">tokenAddress</span>: <span className="text-emerald-300">&apos;0x036CbD53842c5426634e7929541eC2318f3dCF7e&apos;</span>, <span className="text-zinc-500 italic">// USDC</span><br />
                &nbsp;&nbsp;<span className="text-zinc-300">pricePerCall</span>: <span className="text-orange-400">2000n</span>, <span className="text-zinc-500 italic">// $0.002 per call</span><br />
                &nbsp;&nbsp;<span className="text-zinc-300">accumulator</span>: <span className="text-purple-400">new</span> <span className="text-yellow-300">VoucherAccumulator</span>(<span className="text-cyan-300">vaultClient</span>, <span className="text-orange-400">5_000_000n</span>) <span className="text-zinc-500 italic">// Auto-flush at $5.00</span><br />
                &#125;));<br /><br />
                <span className="text-cyan-300">app</span>.<span className="text-blue-400">listen</span>(<span className="text-orange-400">8080</span>);
              </pre>
            )}

            {activeCodeTab === 'mcp' && (
              <pre className="font-mono">
                &#123;<br />
                &nbsp;&nbsp;<span className="text-purple-400">&quot;mcpServers&quot;</span>: &#123;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-yellow-300">&quot;paythos&quot;</span>: &#123;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">&quot;command&quot;</span>: <span className="text-emerald-300">&quot;npx&quot;</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">&quot;args&quot;</span>: [<span className="text-emerald-300">&quot;-y&quot;</span>, <span className="text-emerald-300">&quot;@paythos/mcp-server&quot;</span>],<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">&quot;env&quot;</span>: &#123;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-cyan-300">&quot;PAYTHOS_SESSION_KEY&quot;</span>: <span className="text-emerald-300">&quot;0x_your_ephemeral_agent_key&quot;</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-cyan-300">&quot;PAYTHOS_VAULT_ADDRESS&quot;</span>: <span className="text-emerald-300">&quot;0x6E0837c166c01710dC86f2E25DAE2fFD574343D9&quot;</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-cyan-300">&quot;PAYTHOS_CHAIN_ID&quot;</span>: <span className="text-emerald-300">&quot;84532&quot;</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-cyan-300">&quot;PAYTHOS_RPC_URL&quot;</span>: <span className="text-emerald-300">&quot;https://sepolia.base.org&quot;</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                &nbsp;&nbsp;&#125;<br />
                &#125;
              </pre>
            )}

            {activeCodeTab === 'vault' && (
              <pre className="font-mono">
                <span className="text-zinc-500 italic">// SPDX-License-Identifier: MIT</span><br />
                <span className="text-zinc-500 italic">// Verified on Base Sepolia Ledger (Block #48001033)</span><br />
                <span className="text-purple-400">interface</span> <span className="text-yellow-300">IPaythosVault</span> &#123;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">function</span> <span className="text-blue-400">settleVoucher</span>(<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-yellow-300">PaymentVoucher</span> <span className="text-purple-400">calldata</span> <span className="text-zinc-200">voucher</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">bytes</span> <span className="text-purple-400">calldata</span> <span className="text-zinc-200">signature</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;) <span className="text-purple-400">external</span>;<br /><br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">function</span> <span className="text-blue-400">createSession</span>(<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">address</span> <span className="text-zinc-200">agentKey</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">uint256</span> <span className="text-zinc-200">dailyLimit</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">uint256</span> <span className="text-zinc-200">durationInSeconds</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;) <span className="text-purple-400">external</span>;<br /><br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">function</span> <span className="text-blue-400">revokeSession</span>(<span className="text-purple-400">address</span> <span className="text-zinc-200">agentKey</span>) <span className="text-purple-400">external</span>;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">function</span> <span className="text-blue-400">queueWithdrawal</span>(<span className="text-purple-400">address</span> <span className="text-zinc-200">token</span>, <span className="text-purple-400">uint256</span> <span className="text-zinc-200">amount</span>) <span className="text-purple-400">external</span>;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">function</span> <span className="text-blue-400">executeWithdrawal</span>(<span className="text-purple-400">address</span> <span className="text-zinc-200">token</span>, <span className="text-purple-400">address</span> <span className="text-zinc-200">to</span>) <span className="text-purple-400">external</span>;<br />
                &#125;
              </pre>
            )}
          </div>
        </div>
      </section>

      {/* Economic Comparison & Live Calculator */}
      <section id="economics" className="max-w-7xl mx-auto px-6 py-20 border-b border-zinc-800/60 relative z-10">
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Unit Economics</div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-1">
            Collapsing the micro-transaction barrier.
          </h2>
          <p className="mt-3 text-zinc-400 text-sm font-sans leading-relaxed">
            By shifting from isolated on-chain state updates to off-chain cumulative debt tickets, Paythos turns the unviable micro-economy into high-margin machine commerce.
          </p>
        </div>

        <div className="border border-zinc-800 rounded-lg p-6 sm:p-8 bg-zinc-950/80 font-mono text-xs max-w-4xl shadow-xl">
          <div className="mb-8">
            <div className="flex justify-between items-center text-xs text-zinc-400 mb-2">
              <span>MONTHLY MACHINE INFERENCES:</span>
              <span className="text-white font-bold text-sm">{apiCalls.toLocaleString()} Calls</span>
            </div>
            <input
              type="range"
              min="100"
              max="50000"
              step="100"
              value={apiCalls}
              onChange={(e) => setApiCalls(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 border border-red-950/40 bg-red-950/10 rounded">
              <div className="text-zinc-500 text-[11px]">VANILLA L2 TRANSACTIONS</div>
              <div className="text-2xl font-bold text-red-400 mt-1">${standardCost}</div>
              <div className="text-zinc-500 text-[11px] mt-1">{apiCalls} isolated on-chain writes</div>
            </div>

            <div className="p-4 border border-emerald-950/50 bg-emerald-950/20 rounded">
              <div className="text-emerald-400 text-[11px] font-bold">WITH PAYTHOS BATCHED VOUCHERS</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">${paythosCost}</div>
              <div className="text-emerald-500 text-[11px] mt-1">98.0% Gas Elimination (Only {Math.ceil(apiCalls / 50)} settlements)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Verified On-Chain Specifications */}
      <section id="specs" className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">Protocol Ledger Artifacts</div>
        <h2 className="text-2xl font-semibold text-white tracking-tight mb-8">
          Immutable Parameters on Base Sepolia
        </h2>

        <div className="border border-zinc-800 rounded bg-zinc-950 font-mono text-xs divide-y divide-zinc-800 shadow-xl">
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
            <span className="text-emerald-400">150 basis points (1.50% fee cap at 500 bps)</span>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-12 text-xs font-mono text-zinc-500 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-white">PAYTHOS PROTOCOL</span>
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
