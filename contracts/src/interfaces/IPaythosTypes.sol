// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPaythosTypes {
    struct SessionPolicy {
        uint256 dailyLimit;
        uint256 spentToday;
        uint256 lastResetTimestamp;
        uint256 expiresAt;
        uint256 revokedAt;
        bool isActive;
    }

    struct PaymentVoucher {
        address token;
        address merchant;
        address agentKey;
        uint256 sessionId;
        uint256 cumulativeAmount;
        uint256 expiresAt;
        uint256 nonce;
    }

    struct WithdrawalRequest {
        uint256 amount;
        uint256 unlockTimestamp;
    }

    event SessionCreated(address indexed agentKey, uint256 dailyLimit, uint256 expiresAt);
    event SessionRevoked(address indexed agentKey, uint256 gracePeriodEnd);
    event VoucherSettled(
        bytes32 indexed channelKey,
        address indexed merchant,
        address indexed agentKey,
        address token,
        uint256 payout,
        uint256 fee
    );
    event DirectPaymentExecuted(
        address indexed agentKey,
        address indexed token,
        address indexed recipient,
        uint256 amount,
        uint256 fee
    );
    event WithdrawalQueued(address indexed token, uint256 amount, uint256 unlockTimestamp);
    event WithdrawalExecuted(address indexed token, address indexed to, uint256 amount);
    event WithdrawalCancelled(address indexed token);
    event FeeConfigUpdated(address indexed newTreasury, uint256 newFeeBps);
}
