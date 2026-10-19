// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "../interfaces/IPaythosTypes.sol";

/**
 * @title PaythosVault (Hardened v2.1)
 * @notice Cryptographic clearinghouse and non-custodial session vault for autonomous agents.
 * Fixes: Instant revocation, monotonic nonces, token binding, and CEI event ordering.
 */
contract PaythosVault is IPaythosTypes, Ownable2Step, EIP712, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant MAX_FEE_BPS = 500; // 5.00% max cap
    uint256 public constant WITHDRAWAL_TIMELOCK = 6 hours;

    bytes32 public constant VOUCHER_TYPEHASH = keccak256(
        "PaymentVoucher(address token,address merchant,address agentKey,uint256 sessionId,uint256 cumulativeAmount,uint256 expiresAt,uint256 nonce)"
    );

    address public immutable settlementToken; // Pinned canonical settlement asset (USDC)
    address public treasury;
    uint256 public protocolFeeBps; // 150 = 1.50%

    mapping(address => SessionPolicy) public sessions;
    mapping(bytes32 => uint256) public settledAmount;
    mapping(bytes32 => uint256) public lastNonce; // Monotonic nonce protection
    mapping(address => WithdrawalRequest) public pendingWithdrawals;

    event ArcMemoStamped(bytes32 indexed channelKey, bytes32 indexed arcMemoHash, uint256 timestamp);

    error InvalidAddress();
    error ZeroAmount();
    error FeeTooHigh();
    error SessionNotActive();
    error SessionExpired();
    error DailyLimitExceeded(uint256 requested, uint256 remaining);
    error InvalidSignature();
    error VoucherExpired();
    error NonMonotonicVoucher(uint256 proposed, uint256 current);
    error InvalidNonce(uint256 proposed, uint256 current);
    error UnsupportedToken(address provided, address expected);
    error WithdrawalLocked(uint256 currentTimestamp, uint256 unlockTimestamp);
    error NoPendingWithdrawal();

    constructor(
        address _settlementToken,
        address _treasury,
        uint256 _initialFeeBps
    ) 
        Ownable(msg.sender) 
        EIP712("PaythosVault", "1") 
    {
        if (_settlementToken == address(0) || _treasury == address(0)) revert InvalidAddress();
        if (_initialFeeBps > MAX_FEE_BPS) revert FeeTooHigh();

        settlementToken = _settlementToken;
        treasury = _treasury;
        protocolFeeBps = _initialFeeBps;
    }

    function settleVoucherWithMemo(
        PaymentVoucher calldata voucher,
        bytes32 arcMemoHash,
        bytes calldata signature
    ) public nonReentrant {
        if (voucher.merchant == address(0) || voucher.agentKey == address(0)) revert InvalidAddress();
        if (voucher.token != settlementToken) revert UnsupportedToken(voucher.token, settlementToken);
        if (block.timestamp > voucher.expiresAt) revert VoucherExpired();

        // 1. Signature Verification
        _verifyVoucherSignature(voucher, signature);

        // 2. Instant Revocation Enforcement (No grace window for compromised keys)
        SessionPolicy storage policy = sessions[voucher.agentKey];
        if (!policy.isActive) revert SessionNotActive();
        if (block.timestamp > policy.expiresAt) revert SessionExpired();

        // 3. Monotonic Channel Accounting & Nonce Enforcement
        bytes32 channelKey = getChannelKey(voucher.agentKey, voucher.merchant, voucher.sessionId, voucher.token);
        
        if (voucher.nonce <= lastNonce[channelKey]) {
            revert InvalidNonce(voucher.nonce, lastNonce[channelKey]);
        }
        lastNonce[channelKey] = voucher.nonce;

        uint256 previouslySettled = settledAmount[channelKey];
        if (voucher.cumulativeAmount <= previouslySettled) {
            revert NonMonotonicVoucher(voucher.cumulativeAmount, previouslySettled);
        }

        uint256 payoutDelta = voucher.cumulativeAmount - previouslySettled;

        // 4. Daily Limit Window (Rolling 24h)
        if (block.timestamp >= policy.lastResetTimestamp + 1 days) {
            policy.spentToday = 0;
            policy.lastResetTimestamp = block.timestamp;
        }

        if (policy.spentToday + payoutDelta > policy.dailyLimit) {
            uint256 remaining = policy.dailyLimit > policy.spentToday ? policy.dailyLimit - policy.spentToday : 0;
            revert DailyLimitExceeded(payoutDelta, remaining);
        }

        // 5. State Updates (Checks-Effects)
        policy.spentToday += payoutDelta;
        settledAmount[channelKey] = voucher.cumulativeAmount;

        uint256 fee = (protocolFeeBps > 0 && treasury != address(0)) 
            ? (payoutDelta * protocolFeeBps) / BPS_DENOMINATOR 
            : 0;
        uint256 netMerchantPayout = payoutDelta - fee;

        emit VoucherSettled(channelKey, voucher.merchant, voucher.agentKey, voucher.token, netMerchantPayout, fee);

        if (arcMemoHash != bytes32(0)) {
            emit ArcMemoStamped(channelKey, arcMemoHash, block.timestamp);
        }

        // 6. External Interactions
        IERC20(voucher.token).safeTransfer(voucher.merchant, netMerchantPayout);
        if (fee > 0) {
            IERC20(voucher.token).safeTransfer(treasury, fee);
        }
    }

    function settleVoucher(PaymentVoucher calldata voucher, bytes calldata signature) external {
        settleVoucherWithMemo(voucher, bytes32(0), signature);
    }

    function _verifyVoucherSignature(PaymentVoucher calldata voucher, bytes calldata signature) internal view {
        bytes32 structHash = keccak256(
            abi.encode(
                VOUCHER_TYPEHASH,
                voucher.token,
                voucher.merchant,
                voucher.agentKey,
                voucher.sessionId,
                voucher.cumulativeAmount,
                voucher.expiresAt,
                voucher.nonce
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        address recoveredSigner = ECDSA.recover(digest, signature);
        if (recoveredSigner != voucher.agentKey) revert InvalidSignature();
    }

    function executePaymentWithMemo(
        address token,
        address recipient,
        uint256 amount,
        bytes32 arcMemoHash
    ) public nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (recipient == address(0)) revert InvalidAddress();
        if (token != settlementToken) revert UnsupportedToken(token, settlementToken);

        SessionPolicy storage policy = sessions[msg.sender];
        if (!policy.isActive) revert SessionNotActive();
        if (block.timestamp > policy.expiresAt) revert SessionExpired();

        if (block.timestamp >= policy.lastResetTimestamp + 1 days) {
            policy.spentToday = 0;
            policy.lastResetTimestamp = block.timestamp;
        }

        if (policy.spentToday + amount > policy.dailyLimit) {
            uint256 remaining = policy.dailyLimit > policy.spentToday ? policy.dailyLimit - policy.spentToday : 0;
            revert DailyLimitExceeded(amount, remaining);
        }

        policy.spentToday += amount;

        uint256 fee = (protocolFeeBps > 0 && treasury != address(0))
            ? (amount * protocolFeeBps) / BPS_DENOMINATOR
            : 0;
        uint256 netAmount = amount - fee;

        emit DirectPaymentExecuted(msg.sender, token, recipient, netAmount, fee);

        if (arcMemoHash != bytes32(0)) {
            bytes32 channelKey = keccak256(abi.encodePacked(msg.sender, recipient, token));
            emit ArcMemoStamped(channelKey, arcMemoHash, block.timestamp);
        }

        IERC20(token).safeTransfer(recipient, netAmount);
        if (fee > 0) {
            IERC20(token).safeTransfer(treasury, fee);
        }
    }

    function executePayment(address token, address recipient, uint256 amount) external {
        executePaymentWithMemo(token, recipient, amount, bytes32(0));
    }

    function createSession(
        address agentKey,
        uint256 dailyLimit,
        uint256 durationInSeconds
    ) external onlyOwner {
        if (agentKey == address(0)) revert InvalidAddress();
        if (dailyLimit == 0) revert ZeroAmount();

        sessions[agentKey] = SessionPolicy({
            dailyLimit: dailyLimit,
            spentToday: 0,
            lastResetTimestamp: block.timestamp,
            expiresAt: block.timestamp + durationInSeconds,
            revokedAt: 0,
            isActive: true
        });

        emit SessionCreated(agentKey, dailyLimit, block.timestamp + durationInSeconds);
    }

    function revokeSession(address agentKey) external onlyOwner {
        SessionPolicy storage policy = sessions[agentKey];
        policy.isActive = false;
        policy.revokedAt = block.timestamp;
        emit SessionRevoked(agentKey, block.timestamp);
    }

    function queueWithdrawal(address token, uint256 amount) external onlyOwner {
        if (amount == 0) revert ZeroAmount();
        uint256 unlock = block.timestamp + WITHDRAWAL_TIMELOCK;
        pendingWithdrawals[token] = WithdrawalRequest({ amount: amount, unlockTimestamp: unlock });
        emit WithdrawalQueued(token, amount, unlock);
    }

    function executeWithdrawal(address token, address to) external nonReentrant onlyOwner {
        if (to == address(0)) revert InvalidAddress();
        WithdrawalRequest memory request = pendingWithdrawals[token];
        
        if (request.amount == 0) revert NoPendingWithdrawal();
        if (block.timestamp < request.unlockTimestamp) {
            revert WithdrawalLocked(block.timestamp, request.unlockTimestamp);
        }

        delete pendingWithdrawals[token];
        emit WithdrawalExecuted(token, to, request.amount);
        IERC20(token).safeTransfer(to, request.amount);
    }

    function cancelWithdrawal(address token) external onlyOwner {
        delete pendingWithdrawals[token];
        emit WithdrawalCancelled(token);
    }

    function setFeeConfig(address _treasury, uint256 _feeBps) external onlyOwner {
        if (_treasury == address(0)) revert InvalidAddress();
        if (_feeBps > MAX_FEE_BPS) revert FeeTooHigh();
        treasury = _treasury;
        protocolFeeBps = _feeBps;
        emit FeeConfigUpdated(_treasury, _feeBps);
    }

    function getChannelKey(address agentKey, address merchant, uint256 sessionId, address token) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(agentKey, merchant, sessionId, token));
    }

    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
}
