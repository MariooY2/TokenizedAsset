// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/IdentityRegistry.sol";
import "../src/core/ArtSecurityToken.sol";
import "../src/distribution/PrimarySale.sol";
import "../src/distribution/ExitDistribution.sol";
import "../src/defi/ArtPriceOracle.sol";
import "../src/governance/GovernanceContract.sol";
import "../src/mocks/MockUSDC.sol";

contract DeploySepolia is Script {

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Mock USDC if needed
        MockUSDC usdc = new MockUSDC();
        console.log("Mock USDC deployed at:", address(usdc));

        // 2. Deploy IdentityRegistry
        IdentityRegistry registry = new IdentityRegistry();
        console.log("IdentityRegistry deployed at:", address(registry));

        // 3. Whitelist deployer for initial operations
        uint256 expiry = block.timestamp + 365 days;
        registry.addToWhitelist(deployer, expiry, "US");
        console.log("Deployer whitelisted");

        // 4. Deploy ArtSecurityToken
        ArtSecurityToken ast = new ArtSecurityToken(
            address(registry),
            "Fillette au beret",
            "Pablo Picasso",
            1937,
            4000000 * 10**6  // $4M initial valuation
        );
        console.log("ArtSecurityToken deployed at:", address(ast));

        // 5. Deploy ArtPriceOracle
        ArtPriceOracle oracle = new ArtPriceOracle(4000000 * 10**18);
        console.log("ArtPriceOracle deployed at:", address(oracle));

        // 6. Deploy PrimarySale
        PrimarySale sale = new PrimarySale(
            address(ast),
            address(usdc),
            address(registry)
        );
        console.log("PrimarySale deployed at:", address(sale));

        // Whitelist and fund sale contract
        registry.addToWhitelist(address(sale), expiry, "US");
        ast.transfer(address(sale), 2000 * 10**18);
        ast.setTransfersEnabled(true); // Enable transfers for primary sale
        console.log("PrimarySale funded with 2000 AST tokens");

        // 7. Deploy ExitDistribution
        ExitDistribution exitDist = new ExitDistribution(
            address(ast),
            address(usdc),
            address(registry)
        );
        console.log("ExitDistribution deployed at:", address(exitDist));

        // Whitelist exit contract
        registry.addToWhitelist(address(exitDist), expiry, "US");

        // 8. Deploy GovernanceContract
        // For demo, use deployer as both SPV and Art Advisor
        address spv = deployer;
        address artAdvisor = deployer;

        GovernanceContract governance = new GovernanceContract(spv, artAdvisor);
        console.log("GovernanceContract deployed at:", address(governance));

        governance.setASTToken(address(ast));

        vm.stopBroadcast();

        // Log all addresses for frontend
        console.log("\n=== Deployment Summary ===");
        console.log("USDC:", address(usdc));
        console.log("IdentityRegistry:", address(registry));
        console.log("ArtSecurityToken:", address(ast));
        console.log("ArtPriceOracle:", address(oracle));
        console.log("PrimarySale:", address(sale));
        console.log("ExitDistribution:", address(exitDist));
        console.log("GovernanceContract:", address(governance));
        console.log("========================\n");

        // Save addresses to file
        string memory addresses = string.concat(
            '{\n',
            '  "usdc": "', vm.toString(address(usdc)), '",\n',
            '  "identityRegistry": "', vm.toString(address(registry)), '",\n',
            '  "artSecurityToken": "', vm.toString(address(ast)), '",\n',
            '  "artPriceOracle": "', vm.toString(address(oracle)), '",\n',
            '  "primarySale": "', vm.toString(address(sale)), '",\n',
            '  "exitDistribution": "', vm.toString(address(exitDist)), '",\n',
            '  "governance": "', vm.toString(address(governance)), '"\n',
            '}'
        );

        vm.writeFile("deployments/sepolia.json", addresses);
        console.log("Contract addresses saved to deployments/sepolia.json");
    }
}
