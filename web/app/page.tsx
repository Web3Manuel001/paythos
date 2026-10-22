'use client';

import React, { useState } from 'react';

const SIMULATION_SCENARIOS = [
  {
    id: 'cap-exceeded',
    title: 'Adversarial: Spend Cap Exceeded',
    subtitle: 'Agent attempts to spend $150.00 against a $100.00 daily limit',
    attempt: 'spend(150 * 1e6)',
    status: 'BLOCKED',
    httpStatus: 403,
    error: 'DailyLimitExceeded(requested: $150, remaining: $100)',
    mitigation: 'PaythosVault.sol on-chain spend cap enforcement',
  },
  {
    id: 'replay-nonce',
    title: 'Adversarial: Nonce Replay Attack',
    subtitle: 'Merchant attempts to resubmit an already-settled voucher (Nonce: 1)',
    attempt: 'settleVoucher(nonce: 1, amount: $5.00)',
    status: 'BLOCKED',
    httpStatus: 403,
    error: 'InvalidNonce(proposed: 1, current: 1)',
    mitigation: 'Monotonic lastNonce[channelKey] on-chain enforcement',
  },
  {
    id: 'killswitch',
    title: 'Adversarial: Compromised Agent Killswitch',
    subtitle: 'Jailbroken agent attempts payment after admin hit revokeSession()',
    attempt: 'signCumulativePayment(compromisedKey)',
    status: 'BLOCKED',
    httpStatus: 401,
    error: 'SessionNotActive()',
    mitigation: 'Instant administrative on-chain revocation',
  },
  {
    id: 'token-mismatch',
    title: 'Adversarial: Token Decimal Mismatch',
    subtitle: 'Agent attempts payment in unapproved 18-decimal token',
    attempt: 'settleVoucher(token: 0xUnapprovedDAI)',
    status: 'BLOCKED',
    httpStatus: 403,
    error: 'UnsupportedToken(provided: 0xDAI, expected: 0x3600...0000)',
    mitigation: 'Canonical Arc Native USDC address pinning',
  },
  {
    id: 'valid-hit',
    title: 'Normal: Authorized Micro-Commerce',
    subtitle: 'Agent queries BlockRun AI inference gateway ($0.0035 USDC)',
    attempt: 'signCumulativePayment(delta: 3500n)',
    status: 'APPROVED',
    httpStatus: 200,
    error: 'None (Settled under monotonic EIP-712 channel)',
    mitigation: 'Verified EIP-712 signature + Arc Structured Memo stamped',
  },
];

