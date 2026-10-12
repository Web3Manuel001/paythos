'use client';

import React from 'react';

interface BrandItem {
  name: string;
  label: string;
  fileName: string;
}

const BRANDS: BrandItem[] = [
  { name: 'Base L2', label: 'Settlement Hub', fileName: 'base.png' },
  { name: 'LangChain', label: 'Native Tools', fileName: 'langchain.svg' },
  { name: 'ElizaOS', label: 'ai16z Plugin', fileName: 'eliza.png' },
  { name: 'Claude', label: 'Universal MCP', fileName: 'claude.png' },
  { name: 'Cursor', label: 'Editor Skillpack', fileName: 'cursor.webp' },
  { name: 'x402 v2', label: 'IETF Standard', fileName: 'x402.png' },
  { name: 'Groq', label: 'LPU Engine', fileName: 'groq.webp' },
  { name: 'Viem', label: 'EVM Driver', fileName: 'viem.png' },
];

export default function LogoCloud() {
  return (
    <section className="w-full border-y border-white/[0.08] bg-[#02050E] py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-[11px] font-mono text-center text-blue-300/60 uppercase tracking-widest mb-8">
          Architected for Universal Interoperability Across Frontier Frameworks
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 items-center justify-center">
          {BRANDS.map((brand) => (
            <div
              key={brand.name}
              className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.01] hover:border-blue-500/40 hover:bg-blue-500/[0.04] transition-all flex flex-col items-center justify-center text-center group h-28"
            >
              {/* BRAND IMAGE WITH SMART FALLBACK */}
              <div className="h-8 w-auto flex items-center justify-center">
                <img
                  src={`/brands/${brand.fileName}`}
                  alt={brand.name}
                  className="max-h-7 max-w-[36px] object-contain filter grayscale group-hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100"
                  onError={(e) => {
                    // Graceful fallback if file is not downloaded yet
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              <span className="text-xs font-mono font-semibold text-zinc-300 group-hover:text-white transition mt-2">
                {brand.name}
              </span>
              <span className="text-[9px] font-mono text-blue-400/70 mt-0.5">
                {brand.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
