#!/bin/bash

# Mint USDC Script
# Usage: ./scripts/mint-usdc.sh <ADDRESS> <AMOUNT>

USDC_ADDRESS="0xEe021E39f6FF404DFaa8DE685eC0822403adCFcD"

# Get parameters
TO_ADDRESS=${1:-$DEPLOYER_ADDRESS}
AMOUNT=${2:-10000000000}  # Default: 10,000 USDC (10,000 * 10^6)

echo "Minting USDC..."
echo "To: $TO_ADDRESS"
echo "Amount: $AMOUNT (in 6 decimals)"

cast send $USDC_ADDRESS \
  "mint(address,uint256)" \
  $TO_ADDRESS \
  $AMOUNT \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY

echo "✅ USDC minted successfully!"
