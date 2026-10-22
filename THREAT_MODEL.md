# Paythos Protocol: Threat Model & Security Specification 🛡️

## 1. Executive Security Thesis
Paythos does not claim to prevent semantic prompt injection inside neural networks. 
**Paythos enforces deterministic financial blast-radius containment.** When an autonomous agent is manipulated, compromised, or enters an execution loop, Paythos cryptographically constrains what financial damage can occur.

---

## 2. Adversarial Personas & Mitigations

### A. The Compromised Agent (Prompt Injection / Hallucination)
* **Threat:** Malicious prompt manipulates the agent into attempting to drain treasury funds or spam unauthorized payments.
* **Mitigation:**
  * **Ephemeral Keys:** Agents never hold vault master keys; they hold scoped session keys.
  * **On-Chain Caps:** Smart contracts strictly enforce `spentToday + payoutDelta <= dailyLimit`.
  * **TTL Hard Cutoff:** Sessions expire deterministically at `expiresAt`.
  * **Instant Killswitch:** Admin calls `revokeSession(agentKey)`, instantly blocking further settlements.

### B. The Malicious Merchant (Replay & Extraction)
* **Threat:** Merchant attempts to replay old vouchers, submit out-of-order claims, or claim more funds than authorized.
* **Mitigation:**
  * **Monotonic Deltas:** Vault only pays `voucher.cumulativeAmount - settledAmount`.
  * **Monotonic Nonces:** Contract asserts `voucher.nonce > lastNonce[channelKey]`. Replaying identical or lower nonces reverts on-chain.
  * **Token Pinning:** Contract strictly binds `settlementToken` to Arc Native USDC (`0x3600...0000`).

### C. The Rogue Vault Owner (Merchant Rug Pull)
* **Threat:** Vault owner lets an agent consume $100 of compute from a merchant, then attempts to drain all USDC before the merchant can settle.
* **Mitigation:**
  * **6-Hour Anti-Rug Timelock:** `queueWithdrawal()` enforces a mandatory 6-hour delay, guaranteeing merchants a protected window to submit all in-flight vouchers.

### D. The Insolvent Payer (Deferred Settlement Failure)
* **Threat:** Agent issues vouchers against a depleted vault balance.
* **Mitigation:**
  * **Preflight Solvency Checks:** Paywall middleware checks `balanceOf(vaultAddress)` directly on-chain before serving compute. If collateral is insufficient, it rejects with `HTTP 503 Vault Insolvent`.

---

## 3. Core Invariants (Formally Verified in Foundry)

1. **Conservation of Balance:** `treasuryFee + merchantPayout == payoutDelta`. Zero token leakage.
2. **Monotonicity:** $\forall t_2 > t_1$, $\text{cumulativeAmount}(t_2) > \text{cumulativeAmount}(t_1)$.
3. **Sequential Nonce Integrity:** $\forall n_2$, $n_2 > n_1$.
4. **Instant Revocation:** If `sessions[agentKey].isActive == false`, all subsequent `settleVoucher` claims revert immediately.
