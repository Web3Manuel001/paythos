# Paythos

Paythos is an early-stage spend-control layer for software agents. It combines an EVM vault, scoped agent keys, signed payment vouchers, and merchant middleware. The first supported deployment target in this repository is **Arc Testnet**. This is a prototype: it is not audited and is not ready for production funds.

## What is implemented

- An EIP-712 voucher flow and cumulative settlement contract in `contracts/src/core/PaythosVault.sol`.
- An SDK signer, paywall middleware, and in-memory voucher accumulator in `sdk/src`.
- A Gofer policy and authorization prototype in `gofer/src`.
- An Arc Testnet deployment and settlement proof listed below.
- Read-only MCP, LangChain, and ElizaOS session-status adapters. They do not authorize spending or swaps.

The accumulator is process-local and loses pending voucher state on restart. The file-backed signer store is intended for a single process; its mutex does not coordinate multiple processes. The paywall checks the on-chain session for each authorized request, so revocation can take effect without waiting for an authorization-cache timeout.

## Current deployment evidence

These are testnet artifacts, not a mainnet launch or a security audit.

| Component | Network | Address / hash |
| --- | --- | --- |
| Vault | Arc Testnet (`5042002`) | [`0xa9d5525BE440831c64695d30c915DF303E0151EF`](https://testnet.arcscan.app/address/0xa9d5525BE440831c64695d30c915DF303E0151EF) |
| Smoke settlement | Arc Testnet | [`0xf7113e7d05dad2ae241439afd16c3dc8f093cbe415cf9c99b87134014bad193d`](https://testnet.arcscan.app/tx/0xf7113e7d05dad2ae241439afd16c3dc8f093cbe415cf9c99b87134014bad193d) |
| Settlement token | Arc Testnet Native USDC | `0x3600000000000000000000000000000000000000` |

There is also a Base Sepolia address in the repository, but the code and deployment configuration are not yet consistent enough to present it as a supported production spoke. See [product direction](docs/PRODUCT_DIRECTION.md).

## Wallet and framework direction

The initial swap flow should use a user-connected wallet and require the user to review and approve every transaction. Circle Agent Wallets remain a possible later option for agent-owned payment sessions; they are not wired into this repository. LangChain and ElizaOS adapters currently expose read-only session context, while MCP provides read-only status tools. There is no MPC custody implementation. See [SDK integration notes](sdk/README.md).

## Repository layout

- `contracts/` — Solidity contracts, scripts, and Foundry tests.
- `sdk/` — TypeScript signer, client, paywall, storage, and integrations.
- `gofer/` — agent runtime and policy prototypes.
- `web/app/` — current Arc-oriented dashboard/landing experience.
- `web/src/app/` — an older, conflicting Base-oriented page that needs consolidation.
- `docs/PRODUCT_DIRECTION.md` — narrow MVP plan and staged swap design.

## Development

Requirements: Node.js, npm, and Foundry.

```sh
npm install
npm --prefix sdk install
npm --prefix web install
```

Useful commands from the repository root:

```sh
npm run build          # Build the web app
npm run test:contracts # Run Foundry contract tests
npm --prefix sdk run build
```

The SDK currently has no dedicated automated test suite. Several old scripts under `sdk/` are manual demos and depend on obsolete local deployments; do not treat them as security validation.

## Security status

The contract has unit and fuzz tests, but those do not replace an independent audit. The current system still needs durable accumulator state, multi-process-safe signer coordination, explicit per-merchant policy enforcement, and a reviewed swap execution design before it should handle real funds. See [the threat model](THREAT_MODEL.md) and [product direction](docs/PRODUCT_DIRECTION.md).
