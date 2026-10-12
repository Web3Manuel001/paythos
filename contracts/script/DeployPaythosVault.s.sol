// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/core/PaythosVault.sol";

contract DeployPaythosVault is Script {
    function run() external returns (address vaultAddress) {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        address treasury = vm.envOr("TREASURY_ADDRESS", deployer);
        uint256 feeBps = vm.envOr("PROTOCOL_FEE_BPS", uint256(150)); // Default 1.50%

        console.log("--------------------------------------------------");
        console.log("Deploying PaythosVault to Base L2...");
        console.log("Deployer Address:", deployer);
        console.log("Treasury Address:", treasury);
        console.log("Protocol Fee Bps:", feeBps);
        console.log("--------------------------------------------------");

        vm.startBroadcast(deployerPrivateKey);
        PaythosVault vault = new PaythosVault(treasury, feeBps);
        vm.stopBroadcast();

        vaultAddress = address(vault);

        console.log("--------------------------------------------------");
        console.log("SUCCESS: PaythosVault deployed at:", vaultAddress);
        console.log("Domain Separator:", vm.toString(vault.getDomainSeparator()));
        console.log("--------------------------------------------------");
    }
}
