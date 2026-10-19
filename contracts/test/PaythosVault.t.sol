// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../src/core/PaythosVault.sol";
import "../src/interfaces/IPaythosTypes.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {}
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MockDAI is ERC20 {
    constructor() ERC20("Dai Stablecoin", "DAI") {}
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract PaythosVaultTest is Test, IPaythosTypes {
    PaythosVault public vault;
    MockUSDC public usdc;
    MockDAI public unapprovedToken;

    address public owner = address(0x1);
    address public treasury = address(0x2);
    address public merchant = address(0x3);

    uint256 public agentPrivateKey = 0xA11CE;
    address public agentKey;

    uint256 public constant INITIAL_FEE_BPS = 150; // 1.50%
    uint256 public constant DAILY_LIMIT = 1000 * 1e6; // 1,000 USDC

    function setUp() public {
        agentKey = vm.addr(agentPrivateKey);

        vm.startPrank(owner);
        usdc = new MockUSDC();
        unapprovedToken = new MockDAI();

        vault = new PaythosVault(address(usdc), treasury, INITIAL_FEE_BPS);
        vault.createSession(agentKey, DAILY_LIMIT, 7 days);
        vm.stopPrank();

        usdc.mint(address(vault), 50_000 * 1e6);
    }

    function _signVoucher(
        PaymentVoucher memory voucher,
        uint256 signerPk
    ) internal view returns (bytes memory) {
        bytes32 structHash = keccak256(
            abi.encode(
                vault.VOUCHER_TYPEHASH(),
                voucher.token,
                voucher.merchant,
                voucher.agentKey,
                voucher.sessionId,
                voucher.cumulativeAmount,
                voucher.expiresAt,
                voucher.nonce
            )
        );

        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", vault.getDomainSeparator(), structHash)
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPk, digest);
        return abi.encodePacked(r, s, v);
    }

    function test_InitialState() public view {
        assertEq(vault.owner(), owner);
        assertEq(vault.treasury(), treasury);
        assertEq(vault.protocolFeeBps(), INITIAL_FEE_BPS);
        assertEq(vault.settlementToken(), address(usdc));
    }

    function test_SettleVoucher_CumulativeDeltasAndFee() public {
        PaymentVoucher memory v1 = PaymentVoucher({
            token: address(usdc),
            merchant: merchant,
            agentKey: agentKey,
            sessionId: 1,
            cumulativeAmount: 10 * 1e6,
            expiresAt: block.timestamp + 1 hours,
            nonce: 1
        });
        bytes memory sig1 = _signVoucher(v1, agentPrivateKey);
        vault.settleVoucher(v1, sig1);

        assertEq(usdc.balanceOf(treasury), 150_000);
        assertEq(usdc.balanceOf(merchant), 9_850_000);

        PaymentVoucher memory v2 = PaymentVoucher({
            token: address(usdc),
            merchant: merchant,
            agentKey: agentKey,
            sessionId: 1,
            cumulativeAmount: 25 * 1e6,
            expiresAt: block.timestamp + 1 hours,
            nonce: 2
        });
        bytes memory sig2 = _signVoucher(v2, agentPrivateKey);
        vault.settleVoucher(v2, sig2);

        assertEq(usdc.balanceOf(treasury), 375_000);
        assertEq(usdc.balanceOf(merchant), 24_625_000);
    }

    function test_Revert_NonMonotonicVoucher() public {
        PaymentVoucher memory v1 = PaymentVoucher({
            token: address(usdc),
            merchant: merchant,
            agentKey: agentKey,
            sessionId: 1,
            cumulativeAmount: 50 * 1e6,
            expiresAt: block.timestamp + 1 hours,
            nonce: 1
        });
        bytes memory sig1 = _signVoucher(v1, agentPrivateKey);
        vault.settleVoucher(v1, sig1);

        PaymentVoucher memory v2 = v1;
        v2.cumulativeAmount = 40 * 1e6;
        v2.nonce = 2;
        bytes memory sig2 = _signVoucher(v2, agentPrivateKey);

        vm.expectRevert();
        vault.settleVoucher(v2, sig2);
    }

    function test_Revert_InvalidNonce() public {
        PaymentVoucher memory v1 = PaymentVoucher({
            token: address(usdc),
            merchant: merchant,
            agentKey: agentKey,
            sessionId: 1,
            cumulativeAmount: 10 * 1e6,
            expiresAt: block.timestamp + 1 hours,
            nonce: 5
        });
        bytes memory sig1 = _signVoucher(v1, agentPrivateKey);
        vault.settleVoucher(v1, sig1);

        PaymentVoucher memory v2 = PaymentVoucher({
            token: address(usdc),
            merchant: merchant,
            agentKey: agentKey,
            sessionId: 1,
            cumulativeAmount: 20 * 1e6,
            expiresAt: block.timestamp + 1 hours,
            nonce: 5 // Replaying identical nonce!
        });
        // 1. Precompute signature BEFORE expectRevert
        bytes memory sig2 = _signVoucher(v2, agentPrivateKey);

        // 2. Expect revert on settleVoucher
        vm.expectRevert(
            abi.encodeWithSelector(
                PaythosVault.InvalidNonce.selector,
                5,
                5
            )
        );
        vault.settleVoucher(v2, sig2);
    }

    function test_Revert_UnsupportedToken() public {
        PaymentVoucher memory v = PaymentVoucher({
            token: address(unapprovedToken),
            merchant: merchant,
            agentKey: agentKey,
            sessionId: 1,
            cumulativeAmount: 10 * 1e6,
            expiresAt: block.timestamp + 1 hours,
            nonce: 1
        });
        // 1. Precompute signature BEFORE expectRevert
        bytes memory sig = _signVoucher(v, agentPrivateKey);

        // 2. Expect revert on settleVoucher
        vm.expectRevert(
            abi.encodeWithSelector(
                PaythosVault.UnsupportedToken.selector,
                address(unapprovedToken),
                address(usdc)
            )
        );
        vault.settleVoucher(v, sig);
    }

    function test_InstantRevocation() public {
        vm.prank(owner);
        vault.revokeSession(agentKey);

        PaymentVoucher memory v = PaymentVoucher({
            token: address(usdc),
            merchant: merchant,
            agentKey: agentKey,
            sessionId: 1,
            cumulativeAmount: 10 * 1e6,
            expiresAt: block.timestamp + 1 hours,
            nonce: 1
        });
        // 1. Precompute signature BEFORE expectRevert
        bytes memory sig = _signVoucher(v, agentPrivateKey);

        // 2. Expect revert on settleVoucher
        vm.expectRevert(PaythosVault.SessionNotActive.selector);
        vault.settleVoucher(v, sig);
    }

    function test_Revert_InvalidSignature() public {
        uint256 attackerPk = 0xBAD;
        PaymentVoucher memory v = PaymentVoucher({
            token: address(usdc),
            merchant: merchant,
            agentKey: agentKey,
            sessionId: 1,
            cumulativeAmount: 10 * 1e6,
            expiresAt: block.timestamp + 1 hours,
            nonce: 1
        });
        bytes memory badSig = _signVoucher(v, attackerPk);

        vm.expectRevert(PaythosVault.InvalidSignature.selector);
        vault.settleVoucher(v, badSig);
    }

    function test_Revert_DailyLimitExceeded() public {
        PaymentVoucher memory v = PaymentVoucher({
            token: address(usdc),
            merchant: merchant,
            agentKey: agentKey,
            sessionId: 1,
            cumulativeAmount: DAILY_LIMIT + 1,
            expiresAt: block.timestamp + 1 hours,
            nonce: 1
        });
        bytes memory sig = _signVoucher(v, agentPrivateKey);

        vm.expectRevert();
        vault.settleVoucher(v, sig);
    }

    function test_WithdrawalTimelockProtection() public {
        vm.startPrank(owner);

        vault.queueWithdrawal(address(usdc), 5_000 * 1e6);

        vm.expectRevert();
        vault.executeWithdrawal(address(usdc), owner);

        vm.warp(block.timestamp + 6 hours - 1);
        vm.expectRevert();
        vault.executeWithdrawal(address(usdc), owner);

        vm.warp(block.timestamp + 2);
        vault.executeWithdrawal(address(usdc), owner);
        assertEq(usdc.balanceOf(owner), 5_000 * 1e6);

        vm.stopPrank();
    }

    function testFuzz_CumulativeMonotonicDeltas(uint32 delta1, uint32 delta2) public {
        vm.assume(delta1 > 0 && delta1 < DAILY_LIMIT / 2);
        vm.assume(delta2 > 0 && delta2 < DAILY_LIMIT / 2);

        uint256 d1 = uint256(delta1);
        uint256 d2 = uint256(delta2);
        uint256 total = d1 + d2;

        PaymentVoucher memory v1 = PaymentVoucher({
            token: address(usdc),
            merchant: merchant,
            agentKey: agentKey,
            sessionId: 1,
            cumulativeAmount: d1,
            expiresAt: block.timestamp + 1 hours,
            nonce: 1
        });
        vault.settleVoucher(v1, _signVoucher(v1, agentPrivateKey));

        PaymentVoucher memory v2 = PaymentVoucher({
            token: address(usdc),
            merchant: merchant,
            agentKey: agentKey,
            sessionId: 1,
            cumulativeAmount: total,
            expiresAt: block.timestamp + 1 hours,
            nonce: 2
        });
        vault.settleVoucher(v2, _signVoucher(v2, agentPrivateKey));

        uint256 fee1 = (d1 * INITIAL_FEE_BPS) / 10_000;
        uint256 fee2 = (d2 * INITIAL_FEE_BPS) / 10_000;
        uint256 totalFee = fee1 + fee2;
        uint256 totalMerchant = (d1 - fee1) + (d2 - fee2);

        assertEq(usdc.balanceOf(treasury), totalFee);
        assertEq(usdc.balanceOf(merchant), totalMerchant);
        assertEq(usdc.balanceOf(treasury) + usdc.balanceOf(merchant), total);
    }
}
