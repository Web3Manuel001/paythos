'use client';

import React, { useState } from 'react';

const CODE_RAW = {
  agent: `import { AgentVoucherSigner } from '@paythos/sdk';

// 1. Initialize with an ephemeral session key on Arc L1
const signer = new AgentVoucherSigner(
  process.env.AGENT_SESSION_KEY,
  '0xPaythosVaultOnArc', // Native Arc L1 Vault
  50420 // Arc L1 Chain ID (Circle)
);

// 2. Sign cumulative voucher off-chain (< 1ms, zero gas)
const payment = await signer.signCumulativePayment(
  merchantAddress,
  '0xArcNativeUSDC',
  2000n // $0.002 micro-call
);

// 3. Settle x402 endpoint with Arc structured memo
const res = await fetch('https://api.blockrun.ai/v1/chat/completions', {
  headers: { 'X-Paythos-Voucher': payment.headerPayload }
});`,

  merchant: `import express from 'express';
import { createX402Paywall, VoucherAccumulator, PaythosVaultClient } from '@paythos/sdk';

const app = express();
const vaultClient = new PaythosVaultClient(
  '0xPaythosVaultOnArc',
  'https://rpc.arc.network', // Circle Arc L1 RPC
  merchantWallet
);

// Protect API with token-bucket limiter and Arc memo stamping
app.use('/api/v1/inference', createX402Paywall({
  merchantAddress: '0xYourMerchantOnArc',
  vaultAddress: '0xPaythosVaultOnArc',
  tokenAddress: '0xArcNativeUSDC', // Gas & balance in USDC
  pricePerCall: 2000n, // $0.002
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
        "PAYTHOS_VAULT_ADDRESS": "0xPaythosVaultOnArc",
        "PAYTHOS_CHAIN_ID": "50420",
        "PAYTHOS_RPC_URL": "https://rpc.arc.network"
      }
    }
  }
}`,

  vault: `// SPDX-License-Identifier: MIT
// Verified for Arc L1 (Circle) & Base
interface IPaythosVault {
    function settleVoucherWithMemo(
        PaymentVoucher calldata voucher,
        bytes32 arcMemoHash,
        bytes calldata signature
    ) external;

    function executePaymentWithMemo(
        address token,
        address recipient,
        uint256 amount,
        bytes32 arcMemoHash
    ) external;

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

  const CONTRACT_ADDRESS = '0xa9d5525BE440831c64695d30c915DF303E0151EF';

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
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      {/* Protocol Ticker */}
      <div className="border-b border-zinc-800/80 bg-zinc-950/90 px-4 py-1.5 text-xs font-mono text-zinc-400 flex items-center justify-between overflow-x-auto relative z-10 backdrop-blur">
        <div className="flex items-center space-x-6 min-w-max">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-zinc-200 font-semibold">Arc L1: Circle Economic Engine Active</span>
          </div>
          <span className="text-zinc-700">/</span>
          <div>
            Gas: <span className="text-emerald-400 font-semibold">Native USDC</span>
          </div>
          <span className="text-zinc-700">/</span>
          <div>
            Arc Structured Memos: <span className="text-zinc-300">Enabled</span>
          </div>
          <span className="text-zinc-700">/</span>
          <div>
            Protocol Fee: <span className="text-emerald-400">1.50% (150 bps)</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-4 min-w-max text-[11px]">
          <a
            href="https://testnet.arcscan.app/address/0xa9d5525BE440831c64695d30c915DF303E0151EF"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-white transition flex items-center gap-1"
          >
            Basescan Verified ↗
          </a>
          <a
            href="https://github.com/Web3Manuel001/paythos"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-white transition flex items-center gap-1"
          >
            GitHub Source ↗
          </a>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-blue-600 text-white flex items-center justify-center font-mono font-black text-sm tracking-tighter rounded-sm shadow-md shadow-blue-600/30">
              P
            </div>
            <span className="font-semibold text-base tracking-tight text-white font-mono">PAYTHOS</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-blue-900 bg-blue-950/40 text-blue-400">
              Arc &amp; Circle Native
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-xs font-mono text-zinc-400">
            <a href="#ecosystem" className="hover:text-white transition">Ecosystem</a>
            <a href="#superpowers" className="hover:text-white transition">Arc Superpowers</a>
            <a href="#simulator" className="hover:text-white transition">Voucher Simulator</a>
            <a href="#integration" className="hover:text-white transition">Integration</a>
            <a href="#specs" className="hover:text-white transition">Ledger Specs</a>
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
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition shadow-lg shadow-blue-600/20"
            >
              Get SDK
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-20 pb-16 relative z-10 border-b border-zinc-800/60">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-blue-300 border border-blue-800/60 px-3 py-1 mb-6 rounded-sm bg-blue-950/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="font-semibold text-white">BUILT NATIVELY FOR ARC L1 &amp; CIRCLE USDC</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-tight">
            The native agentic monetary vault for Arc &amp; Base.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
            Non-custodial session policies, mathematical spend guardrails, and native USDC gas settlement for autonomous AI agent swarms. Powered by EIP-712 off-chain vouchers, Arc structured memos, and x402 v2 protocol.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="flex items-center space-x-2 border border-blue-900/40 bg-blue-950/20 px-3 py-2 rounded text-blue-200">
              <span className="text-blue-400 font-bold">Gas Rail:</span>
              <span>Native USDC (Zero ETH needed)</span>
            </div>
            <div className="flex items-center space-x-2 border border-emerald-950 bg-emerald-950/20 px-3 py-2 rounded">
              <span className="text-emerald-500 font-bold">Paythos Batched:</span>
              <span className="text-emerald-400 font-semibold">98.0% gas elimination</span>
            </div>
            <div className="flex items-center space-x-2 border border-zinc-800 bg-zinc-900/50 px-3 py-2 rounded">
              <span className="text-zinc-500">Memos:</span>
              <span className="text-white font-semibold">Arc Explorer Indexed</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Protocol Simulator */}
        <div id="simulator" className="mt-16 border border-zinc-800 rounded-lg bg-zinc-950 overflow-hidden shadow-2xl">
          <div className="border-b border-zinc-800 px-4 py-3 bg-zinc-900/60 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-ping"></span>
              <span className="text-zinc-200 font-semibold">ARC TRANSACTION LIFECYCLE SIMULATOR</span>
            </div>
            <div className="flex items-center space-x-1">
              {[1, 2, 3].map((step) => (
                <button
                  key={step}
                  onClick={() => setSimStep(step)}
                  className={`px-3 py-1 text-[11px] rounded transition ${
                    simStep === step
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Step 0{step}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800 p-6 gap-6 font-mono text-xs">
            {/* Step 1 */}
            <div className={`space-y-3 ${simStep === 1 ? 'opacity-100 ring-1 ring-blue-500/40 p-2 rounded' : 'opacity-40'} transition-all`}>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-2 border-b border-zinc-800">
                <span className="text-white font-semibold">1. HTTP 402 Challenge</span>
                <span className="text-amber-400 font-semibold">402 Payment Required</span>
              </div>
              <p className="text-zinc-500 text-[11px]">
                Autonomous agent queries an Arc marketplace service (e.g., BlockRun AI). Gateway returns x402 challenge header.
              </p>
              <div className="p-3 bg-zinc-900 rounded border border-zinc-800 text-[11px] text-zinc-300 overflow-x-auto">
                <div className="text-zinc-500">// Arc Service Challenge</div>
                <div>HTTP/1.1 402 Payment Required</div>
                <div>x-paythos-price: <span className="text-amber-400 font-bold">3500</span> (0.0035 USDC)</div>
                <div>x-paythos-network: <span className="text-blue-400">arc:mainnet</span></div>
                <div>x-paythos-token: <span className="text-zinc-400">0xArcNativeUSDC</span></div>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`space-y-3 ${simStep === 2 ? 'opacity-100 ring-1 ring-blue-500/40 p-2 rounded' : 'opacity-40'} transition-all`}>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-2 border-b border-zinc-800">
                <span className="text-white font-semibold">2. Off-Chain Signature</span>
                <span className="text-cyan-400 font-semibold">&lt; 1ms Off-chain</span>
              </div>
              <p className="text-zinc-500 text-[11px]">
                Agent session key signs typed monotonic debt voucher off-chain. Zero gas consumed; sub-millisecond execution.
              </p>
              <div className="p-3 bg-zinc-900 rounded border border-zinc-800 text-[11px] text-zinc-300 overflow-x-auto">
                <div className="text-zinc-500">// Signed Payload Hash</div>
                <div>cumulativeAmount: <span className="text-cyan-400 font-bold">175000</span> (0.175 USDC)</div>
                <div>sessionId: 1</div>
                <div>arcMemo: <span className="text-emerald-400">0x4a9e2f...</span> (Intent Hash)</div>
                <div className="text-zinc-500 mt-1">// ECDSA Signature (65 bytes)</div>
                <div className="truncate text-zinc-400">0x7fe2bd83bb839481...</div>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`space-y-3 ${simStep === 3 ? 'opacity-100 ring-1 ring-blue-500/40 p-2 rounded' : 'opacity-40'} transition-all`}>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-2 border-b border-zinc-800">
                <span className="text-white font-semibold">3. Arc L1 Settlement</span>
                <span className="text-emerald-400 font-semibold">Atomic Gasless Settle</span>
              </div>
              <p className="text-zinc-500 text-[11px]">
                Threshold reached. Accumulator triggers settleVoucherWithMemo() on Arc L1. Gas paid natively in micro-USDC.
              </p>
              <div className="p-3 bg-zinc-900 rounded border border-zinc-800 text-[11px] text-zinc-300 overflow-x-auto">
                <div className="text-zinc-500">// PaythosVault.settleVoucherWithMemo()</div>
                <div>payoutDelta: <span className="text-emerald-400 font-bold">175000</span> units</div>
                <div>merchantPayout (98.5%): 172375</div>
                <div>protocolTreasury (1.5%): 2625</div>
                <div className="text-blue-400 mt-1">✓ Arc Memo Stamped for Explorer Indexing</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Circle & Arc Native Superpowers Section */}
      <section id="superpowers" className="max-w-7xl mx-auto px-6 py-20 border-b border-zinc-800/60 relative z-10">
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-mono text-blue-400 uppercase tracking-wider">Circle Ecosystem Alignment</div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-1">
            Engineered natively for Arc L1 &amp; USDC.
          </h2>
          <p className="mt-3 text-zinc-400 text-sm font-sans leading-relaxed">
            By eliminating volatile gas tokens and clunky 2-step approvals, Paythos makes autonomous machine transactions frictionless.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="border border-zinc-800 p-6 rounded-lg bg-zinc-950 space-y-3">
            <div className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">01 / Native Gas</div>
            <h3 className="text-base font-bold text-white">Gas Paid Natively in USDC</h3>
            <p className="text-zinc-400 text-xs font-sans leading-relaxed">
              On Arc, transactions do not require ETH. Gas is denominated directly in micro-USDC, solving the gas bootstrapping paradox forever.
            </p>
          </div>

          <div className="border border-zinc-800 p-6 rounded-lg bg-zinc-950 space-y-3">
            <div className="text-blue-400 font-bold uppercase tracking-wider text-[11px]">02 / Structured Memos</div>
            <h3 className="text-base font-bold text-white">Arc Transaction Memos</h3>
            <p className="text-zinc-400 text-xs font-sans leading-relaxed">
              Cryptographic intent hashes and x402 challenge IDs are stamped directly into Arc's native transaction memo contracts for institutional auditability.
            </p>
          </div>

          <div className="border border-zinc-800 p-6 rounded-lg bg-zinc-950 space-y-3">
            <div className="text-purple-400 font-bold uppercase tracking-wider text-[11px]">03 / Universal CCTP</div>
            <h3 className="text-base font-bold text-white">Circle CCTP Cross-Chain</h3>
            <p className="text-zinc-400 text-xs font-sans leading-relaxed">
              Burn-and-mint USDC liquidity routing between Arc L1 and Base L2, enabling agents to pay across networks without wrapped bridge risk.
            </p>
          </div>
        </div>
      </section>

      {/* Official Ecosystem & Platform Logos Showcase */}
      <section id="ecosystem" className="max-w-7xl mx-auto px-6 py-16 border-b border-zinc-800/60 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Ecosystem & Runtime Interoperability</div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mt-1">
              Integrated across the autonomous machine stack.
            </h2>
          </div>
          <p className="text-xs font-mono text-zinc-500 max-w-sm">
            Native adapters for Arc L1, Base L2, Anthropic Claude MCP, Cursor, ElizaOS, and LangChain.
          </p>
        </div>

        {/* 8-Brand Architectural Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 font-mono text-xs">
          <div className="bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 p-4 rounded-lg flex items-center space-x-3.5 transition group">
            <img src="/brands/base.png" alt="Base L2" className="h-7 w-7 object-contain rounded" />
            <div>
              <div className="text-white font-medium group-hover:text-blue-400 transition">Base L2</div>
              <div className="text-[10px] text-zinc-500">CCTP Spoke</div>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 p-4 rounded-lg flex items-center space-x-3.5 transition group">
            <img src="/brands/claude.png" alt="Anthropic Claude" className="h-6 w-auto object-contain" />
            <div>
              <div className="text-white font-medium group-hover:text-amber-400 transition">Claude</div>
              <div className="text-[10px] text-zinc-500">MCP Standard</div>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 p-4 rounded-lg flex items-center space-x-3.5 transition group">
            <img src="/brands/cursor.webp" alt="Cursor IDE" className="h-6 w-auto object-contain filter invert" />
            <div>
              <div className="text-white font-medium group-hover:text-zinc-300 transition">Cursor</div>
              <div className="text-[10px] text-zinc-500">Autonomous IDE</div>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 p-4 rounded-lg flex items-center space-x-3.5 transition group">
            <img src="/brands/eliza.png" alt="ElizaOS" className="h-7 w-auto object-contain rounded" />
            <div>
              <div className="text-white font-medium group-hover:text-orange-400 transition">ElizaOS</div>
              <div className="text-[10px] text-zinc-500">Agent Swarms</div>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 p-4 rounded-lg flex items-center space-x-3.5 transition group">
            <img src="/brands/groq.webp" alt="Groq LPU" className="h-6 w-auto object-contain" />
            <div>
              <div className="text-white font-medium group-hover:text-orange-500 transition">Groq</div>
              <div className="text-[10px] text-zinc-500">LPU Inference</div>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 p-4 rounded-lg flex items-center space-x-3.5 transition group">
            <img src="/brands/langchain.svg" alt="LangChain" className="h-6 w-auto object-contain" />
            <div>
              <div className="text-white font-medium group-hover:text-emerald-400 transition">LangChain</div>
              <div className="text-[10px] text-zinc-500">Tool Calling</div>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 p-4 rounded-lg flex items-center space-x-3.5 transition group">
            <img src="/brands/viem.png" alt="Viem" className="h-6 w-auto object-contain filter invert" />
            <div>
              <div className="text-white font-medium group-hover:text-zinc-300 transition">Viem</div>
              <div className="text-[10px] text-zinc-500">Crypto Engine</div>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 p-4 rounded-lg flex items-center space-x-3.5 transition group">
            <img src="/brands/x402.png" alt="x402 Protocol" className="h-6 w-auto object-contain filter invert" />
            <div>
              <div className="text-white font-medium group-hover:text-zinc-300 transition">x402</div>
              <div className="text-[10px] text-zinc-500">HTTP Payment RFC</div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Integration Code Console */}
      <section id="integration" className="max-w-7xl mx-auto px-6 py-20 border-b border-zinc-800/60 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="text-xs font-mono text-blue-400 uppercase tracking-wider">Arc L1 &amp; Base Integration</div>
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
                      ? 'bg-blue-600 text-white font-medium shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab === 'agent' && 'Arc Signer'}
                  {tab === 'merchant' && 'x402 Paywall'}
                  {tab === 'mcp' && 'MCP Config'}
                  {tab === 'vault' && 'Arc ABI'}
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

        {/* Color-Coded Implementation Console */}
        <div className="border border-zinc-800 rounded-lg bg-[#0d0e12] overflow-hidden font-mono text-xs shadow-2xl relative">
          <div className="border-b border-zinc-800/80 px-4 py-2.5 bg-zinc-950/80 flex items-center justify-between text-zinc-500 text-[11px]">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block"></span>
              <span className="ml-2 text-zinc-400 font-medium">
                {activeCodeTab === 'agent' && 'agent/runtime.ts — Arc L1 Native Client'}
                {activeCodeTab === 'merchant' && 'server/middleware.ts — x402 Route Guard on Arc'}
                {activeCodeTab === 'mcp' && 'claude_desktop_config.json — Native MCP Setup'}
                {activeCodeTab === 'vault' && 'contracts/PaythosVault.sol — Arc Core Interface'}
              </span>
            </div>
            <span className="text-blue-400 font-mono">Native USDC Gas · Arc Verified</span>
          </div>

          <div className="p-6 overflow-x-auto text-zinc-300 leading-relaxed text-xs">
            {activeCodeTab === 'agent' && (
              <pre className="font-mono">
                <span className="text-purple-400">import</span> &#123; <span className="text-yellow-300">AgentVoucherSigner</span> &#125; <span className="text-purple-400">from</span> <span className="text-emerald-300">&apos;@paythos/sdk&apos;</span>;<br /><br />
                <span className="text-zinc-500 italic">// 1. Initialize with an ephemeral session key on Arc L1</span><br />
                <span className="text-purple-400">const</span> <span className="text-cyan-300">signer</span> = <span className="text-purple-400">new</span> <span className="text-yellow-300">AgentVoucherSigner</span>(<br />
                &nbsp;&nbsp;<span className="text-zinc-200">process</span>.<span className="text-zinc-200">env</span>.<span className="text-orange-300">AGENT_SESSION_KEY</span>,<br />
                &nbsp;&nbsp;<span className="text-emerald-300">&apos;0xPaythosVaultOnArc&apos;</span>, <span className="text-zinc-500 italic">// Circle Arc L1 Vault</span><br />
                &nbsp;&nbsp;<span className="text-orange-400">50420</span> <span className="text-zinc-500 italic">// Arc L1 Chain ID</span><br />
                );<br /><br />
                <span className="text-zinc-500 italic">// 2. Sign cumulative voucher off-chain (&lt; 1ms, zero gas)</span><br />
                <span className="text-purple-400">const</span> <span className="text-cyan-300">payment</span> = <span className="text-purple-400">await</span> <span className="text-cyan-300">signer</span>.<span className="text-blue-400">signCumulativePayment</span>(<br />
                &nbsp;&nbsp;<span className="text-zinc-200">merchantAddress</span>,<br />
                &nbsp;&nbsp;<span className="text-emerald-300">&apos;0xArcNativeUSDC&apos;</span>,<br />
                &nbsp;&nbsp;<span className="text-orange-400">2000n</span> <span className="text-zinc-500 italic">// $0.002 incremental hit</span><br />
                );<br /><br />
                <span className="text-zinc-500 italic">// 3. Attach standard x402 voucher header to any fetch call</span><br />
                <span className="text-purple-400">const</span> <span className="text-cyan-300">res</span> = <span className="text-purple-400">await</span> <span className="text-blue-400">fetch</span>(<span className="text-emerald-300">&apos;https://api.blockrun.ai/v1/chat/completions&apos;</span>, &#123;<br />
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
                &nbsp;&nbsp;<span className="text-emerald-300">&apos;0xPaythosVaultOnArc&apos;</span>,<br />
                &nbsp;&nbsp;<span className="text-emerald-300">&apos;https://rpc.arc.network&apos;</span>, <span className="text-zinc-500 italic">// Circle Arc L1 RPC</span><br />
                &nbsp;&nbsp;<span className="text-zinc-200">merchantWallet</span><br />
                );<br /><br />
                <span className="text-zinc-500 italic">// Protect API with token-bucket limiter and Arc memo stamping</span><br />
                <span className="text-cyan-300">app</span>.<span className="text-blue-400">use</span>(<span className="text-emerald-300">&apos;/api/v1/inference&apos;</span>, <span className="text-blue-400">createX402Paywall</span>(&#123;<br />
                &nbsp;&nbsp;<span className="text-zinc-300">merchantAddress</span>: <span className="text-emerald-300">&apos;0xYourMerchantOnArc&apos;</span>,<br />
                &nbsp;&nbsp;<span className="text-zinc-300">vaultAddress</span>: <span className="text-emerald-300">&apos;0xPaythosVaultOnArc&apos;</span>,<br />
                &nbsp;&nbsp;<span className="text-zinc-300">tokenAddress</span>: <span className="text-emerald-300">&apos;0xArcNativeUSDC&apos;</span>, <span className="text-zinc-500 italic">// Gas & balance in USDC</span><br />
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
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-cyan-300">&quot;PAYTHOS_VAULT_ADDRESS&quot;</span>: <span className="text-emerald-300">&quot;0xPaythosVaultOnArc&quot;</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-cyan-300">&quot;PAYTHOS_CHAIN_ID&quot;</span>: <span className="text-emerald-300">&quot;50420&quot;</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-cyan-300">&quot;PAYTHOS_RPC_URL&quot;</span>: <span className="text-emerald-300">&quot;https://rpc.arc.network&quot;</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                &nbsp;&nbsp;&#125;<br />
                &#125;
              </pre>
            )}

            {activeCodeTab === 'vault' && (
              <pre className="font-mono">
                <span className="text-zinc-500 italic">// SPDX-License-Identifier: MIT</span><br />
                <span className="text-zinc-500 italic">// Verified for Arc L1 (Circle) &amp; Base</span><br />
                <span className="text-purple-400">interface</span> <span className="text-yellow-300">IPaythosVault</span> &#123;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">function</span> <span className="text-blue-400">settleVoucherWithMemo</span>(<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-yellow-300">PaymentVoucher</span> <span className="text-purple-400">calldata</span> <span className="text-zinc-200">voucher</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">bytes32</span> <span className="text-zinc-200">arcMemoHash</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">bytes</span> <span className="text-purple-400">calldata</span> <span className="text-zinc-200">signature</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;) <span className="text-purple-400">external</span>;<br /><br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">function</span> <span className="text-blue-400">executePaymentWithMemo</span>(<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">address</span> <span className="text-zinc-200">token</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">address</span> <span className="text-zinc-200">recipient</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">uint256</span> <span className="text-zinc-200">amount</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">bytes32</span> <span className="text-zinc-200">arcMemoHash</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;) <span className="text-purple-400">external</span>;<br /><br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">function</span> <span className="text-blue-400">queueWithdrawal</span>(<span className="text-purple-400">address</span> <span className="text-zinc-200">token</span>, <span className="text-purple-400">uint256</span> <span className="text-zinc-200">amount</span>) <span className="text-purple-400">external</span>;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">function</span> <span className="text-blue-400">executeWithdrawal</span>(<span className="text-purple-400">address</span> <span className="text-zinc-200">token</span>, <span className="text-purple-400">address</span> <span className="text-zinc-200">to</span>) <span className="text-purple-400">external</span>;<br />
                &#125;
              </pre>
            )}
          </div>
        </div>
      </section>

      {/* Verified On-Chain Specifications */}
      <section id="specs" className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="text-xs font-mono text-blue-400 uppercase tracking-wider mb-2">Protocol Architecture</div>
        <h2 className="text-2xl font-semibold text-white tracking-tight mb-8">
          Arc L1 &amp; Base Settlement Specifications
        </h2>

        <div className="border border-zinc-800 rounded bg-zinc-950 font-mono text-xs divide-y divide-zinc-800 shadow-xl">
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-zinc-500">Primary Native L1:</span>
            <span className="text-blue-400 font-semibold">Arc Layer-1 (Circle Economic Engine)</span>
          </div>

          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-zinc-500">Gas Asset:</span>
            <span className="text-emerald-400 font-semibold">Native USDC (Zero volatile gas token exposure)</span>
          </div>

          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-zinc-500">Cross-Chain Spoke:</span>
            <span className="text-zinc-300">Base L2 (Verified at {CONTRACT_ADDRESS}) via Circle CCTP</span>
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
            <span>— The Native Agentic Payment Vault for Arc L1 &amp; Circle USDC.</span>
          </div>
          <div className="flex items-center space-x-6">
            <a
              href="https://testnet.arcscan.app/address/0xa9d5525BE440831c64695d30c915DF303E0151EF"
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
