# Paythos Protocol 🛡️🤖

> **Non-Custodial Spend Policy Engine & Cryptographic Authorization Layer for Autonomous Agents on Arc L1 and Circle USDC.**

[![Network: Arc L1](https://img.shields.io/badge/Network-Arc_Layer--1-blue.svg)](https://arc.network)
[![Settlement: Circle USDC](https://img.shields.io/badge/Asset-Native_USDC-emerald.svg)](https://circle.com/usdc)
[![Standard: x402 v2.1](https://img.shields.io/badge/Standard-x402_v2.1-purple.svg)](https://x402.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-zinc.svg)](LICENSE)

---

## ⚡ The Core Problem

1. **The Meatspace Identity Wall:** Autonomous software agents cannot open bank accounts, hold credit cards, or pass KYC.
2. **The Prompt Injection Threat:** Giving an autonomous LLM unconstrained access to a treasury private key creates catastrophic financial exposure.
3. **The Micro-Billing Dilemma:** TradFi payment rails impose $0.30 fixed fees (a 15,000% fee penalty on a $0.002 API query), while vanilla on-chain transactions incur gas overhead on every call.

---

## 🛡️ The Paythos Architecture

Paythos is an **enterprise policy and spend-governance layer** designed to sit directly on top of Circle's infrastructure (Arc L1, Circle Programmable Wallets, and Circle Nanopayments):

* **Cryptographic Session Scoping:** Authorize ephemeral agent session keys with strict on-chain daily spend limits and TTL expiries.
* **Instant Prompt-Injection Killswitch:** Administrative revocation terminates rogue agents immediately on-chain with zero settlement delay.
* **Proof-of-Authorization (PoA) Envelopes:** Every micro-payment binds the human intent hash and safety score into the voucher payload.
* **Arc Structured Transaction Memos:** Batch settlements stamp Merkleized audit hashes directly into Arc transaction memos for institutional compliance.
* **Monotonic Nonce Sequencing:** On-chain enforcement preventing voucher replay or stale-state extraction.

---

## 📜 Verified Deployments

| Component | Network | Address / Reference | Explorer |
| :--- | :--- | :--- | :--- |
| **PaythosVault Core** | Arc Testnet (`5042002`) | `0xFb57ceAEF685B73Dc0270f806545e195393Cc277` | [ArcScan](https://testnet.arcscan.app/address/0xFb57ceAEF685B73Dc0270f806545e195393Cc277) |
| **Settlement Asset** | Arc Native USDC | `0x3600000000000000000000000000000000000000` | [Arc Docs](https://docs.arc.io/arc/references/contract-addresses) |
| **Base Liquidity Spoke** | Base Sepolia (`84532`) | `0x6E0837c166c01710dC86f2E25DAE2fFD574343D9` | [Basescan](https://sepolia.basescan.org/address/0x6E0837c166c01710dC86f2E25DAE2fFD574343D9) |

---

## 🚀 Quickstart

### 1. Autonomous Agent Signer
```typescript
import { AgentVoucherSigner } from './sdk/src/signer/voucherSigner';

const signer = new AgentVoucherSigner(process.env.AGENT_SESSION_KEY, VAULT_ADDRESS, 5042002);
const payment = await signer.signCumulativePayment(merchantAddress, ARC_USDC, 2000n);

await fetch('https://api.provider.com/data', {
  headers: { 'X-Paythos-Voucher': payment.headerPayload }
});
2. Merchant x402 Middleware
code
TypeScript
import { createX402Paywall, VoucherAccumulator } from './sdk/src/middleware/paywall';

app.use('/api/data', createX402Paywall({
  merchantAddress: '0xYourMerchant',
  vaultAddress: '0xPaythosVault',
  tokenAddress: '0x3600000000000000000000000000000000000000',
  pricePerCall: 2000n,
  accumulator: new VoucherAccumulator(vaultClient, 5_000_000n, 1200) // Flush at $5 OR 20 mins
}));
🧪 Security & Verification
Foundry Property Fuzzing: 10/10 passing invariant test suites (256 runs per test) under via_ir on Solc 0.8.24.
Checks-Effects-Interactions (CEI): Reentrancy protection and strict state-before-transfer ordering.
Non-Custodial Multi-Step Timelocks: 6-hour delay on owner collateral withdrawals to protect merchant settlement guarantees.
