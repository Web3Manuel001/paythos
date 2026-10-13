# Paythos Protocol 🛡️🤖

> **The Non-Custodial Monetary Operating System & EIP-712 Micro-Settlement Protocol for Autonomous AI Agents on Base L2.**

[![Network: Base](https://img.shields.io/badge/Network-Base_L2-blue.svg)](https://base.org)
[![Standard: x402 v2](https://img.shields.io/badge/Standard-x402_v2-emerald.svg)](https://x402.org)
[![Contracts: Base Sepolia](https://img.shields.io/badge/Contracts-Verified_on_Basescan-black.svg)](https://sepolia.basescan.org/address/0x6E0837c166c01710dC86f2E25DAE2fFD574343D9)
[![License: MIT](https://img.shields.io/badge/License-MIT-zinc.svg)](LICENSE)

---

## 📜 Verified Deployments

| Contract | Address | Network | Explorer |
| :--- | :--- | :--- | :--- |
| **PaythosVault Core** | `0x6E0837c166c01710dC86f2E25DAE2fFD574343D9` | Base Sepolia (`84532`) | [View on Basescan](https://sepolia.basescan.org/address/0x6E0837c166c01710dC86f2E25DAE2fFD574343D9) |
| **Protocol Fee** | `1.50%` (150 bps) | Base L2 | Settled on-chain |

---

## ⚡ Why Paythos?

1. **The Meatspace Identity Wall:** Autonomous software cannot open bank accounts or pass Stripe KYC.
2. **The Micropayment Fee Crisis:** Traditional payment rails charge $0.30 fixed fees. For a $0.002 API query, fees exceed 15,000%.
3. **The Prompt Injection Threat:** Giving an autonomous LLM a master crypto private key risks 100% treasury loss. Paythos enforces cryptographic session policies, daily limits, and TTL expiries on-chain.
4. **The Gas Paradox:** Vanilla crypto transactions cost $0.01+ per call. Paythos off-chain EIP-712 cumulative vouchers reduce on-chain gas overhead by **98%**.

---

## 📂 Repository Architecture

```text
paythos/
├── contracts/        # Foundry L2 Smart Contracts (PaythosVault.sol)
├── sdk/              # Core TypeScript engine (Viem, EIP-712 signer, x402 paywall)
│   ├── src/signer/   # Sub-millisecond off-chain voucher signer
│   ├── src/client/   # Vault management & on-chain settlement
│   └── src/middleware/# Token-bucket rate limiter & voucher accumulator
└── web/              # Next.js 15 Enterprise Portal & Gofer Errand Desk
🚀 Quickstart
1. Autonomous x402 Agent Signer
code
TypeScript
import { AgentVoucherSigner } from './sdk/src/signer/voucherSigner';

const signer = new AgentVoucherSigner(process.env.AGENT_SESSION_KEY, VAULT_ADDRESS, 84532);
const payment = await signer.signCumulativePayment(merchantAddress, usdcAddress, 2000n);

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
  tokenAddress: '0xUSDC',
  pricePerCall: 2000n,
  accumulator: new VoucherAccumulator(vaultClient, 5_000_000n) // Auto-flush at $5.00
}));
