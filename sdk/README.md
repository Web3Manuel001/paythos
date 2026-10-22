# Paythos Protocol 🛡️🤖

> **Autonomous Agent Spend Governance & Cryptographic Authorization Layer for Arc L1 and Circle USDC.**

[![Network: Arc L1](https://img.shields.io/badge/Network-Arc_Layer--1-blue.svg)](https://arc.network)
[![Settlement: Circle USDC](https://img.shields.io/badge/Asset-Native_USDC_0x3600...0000-emerald.svg)](https://docs.arc.io/arc/references/contract-addresses)
[![Standard: x402 v2.1](https://img.shields.io/badge/Standard-x402_v2.1-purple.svg)](https://x402.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-zinc.svg)](LICENSE)

---

## ⚡ What is Paythos?

Paythos is an **enterprise spend-governance and policy layer** designed for autonomous software. It provides non-custodial session management, deterministic daily caps, and instant prompt-injection killswitches on top of x402 micropayment channels.

### Current Features (Live in Repository)
* **Cryptographic Session Scoping:** Ephemeral agent keys authorized on-chain with strict daily spend caps and TTL expiries.
* **Instant Prompt-Injection Killswitch:** Immediate on-chain session revocation with zero settlement delay.
* **Monotonic Nonce Enforcement:** On-chain sequencing preventing replay attacks or stale-state claims.
* **Dual-Trigger Sweep Accumulator:** In-memory accumulators flush vouchers to Arc L1 when debt reaches $5.00 OR when voucher age reaches 20 minutes (with background `.unref()` timer sweep and exponential backoff alerts).
* **Solvency-Enforcing Paywall:** Validates that total cumulative unsettled debt does not exceed the agent's remaining daily cap, and checks on-chain vault USDC balance before serving API data.

### Planned Integrations [Roadmap]
* **Circle Programmable Wallets:** Developer-controlled wallet API for enterprise agent key management.
* **Circle Nanopayments & Gateway:** Gas-free batched x402 settlement facilitation.
* **Circle CCTP:** Cross-chain burn-and-mint liquidity routing between Arc L1 and Base.

---

## 📜 Verified On-Chain Deployments & Proofs

| Component | Network | Address / Hash | Explorer Proof |
| :--- | :--- | :--- | :--- |
| **Hardened Vault Core** | Arc Testnet (`5042002`) | `0xa9d5525BE440831c64695d30c915DF303E0151EF` | [ArcScan Contract](https://testnet.arcscan.app/address/0xa9d5525BE440831c64695d30c915DF303E0151EF) |
| **Verified Smoke Settlement** | Arc Testnet (Block #68409300) | `0xf7113e7d05dad2ae241439afd16c3dc8f093cbe415cf9c99b87134014bad193d` | [ArcScan Settlement Proof](https://testnet.arcscan.app/tx/0xf7113e7d05dad2ae241439afd16c3dc8f093cbe415cf9c99b87134014bad193d) |
| **Telemetry & Disclosure** | Self-Funded Smoke Test | 157,959 gas (~$0.004 on testnet) | Verified in Tx Receipt ($0.01 initial test) |
| **Settlement Asset** | Arc Native USDC | `0x3600000000000000000000000000000000000000` | [Arc Official Registry](https://docs.arc.io/arc/references/contract-addresses) |
| **Protocol Take Rate** | On-Chain Enforced | 150 bps (1.50%) | Verified in Deployed Bytecode |
| **Base Liquidity Spoke** | Base Sepolia (`84532`) | `0x6E0837c166c01710dC86f2E25DAE2fFD574343D9` | [Basescan Explorer](https://sepolia.basescan.org/address/0x6E0837c166c01710dC86f2E25DAE2fFD574343D9) |

---

## 🚀 Quickstart

### 1. Autonomous Agent Signer
```typescript
import { AgentVoucherSigner } from './sdk/src/signer/voucherSigner';

const signer = new AgentVoucherSigner(process.env.AGENT_SESSION_KEY, '0xa9d5525BE440831c64695d30c915DF303E0151EF', 5042002);
const payment = await signer.signCumulativePayment(
  merchantAddress, 
  '0x3600000000000000000000000000000000000000', 
  2000n
);

await fetch('https://api.provider.com/data', {
  headers: { 'X-Paythos-Voucher': payment.headerPayload }
});
2. Merchant x402 Middleware (with On-Chain Solvency Check)
code
TypeScript
import { createX402Paywall, VoucherAccumulator } from './sdk/src/middleware/paywall';
import { PaythosVaultClient } from './sdk/src/client/vaultClient';

const vaultClient = new PaythosVaultClient(
  '0xa9d5525BE440831c64695d30c915DF303E0151EF',
  'https://rpc.testnet.arc.io',
  merchantWallet
);

app.use('/api/data', createX402Paywall({
  merchantAddress: '0xYourMerchant',
  vaultAddress: '0xa9d5525BE440831c64695d30c915DF303E0151EF',
  tokenAddress: '0x3600000000000000000000000000000000000000',
  chainId: 5042002,
  pricePerCall: 2000n,
  vaultClient, // Required for on-chain cap & solvency verification
  accumulator: new VoucherAccumulator(vaultClient, 5_000_000n, 1200) // Flush at $5 OR 20 mins
}));
🧪 Security & Verification
Foundry Test Suite: 10 passing unit and property-based fuzz tests under via_ir on Solc 0.8.24.
Checks-Effects-Interactions (CEI): Reentrancy protection and strict state-before-transfer ordering.
Non-Custodial Multi-Step Timelocks: 6-hour delay on owner collateral withdrawals to protect merchant settlement guarantees.
