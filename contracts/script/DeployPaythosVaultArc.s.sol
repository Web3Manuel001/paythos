// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/core/PaythosVault.sol";

contract DeployPaythosVaultArc is Script {
    function run() external returns (address vaultAddress) {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        address treasury = vm.envOr("TREASURY_ADDRESS", deployer);
        uint256 feeBps = vm.envOr("PROTOCOL_FEE_BPS", uint256(150)); // 1.50%

        console.log("==================================================");
        console.log("DEPLOYING PAYTHOS VAULT NATIVELY TO ARC L1");
        console.log("Economic Engine: Circle USDC (Native Gas)");
        console.log("Deployer:", deployer);
        console.log("Treasury:", treasury);
        console.log("Fee Bps: ", feeBps);
        console.log("==================================================");

        vm.startBroadcast(deployerPrivateKey);
        PaythosVault vault = new PaythosVault(treasury, feeBps);
        vm.stopBroadcast();

        vaultAddress = address(vault);

        console.log("==================================================");
        console.log("ARC L1 DEPLOYMENT SUCCESSFUL");
        console.log("Contract Address:", vaultAddress);
        console.log("Domain Separator:", vm.toString(vault.getDomainSeparator()));
        console.log("==================================================");
    }
}
