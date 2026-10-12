// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "../interfaces/IPaythosTypes.sol";

contract PaythosVault is IPaythosTypes, Ownable2Step, EIP712, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant MAX_FEE_BPS = 500;
    uint256 public constant WITHDRAWAL_TIMELOCK = 6 hours;
    uint256 public constant REVOCATION_GRACE_PERIOD = 1 hours;

    bytes32 public constant VOUCHER_TYPEHASH = keccak256(
        "PaymentVoucher(address token,address merchant,address agentKey,uint256 sessionId,uint256 cumulativeAmount,uint256 expiresAt,uint256 nonce)"
    );

    address public treasury;
    uint256 public protocolFeeBps;

    mapping(address => SessionPolicy) public sessions;
    mapping(bytes32 => uint256) public settledAmount;
    mapping(address => WithdrawalRequest) public pendingWithdrawals;

    error InvalidAddress();
    error ZeroAmount();
    error FeeTooHigh();
    error SessionNotActive();
    error SessionExpired();
    error DailyLimitExceeded(uint256 requested, uint256 remaining);
    error InvalidSignature();
    error VoucherExpired();
    error NonMonotonicVoucher(uint256 proposed, uint256 current);
    error WithdrawalLocked(uint256 currentTimestamp, uint256 unlockTimestamp);
    error NoPendingWithdrawal();

    constructor(
        address _treasury,
        uint256 _initialFeeBps
    ) 
        Ownable(msg.sender) 
        EIP712("PaythosVault", "1") 
    {
        if (_treasury == address(0)) revert InvalidAddress();
        if (_initialFeeBps > MAX_FEE_BPS) revert FeeTooHigh();

        treasury = _treasury;
        protocolFeeBps = _initialFeeBps;
    }

    function settleVoucher(
        PaymentVoucher calldata voucher,
        bytes calldata signature
    ) external nonReentrant {
        if (voucher.merchant == address(0) || voucher.agentKey == address(0)) revert InvalidAddress();
        if (block.timestamp > voucher.expiresAt) revert VoucherExpired();

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

        SessionPolicy storage policy = sessions[voucher.agentKey];
        if (!policy.isActive) {
            if (policy.revokedAt == 0 || block.timestamp > policy.revokedAt + REVOCATION_GRACE_PERIOD) {
                revert SessionNotActive();
            }
        }
        if (block.timestamp > policy.expiresAt) revert SessionExpired();

        bytes32 channelKey = getChannelKey(voucher.agentKey, voucher.merchant, voucher.sessionId, voucher.token);
        uint256 previouslySettled = settledAmount[channelKey];
        if (voucher.cumulativeAmount <= previouslySettled) {
            revert NonMonotonicVoucher(voucher.cumulativeAmount, previouslySettled);
        }

        uint256 payoutDelta = voucher.cumulativeAmount - previouslySettled;

        if (block.timestamp >= policy.lastResetTimestamp + 1 days) {
            policy.spentToday = 0;
            policy.lastResetTimestamp = block.timestamp;
        }

        if (policy.spentToday + payoutDelta > policy.dailyLimit) {
            uint256 remaining = policy.dailyLimit > policy.spentToday ? policy.dailyLimit - policy.spentToday : 0;
            revert DailyLimitExceeded(payoutDelta, remaining);
        }

        // State update (Checks-Effects)
        policy.spentToday += payoutDelta;
        settledAmount[channelKey] = voucher.cumulativeAmount;

        uint256 fee = 0;
        if (protocolFeeBps > 0 && treasury != address(0)) {
            fee = (payoutDelta * protocolFeeBps) / BPS_DENOMINATOR;
        }
        uint256 netMerchantPayout = payoutDelta - fee;

        // Emit Event before external transfers (CEI Pattern)
        emit VoucherSettled(channelKey, voucher.merchant, voucher.agentKey, voucher.token, netMerchantPayout, fee);

        // Interactions
        IERC20(voucher.token).safeTransfer(voucher.merchant, netMerchantPayout);
        if (fee > 0) {
            IERC20(voucher.token).safeTransfer(treasury, fee);
        }
    }

    function executePayment(
        address token,
        address recipient,
        uint256 amount
    ) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (recipient == address(0)) revert InvalidAddress();

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

        // State update
        policy.spentToday += amount;

        uint256 fee = 0;
        if (protocolFeeBps > 0 && treasury != address(0)) {
            fee = (amount * protocolFeeBps) / BPS_DENOMINATOR;
        }
        uint256 netAmount = amount - fee;

        // Emit Event before external transfers
        emit DirectPaymentExecuted(msg.sender, token, recipient, netAmount, fee);

        // Interactions
        IERC20(token).safeTransfer(recipient, netAmount);
        if (fee > 0) {
            IERC20(token).safeTransfer(treasury, fee);
        }
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

        emit SessionRevoked(agentKey, block.timestamp + REVOCATION_GRACE_PERIOD);
    }

    function queueWithdrawal(address token, uint256 amount) external onlyOwner {
        if (amount == 0) revert ZeroAmount();
        
        uint256 unlock = block.timestamp + WITHDRAWAL_TIMELOCK;
        pendingWithdrawals[token] = WithdrawalRequest({
            amount: amount,
            unlockTimestamp: unlock
        });

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

    function getChannelKey(
        address agentKey,
        address merchant,
        uint256 sessionId,
        address token
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(agentKey, merchant, sessionId, token));
    }

    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
}
