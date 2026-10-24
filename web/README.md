# Paythos web app

The landing page reads live Arc Testnet data on each request: RPC chain ID, latest block, the deployed vault's settlement token, and the receipt for the configured smoke transaction. If the RPC or contract read fails, it displays an unavailable state and the error instead of substituting sample values.

## Run locally

```sh
npm install
npm run dev
```

The default RPC and vault are configured in `config/paythos.ts`. Override them on the server with:

```sh
PAYTHOS_RPC_URL=https://your-arc-rpc.example
PAYTHOS_VAULT_ADDRESS=0x...
```

The configured RPC must report Arc Testnet chain ID `5042002`. The browser does not receive either server variable. Privy wallet UI stays disabled unless `NEXT_PUBLIC_PRIVY_APP_ID` is configured.

This page is a testnet prototype, not a trading interface. It does not show wallet balances, user activity, swap quotes, or execute trades.
