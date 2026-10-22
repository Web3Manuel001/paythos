# Paythos Protocol: Threat Model & Security Specification 🛡️

## 1. Executive Security Thesis
Paythos does not claim to prevent semantic prompt injection inside neural networks. 
**Paythos enforces deterministic financial blast-radius containment.** When an autonomous agent is manipulated, compromised, or enters an execution loop, Paythos cryptographically constrains what financial damage can occur.

---

## 2. Adversarial Personas & Mitigations

### A. The Compromised Agent (Prompt Injection / Execution Loops)
* **Threat:** Malicious prompt manipulates the agent into attempting to drain treasury funds or spam unauthorized payments.
* **Mitigation:**
  * **Ephemeral Keys:** Agents operate under restricted session keys, never master keys.
  * **On-Chain Daily Caps:** Smart contracts strictly enforce `spentToday + payoutDelta <= dailyLimit`.
  * **TTL Expiration:** Sessions expire deterministically at `expiresAt`.
  * **Instant Killswitch:** Owner calls `revokeSession(agentKey)`, immediately blocking further on-chain settlements.

### B. The Malicious Merchant (Replay & Extraction)
* **Threat:** Merchant attempts to replay old vouchers or submit out-of-order claims.
* **Mitigation:**
  * **Monotonic Nonces:** Contract asserts `voucher.nonce > lastNonce[channelKey]`. Replaying identical or lower nonces reverts on-chain.
  * **Monotonic Deltas:** Vault only pays `voucher.cumulativeAmount - settledAmount`.
  * **Token Pinning:** Contract strictly binds `settlementToken` to Arc Native USDC (`0x3600...0000`).

### C. The Rogue Vault Owner vs. Merchant Protection (Design Trade-Off)
* **Threat:** Vault owner attempts to withdraw collateral while merchants hold in-flight vouchers.
* **Mitigation:**
  * **6-Hour Anti-Rug Timelock:** `queueWithdrawal()` enforces a mandatory 6-hour delay, guaranteeing merchants a protected window to submit all in-flight vouchers.
  * **Trade-Off Note:** Calling `revokeSession()` immediately halts all settlement for that agent key (prioritizing prompt-injection containment). Merchants mitigate exposure by auto-flushing at $5 or every 20 minutes.

### D. The Insolvent Payer (Deferred Settlement Failure)
* **Threat:** Agent issues vouchers against a depleted vault balance.
* **Mitigation:**
  * **Preflight Solvency Checks:** Paywall middleware checks `balanceOf(vaultAddress)` directly on-chain before serving compute. If collateral is insufficient to cover total unsettled debt, it rejects with `HTTP 503 Vault Insolvent`.

---

## 3. Verified Invariants (Property and Fuzz Testing in Foundry)

1. **Conservation of Balance:** `treasuryFee + merchantPayout == payoutDelta`. Zero token leakage.
2. **Monotonicity:** Proposed cumulative amount must strictly exceed previously settled amount.
3. **Sequential Nonce Integrity:** Proposed nonce must strictly exceed `lastNonce[channelKey]`.
4. **Instant Revocation:** If `sessions[agentKey].isActive == false`, settlements for that agent revert immediately.
