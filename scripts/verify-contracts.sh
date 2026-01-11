#!/bin/bash

# Verify all contracts on Sepolia Etherscan

echo "🔍 Verifying contracts on Sepolia Etherscan..."

# Contract addresses
USDC="0xEe021E39f6FF404DFaa8DE685eC0822403adCFcD"
IDENTITY_REGISTRY="0x956c698332A76b7c4fB14880d828A2B25f186578"
ART_SECURITY_TOKEN="0x9403726051Bb4BD13dcc4A9462334f085Fe6Da96"
ART_PRICE_ORACLE="0x016755458093Ad87703af7553078f802fcdfa74e"
PRIMARY_SALE="0xeE44c5737471b0d0ab4156A0C7451c0b64e4B806"
EXIT_DISTRIBUTION="0x2108A23b7Fb4dc07278C679a8378d96c47c71112"
GOVERNANCE="0xaCd5eCAe5a72e1df1A20E031A6C028e3C0673180"

# Deployer address
DEPLOYER="0xdcf53c761e9A32dC15C4675dFE8106dE4FB7aEa9"

echo "1. Verifying MockUSDC..."
forge verify-contract $USDC \
  src/mocks/MockUSDC.sol:MockUSDC \
  --chain-id 11155111 \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --watch

echo "2. Verifying IdentityRegistry..."
forge verify-contract $IDENTITY_REGISTRY \
  src/core/IdentityRegistry.sol:IdentityRegistry \
  --chain-id 11155111 \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --watch

echo "3. Verifying ArtSecurityToken..."
forge verify-contract $ART_SECURITY_TOKEN \
  src/core/ArtSecurityToken.sol:ArtSecurityToken \
  --chain-id 11155111 \
  --constructor-args $(cast abi-encode "constructor(address,string,string,uint256,uint256)" $IDENTITY_REGISTRY "Fillette au beret" "Pablo Picasso" 1937 4000000000000) \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --watch

echo "4. Verifying ArtPriceOracle..."
forge verify-contract $ART_PRICE_ORACLE \
  src/defi/ArtPriceOracle.sol:ArtPriceOracle \
  --chain-id 11155111 \
  --constructor-args $(cast abi-encode "constructor(uint256)" 4000000000000000000000000) \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --watch

echo "5. Verifying PrimarySale..."
forge verify-contract $PRIMARY_SALE \
  src/distribution/PrimarySale.sol:PrimarySale \
  --chain-id 11155111 \
  --constructor-args $(cast abi-encode "constructor(address,address,address)" $ART_SECURITY_TOKEN $USDC $IDENTITY_REGISTRY) \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --watch

echo "6. Verifying ExitDistribution..."
forge verify-contract $EXIT_DISTRIBUTION \
  src/distribution/ExitDistribution.sol:ExitDistribution \
  --chain-id 11155111 \
  --constructor-args $(cast abi-encode "constructor(address,address,address)" $ART_SECURITY_TOKEN $USDC $IDENTITY_REGISTRY) \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --watch

echo "7. Verifying GovernanceContract..."
forge verify-contract $GOVERNANCE \
  src/governance/GovernanceContract.sol:GovernanceContract \
  --chain-id 11155111 \
  --constructor-args $(cast abi-encode "constructor(address,address)" $DEPLOYER $DEPLOYER) \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --watch

echo "✅ All contracts verified!"
