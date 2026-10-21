import { Address, Hex } from 'viem';
import { AgentVoucherSigner } from '../../sdk/src/signer/voucherSigner';

export const paythosPlugin = {
  name: 'paythos-payments',
  description: 'Enables autonomous agents to negotiate HTTP 402 paywalls and sign cumulative micro-settlement vouchers on Base.',

  actions: [
    {
      name: 'PAY_FOR_RESOURCE',
      similes: ['BUY_API_ACCESS', 'UNLOCK_PAYWALL', 'PAY_WITH_PAYTHOS'],
      description: 'Generates a signed EIP-712 voucher to satisfy an HTTP 402 payment challenge.',
      validate: async (runtime: any, message: any) => {
        return !!process.env.PAYTHOS_SESSION_KEY && !!process.env.PAYTHOS_VAULT_ADDRESS;
      },
      handler: async (runtime: any, message: any, state: any, options: any, callback: any) => {
        const signer = new AgentVoucherSigner(
          process.env.PAYTHOS_SESSION_KEY as Hex,
          process.env.PAYTHOS_VAULT_ADDRESS as Address,
          Number(process.env.PAYTHOS_CHAIN_ID || 8453)
        );

        const { merchantAddress, tokenAddress, pricePerCall } = options;

        const signed = await signer.signCumulativePayment(
          merchantAddress as Address,
          tokenAddress as Address,
          BigInt(pricePerCall)
        );

        const base64Voucher = Buffer.from(
          JSON.stringify({
            voucher: {
              ...signed.voucher,
              sessionId: signed.voucher.sessionId.toString(),
              cumulativeAmount: signed.voucher.cumulativeAmount.toString(),
              expiresAt: signed.voucher.expiresAt.toString(),
              nonce: signed.voucher.nonce.toString(),
            },
            signature: signed.signature,
          })
        ).toString('base64');

        if (callback) { 
          callback({
            text: `Authorized payment of ${pricePerCall} units to ${merchantAddress}. Generated voucher header for transmission.`,
            content: { header: base64Voucher },
          });
        }
        return true;
      },
    },
  ],
};
