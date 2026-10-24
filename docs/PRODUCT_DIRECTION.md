# Paythos product direction

## Product thesis

Paythos should be the spend-control and audit layer that lets a person or business authorize software to spend within specific limits. It should not try to become a general-purpose wallet, an agent marketplace, and a payment network at the same time.

Agent wallets, spending policies, service caps, allowlists, swaps, and cross-chain actions are now offered by Circle's Agent Stack. Paythos cannot differentiate by claiming that agents need a wallet or basic spend controls. Its potential distinction is portable task/session policy, independent enforcement across wallet and contract rails, policy explainability, approvals, and a finance-ready audit trail. Those advantages need to be proven with working product and customer interviews.

The first useful product is a developer-controlled agent account with task-scoped permissions, an activity log, and a reliable pause/revoke control. Integrate wallet infrastructure and payment rails where they improve reach; focus engineering on policy composition and auditability.

## Near-term sequence

1. **Make the current payment path trustworthy.** Align chain configuration and docs; persist pending voucher state; add cross-process-safe signer coordination; make merchant and session policy explicit; cover authorization, failure, retry, and restart behavior with SDK tests.
2. **Ship one narrow developer workflow.** Create an agent identity, set a budget and allowlist, fund a test wallet, make a permitted API payment, inspect the activity, and revoke access.
3. **Add a small number of useful services.** Start with paid APIs or compute using a predictable quote and a verifiable receipt.
4. **Add team controls.** Multiple agents, role-based access, approvals, audit export, and alerts should follow evidence from developers using the single-agent workflow.
5. **Monetize governance software.** Validate subscription willingness to pay before depending on payment volume or protocol fees.

## Swaps and trading: staged scope

The initial trading feature should be **user-approved token swaps on Arc**, not autonomous strategy execution. The repo has a staged-swap example, but that only constructs a proposed router call. It does not provide a vetted router registry, complete quote validation, wallet confirmation flow, execution monitoring, or production risk controls.

The initial swap experience should:

- Show the exact input token and amount, output token, minimum output, quoted price impact, route, fees, and expiry before approval.
- Require the user to approve each swap. Agents may request and explain a swap, but cannot submit it without the user's explicit confirmation.
- Enforce a chain-specific allowlist of tokens and router contracts, plus per-swap and daily limits.
- Reject expired quotes, unknown routers, unsupported tokens, and quotes outside the user's slippage and price-impact limits.
- Use exact-amount approvals where possible, avoid unlimited token approvals, and expose revocation of existing allowances.
- Record the quote, policy decision, user approval, transaction hash, and final received amount for the audit trail.
- Handle reverted, replaced, pending, and partially filled transactions explicitly; never report success based only on transaction submission.

Only after the approval flow, execution monitoring, and recovery paths have been reviewed should Paythos consider opt-in autonomous swaps. Those would need narrowly scoped strategies, explicit asset and venue allowlists, hard loss and exposure limits, a kill switch, and human approval above configured thresholds. Leveraged trading, lending, and unrestricted DeFi calls are outside the MVP.

## Architecture rule

Keep policy enforcement separate from quote discovery and transaction execution. A quote provider is untrusted input. Paythos must independently validate the chain, token addresses, router, calldata target, allowance, limits, quote expiry, and minimum output before asking the user to sign. Backend-only controls should be labeled as such; they are not equivalent to contract-enforced restrictions.

## Decisions for the first release

- **Chain:** Arc first, because the current vault and settlement proof are on Arc Testnet. The Base references should remain labeled as experimental until deployment, configuration, and tests agree.
- **Swap mode:** user-approved only.
- **Custody:** do not promise that the current contract provides a complete wallet product. Decide whether the first user wallet is self-custodied, smart-contract-controlled, or provided through a wallet infrastructure partner before implementing funding and swap execution.
- **Release bar:** no mainnet or real-user-fund claim until the contract and transaction path receive independent review and the operational controls are demonstrated.

## Provider fit to verify

Circle's current Agent Stack describes Agent Wallet policies with global limits, per-service caps, chain/contract allowlists, and time-bounded sessions. Its official material also lists trading/swapping among supported agent actions. That means the near-term question is whether Paythos adds portable, independently verifiable controls on top of those capabilities, rather than rebuilding a wallet dashboard. Circle's support material states custom policies are currently available on mainnet and require OTP-confirmed policy updates; verify the exact chain and feature matrix before selecting a production integration. Arc mainnet launched in September 2026, while the repo's deployment proof remains Arc Testnet, so testnet evidence must not be presented as mainnet readiness.

- [Circle Agent Stack](https://www.circle.com/agent-stack)
- [Circle Agent Stack overview and current wallet-policy notes](https://help.circle.com/support/en/circle-agent-stack-overview?id=kb_article_view&sysparm_article=KB0011122)
- [Circle developer-controlled EVM transaction signing](https://developers.circle.com/wallets/sign-tx-evm)
- [Circle's Arc mainnet launch announcement](https://investor.circle.com/news/news-details/2026/Circle-Launches-Arc-Mainnet-an-Economic-Operating-System-for-the-Internet/)
