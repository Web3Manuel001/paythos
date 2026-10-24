import Link from 'next/link';
import { PAYTHOS_CONFIG } from '@/config/paythos';
import { getArcLiveData } from '@/lib/live-chain';

export const dynamic = 'force-dynamic';

const steps = [
  ['01', 'Set the boundary', 'Give an agent a scoped budget, session lifetime, and approved destinations.'],
  ['02', 'Let it do the work', 'The agent can request a payment voucher for a task that fits its session policy.'],
  ['03', 'Keep the person in control', 'A person connects their wallet and confirms swaps. Each trade is a separate approval.'],
];

export default async function Home() {
  const live = await getArcLiveData();
  const { primary } = PAYTHOS_CONFIG;

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f0e7] text-[#182722] selection:bg-[#c8f169] selection:text-[#182722]">
      <div className="border-b border-[#182722]/15 bg-[#182722] px-5 py-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[#d6f59f] sm:text-xs">
        Arc Testnet prototype <span className="mx-2 text-white/35">/</span> Not audited · test assets only
      </div>

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="#top" className="flex items-center gap-3" aria-label="Paythos home">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#c8f169] font-serif text-xl font-bold">P</span>
          <span className="font-mono text-sm font-bold tracking-[0.2em]">PAYTHOS</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm md:flex">
          <Link className="hover:underline" href="#how">How it works</Link>
          <Link className="hover:underline" href="#build">For builders</Link>
          <Link className="hover:underline" href="#proof">Live testnet data</Link>
        </div>
        <a className="rounded-full border border-[#182722]/25 px-4 py-2 font-mono text-xs transition hover:bg-[#182722] hover:text-[#f4f0e7]" href="https://github.com/Web3Manuel001/paythos" target="_blank" rel="noreferrer">
          View the repo ↗
        </a>
      </nav>

      <section id="top" className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pt-20 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:pb-28">
        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#c8f169]/35 blur-3xl" />
        <div className="relative">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#182722]/20 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.15em]">
            <span className={`h-2 w-2 rounded-full ${live.available ? 'bg-[#719b32]' : 'bg-[#b66b45]'}`} /> Money rules for software that acts
          </p>
          <h1 className="max-w-3xl font-serif text-5xl leading-[.98] tracking-[-.045em] sm:text-7xl lg:text-[5.6rem]">
            Agents can act.<br /><em className="font-normal">You set the terms.</em>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-[#182722]/70 sm:text-lg">
            Paythos is building a financial control layer for AI agents: scoped payment sessions today, with user-approved swaps as the next step. The prototype currently reads its deployed vault on Arc Testnet.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#proof" className="rounded-full bg-[#182722] px-6 py-3 text-sm font-medium text-[#f4f0e7] transition hover:bg-[#30463c]">Inspect live testnet data <span aria-hidden="true">↘</span></a>
            <a href="#build" className="rounded-full border border-[#182722]/25 px-6 py-3 text-sm transition hover:bg-white/50">Build with Paythos</a>
          </div>
          <p className="mt-5 max-w-lg font-mono text-[10px] leading-5 text-[#182722]/55">Early prototype. No production funds. Payment controls and framework adapters still need validation before real-world use.</p>
        </div>

        <div className="relative mx-auto w-full max-w-[490px] rotate-[1deg]">
          <div className="absolute -right-5 -top-5 z-10 rotate-6 rounded-full border border-[#182722]/20 bg-[#f4f0e7] px-4 py-3 text-center font-mono text-[9px] uppercase leading-4 tracking-widest shadow-sm">Live<br />chain read</div>
          <div className="overflow-hidden rounded-[1.6rem] border border-[#182722]/15 bg-[#fffdf7] shadow-[0_30px_80px_-35px_rgba(24,39,34,.35)]">
            <div className="flex items-center justify-between border-b border-[#182722]/10 px-6 py-5">
              <div><div className="font-mono text-[9px] uppercase tracking-[.2em] text-[#182722]/50">Paythos / network status</div><div className="mt-1 font-serif text-xl">Arc Testnet</div></div>
              <span className={`rounded-full px-3 py-1 font-mono text-[9px] uppercase tracking-wider ${live.available ? 'bg-[#e7f4d3] text-[#476321]' : 'bg-[#f5e5dc] text-[#8d4727]'}`}>{live.available ? 'Connected' : 'Unavailable'}</span>
            </div>
            <div className="space-y-5 p-6 sm:p-8">
              {live.available ? <>
                <div className="flex items-end justify-between"><span className="text-sm text-[#182722]/60">Latest block</span><span className="font-serif text-4xl">{live.blockNumber.toLocaleString()}</span></div>
                <div className="border-t border-[#182722]/10 pt-4"><div className="font-mono text-[9px] uppercase tracking-[.2em] text-[#182722]/45">Vault settlement token</div><a className="mt-2 block break-all font-mono text-xs text-[#476321] underline" href={`${primary.blockExplorer}/address/${live.settlementToken}`} target="_blank" rel="noreferrer">{live.settlementToken}</a></div>
                <div className="border-t border-[#182722]/10 pt-4"><div className="font-mono text-[9px] uppercase tracking-[.2em] text-[#182722]/45">Smoke settlement receipt</div><div className="mt-2 flex items-center justify-between gap-3"><span className="text-sm">{live.proofStatus === 'confirmed' ? `Confirmed · block ${live.proofBlock?.toLocaleString()}` : live.proofStatus === 'failed' ? 'Transaction failed' : live.proofStatus === 'mismatched' ? 'Receipt does not target this vault' : 'Receipt unavailable from RPC'}</span><a className="shrink-0 font-mono text-[9px] uppercase underline" href={`${primary.blockExplorer}/tx/${primary.verifiedSettlementTx}`} target="_blank" rel="noreferrer">Explorer ↗</a></div></div>
                <div className="flex justify-between border-t border-dashed border-[#182722]/20 pt-4 font-mono text-[9px] text-[#182722]/50"><span>Chain ID {live.chainId}</span><span>Checked {new Date(live.checkedAt).toLocaleTimeString()}</span></div>
              </> : <div className="rounded-xl bg-[#f4f0e7] p-4"><p className="font-mono text-[9px] uppercase tracking-[.2em] text-[#8d4727]">Live Arc RPC data unavailable</p><p className="mt-2 break-words text-sm leading-6 text-[#182722]/65">{live.reason}</p><p className="mt-3 font-mono text-[9px] text-[#182722]/45">Checked {new Date(live.checkedAt).toLocaleTimeString()}</p></div>}
            </div>
          </div>
          <div className="absolute -bottom-5 -left-5 -z-10 h-full w-full rounded-[1.6rem] border border-[#182722]/15" />
        </div>
      </section>

      <section id="how" className="border-y border-[#182722]/15 bg-[#e9e5da]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#58723b]">The operating idea</p><h2 className="mt-3 max-w-xl font-serif text-4xl tracking-[-.03em] sm:text-5xl">A boundary between intent and money.</h2></div><p className="max-w-sm text-sm leading-6 text-[#182722]/60">An agent should be able to get work done without getting an open-ended mandate over someone’s funds.</p></div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-[#182722]/15 bg-[#182722]/15 md:grid-cols-3">
            {steps.map(([n, title, body]) => <article key={n} className="bg-[#f4f0e7] p-6 sm:p-8"><div className="font-mono text-xs text-[#789949]">/{n}</div><h3 className="mt-7 font-serif text-2xl">{title}</h3><p className="mt-3 max-w-sm text-sm leading-6 text-[#182722]/65">{body}</p></article>)}
          </div>
        </div>
      </section>

      <section id="build" className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[.85fr_1.15fr]">
        <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#58723b]">For builders</p><h2 className="mt-3 font-serif text-4xl tracking-[-.03em] sm:text-5xl">Bring your agent.<br />Keep the keys.</h2><p className="mt-5 max-w-md text-sm leading-6 text-[#182722]/65">The developer SDK contains voucher signing, an Arc vault client, and x402 middleware. Framework adapters provide read-only session information; they do not initiate payments.</p><a href="https://github.com/Web3Manuel001/paythos/tree/main/sdk" target="_blank" rel="noreferrer" className="mt-7 inline-flex border-b border-[#182722] pb-1 text-sm">Explore the TypeScript SDK ↗</a></div>
        <div className="rounded-2xl border border-[#182722]/15 bg-[#fffdf7] p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-[#182722]/10 pb-4"><span className="font-mono text-[10px] uppercase tracking-[.16em]">Repository integration scope</span><span className="font-mono text-[9px] text-[#182722]/45">SOURCE-VERIFIED</span></div>
          <div className="divide-y divide-[#182722]/10">
            {[
              ['LangChain', 'Read-only native tool · no spend action'],
              ['ElizaOS', 'Read-only session provider · no action'],
              ['MCP', 'Arc Testnet read-only tools · no private key'],
              ['MPC custody', 'No MPC wallet implementation in this repository'],
            ].map(([name, status]) => <div key={name} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between"><span className="font-serif text-xl">{name}</span><span className="text-xs text-[#182722]/55">{status}</span></div>)}
          </div>
          <div className="mt-4 rounded-xl bg-[#e9e5da] p-4 text-xs leading-5 text-[#182722]/65">The intended wallet direction is user-connected wallets for swaps, with explicit approval for each trade. The current prototype does not execute swaps.</div>
        </div>
      </section>

      <section id="proof" className="bg-[#182722] text-[#f4f0e7]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[.8fr_1.2fr]">
          <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#c8f169]">Live Arc Testnet / {primary.chainId}</p><h2 className="mt-3 font-serif text-4xl tracking-[-.03em] sm:text-5xl">On-chain facts.<br /><em className="font-normal text-[#c8f169]">Queried live.</em></h2><p className="mt-5 max-w-md text-sm leading-6 text-white/60">Network identity, the vault settlement token, current block, and smoke transaction receipt are read from Arc RPC for this page request.</p>
            <p className="mt-4 font-mono text-[10px] text-white/45">{live.available ? `Current block ${live.blockNumber.toLocaleString()} · RPC checked ${new Date(live.checkedAt).toLocaleString()}` : `Live data unavailable · checked ${new Date(live.checkedAt).toLocaleString()}`}</p>
          </div>
          <div className="grid gap-3 self-center">
            <a className="group rounded-xl border border-white/15 p-5 transition hover:border-[#c8f169]/60" href={`${primary.blockExplorer}/address/${live.vaultAddress}`} target="_blank" rel="noreferrer"><div className="font-mono text-[9px] uppercase tracking-[.18em] text-white/45">Configured settlement vault ↗</div><div className="mt-2 break-all font-mono text-xs text-[#c8f169] sm:text-sm">{live.vaultAddress}</div></a>
            <a className="group rounded-xl border border-white/15 p-5 transition hover:border-[#c8f169]/60" href={`${primary.blockExplorer}/tx/${primary.verifiedSettlementTx}`} target="_blank" rel="noreferrer"><div className="font-mono text-[9px] uppercase tracking-[.18em] text-white/45">Smoke settlement transaction ↗</div><div className="mt-2 break-all font-mono text-xs text-[#c8f169] sm:text-sm">{primary.verifiedSettlementTx}</div><div className="mt-2 font-mono text-[9px] uppercase text-white/50">Current receipt: {live.available ? live.proofStatus : 'RPC unavailable'}</div></a>
            <div className="flex flex-wrap gap-2 pt-2 font-mono text-[9px] uppercase tracking-wider text-white/50"><span className="rounded-full border border-white/15 px-3 py-2">USDC settlement</span><span className="rounded-full border border-white/15 px-3 py-2">EIP-712 vouchers</span><span className="rounded-full border border-white/15 px-3 py-2">x402 middleware</span></div>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 font-mono text-[10px] text-[#182722]/55 sm:flex-row sm:items-center sm:justify-between sm:px-8"><span>PAYTHOS · BUILDING WITH GUARDRAILS</span><span>Arc Testnet prototype · Not audited · Not for production funds</span><a href="https://github.com/Web3Manuel001/paythos" target="_blank" rel="noreferrer">GitHub ↗</a></footer>
    </main>
  );
}
