const fs = require('fs');
const path = require('path');

const contracts = [
  { name: 'ArtSecurityToken', path: 'out/ArtSecurityToken.sol/ArtSecurityToken.json' },
  { name: 'IdentityRegistry', path: 'out/IdentityRegistry.sol/IdentityRegistry.json' },
  { name: 'PrimarySale', path: 'out/PrimarySale.sol/PrimarySale.json' },
  { name: 'ExitDistribution', path: 'out/ExitDistribution.sol/ExitDistribution.json' },
  { name: 'ArtPriceOracle', path: 'out/ArtPriceOracle.sol/ArtPriceOracle.json' },
  { name: 'GovernanceContract', path: 'out/GovernanceContract.sol/GovernanceContract.json' },
];

// Create USDC ABI (ERC20 interface)
const usdcAbi = [
  {
    "inputs": [{"internalType": "address","name": "owner","type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "spender","type": "address"},{"internalType": "uint256","name": "amount","type": "uint256"}],
    "name": "approve",
    "outputs": [{"internalType": "bool","name": "","type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "owner","type": "address"},{"internalType": "address","name": "spender","type": "address"}],
    "name": "allowance",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "to","type": "address"},{"internalType": "uint256","name": "amount","type": "uint256"}],
    "name": "transfer",
    "outputs": [{"internalType": "bool","name": "","type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "to","type": "address"},{"internalType": "uint256","name": "amount","type": "uint256"}],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8","name": "","type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
];

fs.writeFileSync('frontend/src/abi/USDC.json', JSON.stringify(usdcAbi, null, 2));
console.log('✓ Created USDC.json');

contracts.forEach(contract => {
  try {
    const fullPath = path.join(__dirname, contract.path);
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const abi = data.abi;

    const outputPath = path.join(__dirname, 'frontend/src/abi', `${contract.name}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(abi, null, 2));
    console.log(`✓ Extracted ${contract.name}.json`);
  } catch (error) {
    console.error(`✗ Error extracting ${contract.name}:`, error.message);
  }
});

console.log('\nAll ABIs extracted successfully!');
