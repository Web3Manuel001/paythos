// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../src/core/PaythosVault.sol";

contract PaythosUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {
        _mint(msg.sender, 1_000_000 * 1e6); // Mint 1,000,000 USDC
    }
    function decimals() public pure override returns (uint8) {
        return 6;
    }
}

contract SetupLiveArcSession is Script {
    address public constant LIVE_VAULT = 0xFb57ceAEF685B73Dc0270f806545e195393Cc277;
    // Gofer Agent ephemeral address (from private key 0x...a11ce)
    address public constant GOFER_AGENT = 0xe05fcC23807536bEe418f142D19fa0d21BB0cfF7;

    function run() external {
        uint256 deployerPk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPk);

        vm.startBroadcast(deployerPk);

        // 1. Deploy 6-decimal USDC on Arc Testnet
        PaythosUSDC usdc = new PaythosUSDC();
        console.log("Paythos USDC deployed on Arc at:", address(usdc));

        // 2. Fund the Vault with 50 USDC
        usdc.transfer(LIVE_VAULT, 50 * 1e6);
        console.log("Transferred 50 USDC collateral to PaythosVault");

        // 3. Authorize Gofer Agent on-chain for 30 days with $10.00/day spend cap
        PaythosVault vault = PaythosVault(LIVE_VAULT);
        vault.createSession(GOFER_AGENT, 10 * 1e6, 30 days);
        console.log("Session created on Arc for Gofer Agent:", GOFER_AGENT);

        vm.stopBroadcast();
    }
}
