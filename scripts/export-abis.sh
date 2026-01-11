#!/bin/bash

# Export ABIs from compiled contracts to frontend
echo "Exporting contract ABIs to frontend..."

# Create ABI directory if it doesn't exist
mkdir -p frontend/src/abi

# Export each contract ABI
jq '.abi' out/IdentityRegistry.sol/IdentityRegistry.json > frontend/src/abi/IdentityRegistry.json
jq '.abi' out/ArtSecurityToken.sol/ArtSecurityToken.json > frontend/src/abi/ArtSecurityToken.json
jq '.abi' out/PrimarySale.sol/PrimarySale.json > frontend/src/abi/PrimarySale.json
jq '.abi' out/ExitDistribution.sol/ExitDistribution.json > frontend/src/abi/ExitDistribution.json
jq '.abi' out/ArtPriceOracle.sol/ArtPriceOracle.json > frontend/src/abi/ArtPriceOracle.json
jq '.abi' out/GovernanceContract.sol/GovernanceContract.json > frontend/src/abi/GovernanceContract.json

# Export ERC20 ABI for USDC
jq '.abi' out/DeploySepolia.s.sol/MockUSDC.json > frontend/src/abi/USDC.json

echo "✓ ABIs exported successfully!"
echo "Files created in frontend/src/abi/"