export default function PaythosPlatform() {
  const [selectedScenario, setSelectedScenario] = useState(0);

  const active = SIMULATION_SCENARIOS[selectedScenario];

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] selection:bg-zinc-200 selection:text-zinc-950 font-sans antialiased relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      {/* Top Ticker */}
      <div className="border-b border-zinc-800/80 bg-zinc-950/90 px-4 py-1.5 text-xs font-mono text-zinc-400 flex items-center justify-between overflow-x-auto relative z-10 backdrop-blur">
        <div className="flex items-center space-x-6 min-w-max">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-zinc-200 font-semibold">Arc L1 Settlement Active</span>
          </div>
          <span className="text-zinc-700">/</span>
          <div>
            Vault: <span className="text-zinc-300 font-semibold">0xa9d5...51EF</span>
          </div>
          <span className="text-zinc-700">/</span>
          <div>
            Verified Smoke Tx: <span className="text-emerald-400 font-semibold">0xf711...193d</span> (Block #68409300)
          </div>
          <span className="text-zinc-700">/</span>
          <div>
            Asset: <span className="text-zinc-300">Arc Native USDC (0x3600...0000)</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-4 min-w-max text-[11px]">
          <a
            href="https://testnet.arcscan.app/address/0xa9d5525BE440831c64695d30c915DF303E0151EF"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-white transition"
          >
            ArcScan Explorer ↗
          </a>
          <a
            href="https://github.com/Web3Manuel001/paythos"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-white transition"
          >
            GitHub Source ↗
          </a>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-blue-600 text-white flex items-center justify-center font-mono font-black text-sm tracking-tighter rounded-sm">
              P
            </div>
            <span className="font-semibold text-base tracking-tight text-white font-mono">PAYTHOS</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-blue-900 bg-blue-950/40 text-blue-400">
              Policy &amp; Spend Governance
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-xs font-mono text-zinc-400">
            <a href="#simulator" className="hover:text-white transition">Policy Simulator</a>
            <a href="#architecture" className="hover:text-white transition">Threat Model</a>
            <a href="#pricing" className="hover:text-white transition">B2B Pricing</a>
            <a href="#specs" className="hover:text-white transition">On-Chain Specs</a>
          </div>

          <div className="flex items-center space-x-3 font-mono text-xs">
            <a
              href="https://testnet.arcscan.app/tx/0xf7113e7d05dad2ae241439afd16c3dc8f093cbe415cf9c99b87134014bad193d"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 rounded transition"
            >
              Verified Smoke Tx ↗
            </a>
            <a
              href="https://github.com/Web3Manuel001/paythos"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition"
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
            <span>THE FINANCIAL CONTROL PLANE FOR AUTONOMOUS SOFTWARE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-tight">
            The spending-control layer for AI agents.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
            We don&apos;t promise that AI agents cannot be manipulated. We constrain what they can do when manipulation occurs. Paythos gives autonomous software programmable financial permissions, deterministic daily caps, and verifiable payment workflows on Arc L1.
          </p>
        </div>

        {/* KILLER FEATURE: THE INTERACTIVE POLICY SIMULATOR */}
        <div id="simulator" className="mt-16 border border-zinc-800 rounded-lg bg-zinc-950 overflow-hidden shadow-2xl">
          <div className="border-b border-zinc-800 px-5 py-3 bg-zinc-900/60 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 text-zinc-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              <span>INTERACTIVE POLICY &amp; SECURITY SIMULATOR</span>
            </div>
            <span className="text-zinc-500 text-[11px]">Select Adversarial Scenario</span>
          </div>

          <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
            {/* Left: Scenario Selector */}
            <div className="p-4 space-y-2 font-mono text-xs bg-zinc-950">
              {SIMULATION_SCENARIOS.map((sc, i) => (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenario(i)}
                  className={`w-full text-left p-3 rounded transition flex flex-col space-y-1 ${
                    selectedScenario === i
                      ? 'bg-zinc-800 border border-zinc-700 text-white'
                      : 'hover:bg-zinc-900 text-zinc-400 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">{sc.title}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        sc.status === 'BLOCKED' ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400'
                      }`}
                    >
                      {sc.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate">{sc.subtitle}</div>
                </button>
              ))}
            </div>

            {/* Right: Policy Engine Inspection Output */}
            <div className="lg:col-span-2 p-6 font-mono text-xs space-y-4 bg-[#0c0d12]">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-[11px]">
                <span className="text-zinc-400 font-semibold">{active.title}</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    active.status === 'BLOCKED'
                      ? 'bg-red-950 text-red-400 border border-red-800/80'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                  }`}
                >
                  HTTP {active.httpStatus} — {active.status}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-zinc-500 text-[11px] uppercase">Attempted Action:</div>
                  <div className="mt-1 p-2.5 rounded bg-zinc-900/80 border border-zinc-800 text-zinc-200">
                    <code>{active.attempt}</code>
                  </div>
                </div>

                <div>
                  <div className="text-zinc-500 text-[11px] uppercase">Policy Response:</div>
                  <div className="mt-1 p-2.5 rounded bg-zinc-900/80 border border-zinc-800 text-zinc-300">
                    <span className={active.status === 'BLOCKED' ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                      {active.error}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-zinc-500 text-[11px] uppercase">Enforcing Mechanism:</div>
                  <div className="mt-1 text-xs text-zinc-400 font-sans">
                    {active.mitigation}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* B2B Pricing Section (419 Customers to $1M ARR) */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20 border-b border-zinc-800/60 relative z-10">
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-mono text-blue-400 uppercase tracking-wider">Enterprise Pricing</div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-1">
            Built for engineering teams running paid agents.
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            No transaction taxes on payment rails. Predictable monthly software tiers for policy control, audit logging, and spend containment.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="p-6 rounded border border-zinc-800 bg-zinc-950 flex flex-col justify-between">
            <div>
              <div className="text-zinc-500 uppercase text-[10px]">DEVELOPER</div>
              <div className="text-2xl font-bold text-white mt-1">$49 <span className="text-xs text-zinc-500 font-normal">/ mo</span></div>
              <p className="mt-3 text-zinc-400 text-xs font-sans">For small AI projects and independent agent builders.</p>
              <ul className="mt-4 space-y-2 text-zinc-300 text-[11px] border-t border-zinc-800 pt-4">
                <li>✓ Up to 5 Agent Session Keys</li>
                <li>✓ Daily Spend Caps &amp; Expirations</li>
                <li>✓ Standard EIP-712 Signer</li>
                <li>✓ Arc Testnet &amp; Base Spoke</li>
              </ul>
            </div>
            <a href="https://github.com/Web3Manuel001/paythos" target="_blank" rel="noreferrer" className="mt-6 block text-center py-2 border border-zinc-700 hover:bg-zinc-800 rounded font-semibold text-zinc-200">
              Start Free
            </a>
          </div>

          <div className="p-6 rounded border border-blue-600/80 bg-blue-950/20 flex flex-col justify-between relative shadow-xl shadow-blue-600/10">
            <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold uppercase">
              Core Target
            </span>
            <div>
              <div className="text-blue-400 uppercase text-[10px] font-bold">STARTUP / FLEET</div>
              <div className="text-2xl font-bold text-white mt-1">$199 <span className="text-xs text-zinc-400 font-normal">/ mo</span></div>
              <p className="mt-3 text-zinc-300 text-xs font-sans">For engineering teams running autonomous agent fleets in production.</p>
              <ul className="mt-4 space-y-2 text-zinc-200 text-[11px] border-t border-blue-900/60 pt-4">
                <li>✓ Up to 50 Agent Sessions</li>
                <li>✓ Merkleized Forensic Audit Logs</li>
                <li>✓ Real-Time Solvency Paywall Middleware</li>
                <li>✓ Instant Administrative Killswitch</li>
                <li>✓ Dual-Trigger Accumulator Relayers</li>
              </ul>
            </div>
            <a href="https://github.com/Web3Manuel001/paythos" target="_blank" rel="noreferrer" className="mt-6 block text-center py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold">
              Deploy Fleet
            </a>
          </div>

          <div className="p-6 rounded border border-zinc-800 bg-zinc-950 flex flex-col justify-between">
            <div>
              <div className="text-zinc-500 uppercase text-[10px]">ENTERPRISE</div>
              <div className="text-2xl font-bold text-white mt-1">$799 <span className="text-xs text-zinc-500 font-normal">/ mo</span></div>
              <p className="mt-3 text-zinc-400 text-xs font-sans">For funds, institutions, and multi-tenant agent platforms.</p>
              <ul className="mt-4 space-y-2 text-zinc-300 text-[11px] border-t border-zinc-800 pt-4">
                <li>✓ Unlimited Agent Fleets</li>
                <li>✓ Dual-Key Human Approval Thresholds</li>
                <li>✓ SOC 2 &amp; IRS 1099 Audit Exports</li>
                <li>✓ Dedicated High-Throughput Relayer Node</li>
                <li>✓ Custom Arc Structured Memo Schemas</li>
              </ul>
            </div>
            <a href="https://github.com/Web3Manuel001/paythos" target="_blank" rel="noreferrer" className="mt-6 block text-center py-2 border border-zinc-700 hover:bg-zinc-800 rounded font-semibold text-zinc-200">
              Contact Enterprise
            </a>
          </div>
        </div>
      </section>

      {/* Verified On-Chain Specifications */}
      <section id="specs" className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="text-xs font-mono text-blue-400 uppercase tracking-wider mb-2">Verified Ledger Artifacts</div>
        <h2 className="text-2xl font-semibold text-white tracking-tight mb-8">
          Immutable Parameters on Arc Testnet
        </h2>

        <div className="border border-zinc-800 rounded bg-zinc-950 font-mono text-xs divide-y divide-zinc-800 shadow-xl">
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-zinc-500">Core Settlement Vault:</span>
            <a
              href="https://testnet.arcscan.app/address/0xa9d5525BE440831c64695d30c915DF303E0151EF"
              target="_blank"
              rel="noreferrer"
              className="text-white hover:underline truncate"
            >
              0xa9d5525BE440831c64695d30c915DF303E0151EF
            </a>
          </div>

          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-zinc-500">Verified Smoke Settlement Tx:</span>
            <a
              href="https://testnet.arcscan.app/tx/0xf7113e7d05dad2ae241439afd16c3dc8f093cbe415cf9c99b87134014bad193d"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:underline truncate"
            >
              0xf7113e7d05dad2ae241439afd16c3dc8f093cbe415cf9c99b87134014bad193d (Block #68409300)
            </a>
          </div>

          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-zinc-500">Target Native Token:</span>
            <span className="text-zinc-300">0x3600000000000000000000000000000000000000 (Arc Native USDC)</span>
          </div>

          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-zinc-500">On-Chain Protocol Take Rate:</span>
            <span className="text-zinc-300">150 basis points (1.50% fee cap at 500 bps)</span>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-12 text-xs font-mono text-zinc-500 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-white">PAYTHOS PROTOCOL</span>
            <span>— Spend Policy &amp; Governance Layer for Autonomous Software.</span>
          </div>
          <div className="flex items-center space-x-6">
            <a
              href="https://testnet.arcscan.app/address/0xa9d5525BE440831c64695d30c915DF303E0151EF"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition"
            >
              ArcScan Explorer
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
