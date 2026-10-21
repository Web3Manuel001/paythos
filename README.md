# Paythos Protocol 🛡️🤖

> **Autonomous Agent Spend Governance & Cryptographic Authorization Layer for Arc L1 and Circle USDC.**

[![Network: Arc L1](https://img.shields.io/badge/Network-Arc_Layer--1-blue.svg)](https://arc.network)
[![Settlement: Circle USDC](https://img.shields.io/badge/Asset-Native_USDC_0x3600...0000-emerald.svg)](https://docs.arc.io/arc/references/contract-addresses)
[![Standard: x402 v2.1](https://img.shields.io/badge/Standard-x402_v2.1-purple.svg)](https://x402.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-zinc.svg)](LICENSE)

---

## ⚡ What is Paythos?

Paythos is an **enterprise policy and spend-governance layer** designed to sit directly on top of Circle's infrastructure (Arc L1, Circle Programmable Wallets, and Circle Nanopayments):

* **Cryptographic Session Scoping:** Authorize ephemeral agent session keys with strict on-chain daily spend limits and TTL expiries.
* **Instant Prompt-Injection Killswitch:** Administrative revocation terminates rogue agents immediately on-chain with zero settlement delay.
* **Monotonic Nonce Sequencing:** On-chain enforcement preventing voucher replay or stale-state extraction.
* **Dual-Trigger Auto-Flushing:** In-memory accumulators flush vouchers to Arc L1 when claims reach $5.00 OR when voucher age reaches 20 minutes (with background `.unref()` timer sweep preventing 1-hour expiry loss).
* **Arc Structured Transaction Memos:** Batch settlements stamp Merkleized audit hashes directly into Arc transaction memos for institutional compliance.

---

## 📜 Verified On-Chain Deployments & Proofs

| Component | Network | Address / Hash | Explorer Proof |
| :--- | :--- | :--- | :--- |
| **Hardened Vault Core** | Arc Testnet (`5042002`) | `0xa9d5525BE440831c64695d30c915DF303E0151EF` | [ArcScan Contract](https://testnet.arcscan.app/address/0xa9d5525BE440831c64695d30c915DF303E0151EF) |
| **Verified Settlement Tx** | Arc Testnet (Block #68409300) | `0xf7113e7d05dad2ae241439afd16c3dc8f093cbe415cf9c99b87134014bad193d` | [ArcScan Settlement Proof](https://testnet.arcscan.app/tx/0xf7113e7d05dad2ae241439afd16c3dc8f093cbe415cf9c99b87134014bad193d) |
| **Arc Structured Memo** | Hex Digest | `0xbf166072535e6c278f4c7792e4c38c76ef01cdd0bb24e9f0d856168ca83be5a5` | Stamped On-Chain |
| **Settlement Asset** | Arc Native USDC | `0x3600000000000000000000000000000000000000` | [Arc Official Registry](https://docs.arc.io/arc/references/contract-addresses) |
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
2. Merchant x402 Middleware (Dual-Trigger with Timer Flush)
code
TypeScript
import { createX402Paywall, VoucherAccumulator } from './sdk/src/middleware/paywall';
import { PaythosVaultClient } from './sdk/src/client/vaultClient';

const vaultClient = new PaythosVaultClient('0xa9d5525BE440831c64695d30c915DF303E0151EF', 'https://rpc.testnet.arc.io', merchantWallet);

app.use('/api/data', createX402Paywall({
  merchantAddress: '0xYourMerchant',
  vaultAddress: '0xa9d5525BE440831c64695d30c915DF303E0151EF',
  tokenAddress: '0x3600000000000000000000000000000000000000',
  chainId: 5042002,
  pricePerCall: 2000n,
  accumulator: new VoucherAccumulator(vaultClient, 5_000_000n, 1200) // Flush at $5 OR 20 mins
}));
🧪 Security & Verification
Foundry Property Tests: 10 passing unit and property-based fuzz tests under via_ir on Solc 0.8.24.
Checks-Effects-Interactions (CEI): Reentrancy protection and strict state-before-transfer ordering.
Non-Custodial Multi-Step Timelocks: 6-hour delay on owner collateral withdrawals to protect merchant settlement guarantees.
