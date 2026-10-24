# Paythos SDK (prototype)

This package contains TypeScript utilities for EIP-712 payment vouchers, an Arc Testnet vault client, and x402-style merchant middleware. The current contract/deployment proof is on Arc Testnet (`5042002`). The package is not audited and is not ready for production funds.

## Framework integrations

- **MCP:** `paythos-sdk/mcp` provides read-only session and settled-total tools. The stdio entry point requires `PAYTHOS_VAULT_ADDRESS` and `PAYTHOS_AGENT_ADDRESS`; it does not accept a signing key or initiate payments. Example:

  ```sh
  PAYTHOS_VAULT_ADDRESS=0x... PAYTHOS_AGENT_ADDRESS=0x... npm run mcp-server
  ```

- **LangChain:** `createLangChainTools` dynamically loads the consuming app's `langchain` package and returns a native read-only session tool. Install `langchain` in that app and pass an Arc `PaythosVaultClient` plus the agent address.
- **ElizaOS:** `createAgentPayElizaPlugin` returns a read-only session provider and no actions. Its shape follows the current `@elizaos/core` plugin/provider contract; validate it against the exact ElizaOS version used by your agent before deployment.
- **MPC custody:** this repository has no multi-party-computation wallet or key-sharing implementation. `AgentVoucherSigner` uses a single EVM private key and a local file ledger.

None of these framework adapters can execute user-approved swaps. Swap quotes, transaction review, wallet signing, and a wallet-connect UI have not been implemented. `createX402Paywall` requires `vaultAddress` and verifies the transaction's Arc chain, vault event, token, recipient, payer, and amount.

## Build

```sh
npm install
npm run build
```

The build emits JavaScript and declaration files to `dist/`. There is no dedicated SDK test suite yet. The scripts under the repository's `sdk/` directory are demos, several of which depend on old local contract deployments.

## Important operational limits

- `AgentVoucherSigner` stores state in a local JSON ledger and uses an in-process lock. Run one signer process per storage directory; separate processes can race.
- `VoucherAccumulator` keeps pending voucher and retry state in memory. A process restart loses that state.
- The voucher paywall reads session state and vault token balance from the configured RPC on each accepted request. RPC errors fail closed; configure an appropriately reliable RPC endpoint.
- The legacy x402 middleware has a process-local replay guard. Do not run it across multiple workers or treat it as production-ready until replay state is durable and shared.
- The current vault uses an agent-wide session budget. Merchant-specific and task-specific budget enforcement is not implemented on-chain.
- No swap execution adapter or wallet approval UI is included. See the root [product direction](../docs/PRODUCT_DIRECTION.md) for the staged user-approved swap plan.

See the root [README](../README.md) for repository status and deployment evidence.
