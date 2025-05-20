// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {VerifyPublic} from "../src/Verify.sol"; // Adjust if path differs

contract DeployVerify is Script {
    function run() external {
        // Load your deployer's private key from environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Broadcast the transaction
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the contract
        VerifyPublic verify = new VerifyPublic();

        vm.stopBroadcast();

        console2.log(" VerifyPublic deployed at:", address(verify));
    }
}
