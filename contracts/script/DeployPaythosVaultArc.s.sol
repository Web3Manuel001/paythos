// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/core/PaythosVault.sol";

contract DeployPaythosVaultArc is Script {
    // Official Circle USDC on Arc Testnet (or fallback to testnet deploy address)
    address public constant ARC_TESTNET_USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    function run() external returns (address vaultAddress) {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        address treasury = vm.envOr("TREASURY_ADDRESS", deployer);
        address settlementToken = vm.envOr("SETTLEMENT_TOKEN", ARC_TESTNET_USDC);
        uint256 feeBps = vm.envOr("PROTOCOL_FEE_BPS", uint256(150)); // 1.50%

        console.log("==================================================");
        console.log("DEPLOYING HARDENED PAYTHOS VAULT NATIVELY TO ARC L1");
        console.log("Settlement Token:", settlementToken);
        console.log("Deployer:        ", deployer);
        console.log("Treasury:        ", treasury);
        console.log("Fee Bps:         ", feeBps);
        console.log("==================================================");

        vm.startBroadcast(deployerPrivateKey);
        PaythosVault vault = new PaythosVault(settlementToken, treasury, feeBps);
        vm.stopBroadcast();

        vaultAddress = address(vault);

        console.log("==================================================");
        console.log("ARC L1 DEPLOYMENT SUCCESSFUL");
        console.log("Contract Address:", vaultAddress);
        console.log("Domain Separator:", vm.toString(vault.getDomainSeparator()));
        console.log("==================================================");
    }
}
