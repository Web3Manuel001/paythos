// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/core/PaythosVault.sol";

contract DeployPaythosVaultArc is Script {
    // Official Native USDC on Circle Arc L1 (Source: docs.arc.io/arc/references/contract-addresses)
    address public constant ARC_NATIVE_USDC = 0x3600000000000000000000000000000000000000;

    function run() external returns (address vaultAddress) {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        address treasury = vm.envOr("TREASURY_ADDRESS", deployer);
        address settlementToken = vm.envOr("SETTLEMENT_TOKEN", ARC_NATIVE_USDC);
        
        // Fee set to 0 bps for ecosystem growth (Monetization via B2B Fleet SaaS)
        uint256 feeBps = vm.envOr("PROTOCOL_FEE_BPS", uint256(0)); 

        console.log("==================================================");
        console.log("DEPLOYING PAYTHOS POLICY VAULT NATIVELY TO ARC L1");
        console.log("Settlement Token: Arc Native USDC (0x3600...0000)");
        console.log("Deployer:        ", deployer);
        console.log("Treasury:        ", treasury);
        console.log("Protocol Fee:    ", feeBps, "bps (Ecosystem Aligned)");
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
