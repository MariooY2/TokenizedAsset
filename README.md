# Art Tokenization Smart Contracts

Complete art tokenization system based on the Picasso "Fillette au béret" case study. Built with Foundry/Forge and Solidity 0.8.20+.

## Overview

This project implements a real-world tokenization system inspired by Sygnum Bank's $4M Picasso painting tokenization:
- 2,000 security tokens (AST) representing fractional ownership
- KYC/compliance using ERC-3643 principles
- Primary sale with stablecoin payments (USDC)
- Exit distribution mechanism with 15% return scenario
- Governance system for key decisions

## Technical Stack

- **Solidity**: 0.8.20+
- **Framework**: Foundry/Forge
- **Standards**: ERC-20, ERC-3643 (identity-based security tokens)
- **Dependencies**: OpenZeppelin Contracts

## Project Structure

```
src/
├── core/
│   ├── IdentityRegistry.sol      # KYC whitelist management
│   └── ArtSecurityToken.sol      # ERC-20 security token with compliance
├── distribution/
│   ├── PrimarySale.sol            # Initial token distribution
│   └── ExitDistribution.sol       # Final redemption mechanism
├── defi/
│   └── ArtPriceOracle.sol        # Artwork valuation feed
├── governance/
│   └── GovernanceContract.sol     # Proposal and voting system
└── interfaces/
    └── IIdentityRegistry.sol      # Identity registry interface

test/
├── IdentityRegistry.t.sol
├── ArtSecurityToken.t.sol
├── PrimarySale.t.sol
├── ArtPriceOracle.t.sol
├── ExitDistribution.t.sol
└── GovernanceContract.t.sol
```

## Smart Contracts

### 1. IdentityRegistry.sol
**Purpose**: Manage KYC whitelist following ERC-3643 principles

**Key Features**:
- Add/remove investors from whitelist
- KYC expiry tracking
- Country verification
- Admin role management

**Key Functions**:
```solidity
function addToWhitelist(address investor, uint256 expiryDate, string country)
function removeFromWhitelist(address investor)
function isVerified(address investor) returns (bool)
function renewKYC(address investor, uint256 newExpiry)
```

### 2. ArtSecurityToken.sol
**Purpose**: Tokenized Picasso ownership with compliance

**Key Features**:
- Fixed supply: 2,000 tokens (2000e18)
- Transfer restrictions (KYC checks on sender + recipient)
- Liquidity window controls
- Artwork metadata storage

**Key Functions**:
```solidity
function transfer(address to, uint256 amount) // KYC-enforced
function setTransfersEnabled(bool enabled)    // Owner only
function isCompliant(address account) returns (bool)
```

**Token Details**:
- Name: "Art Security Token - Fillette au beret"
- Symbol: "AST"
- Total Supply: 2,000 tokens
- Initial Valuation: $4,000,000

### 3. PrimarySale.sol
**Purpose**: Initial token distribution

**Key Features**:
- Fixed price: 2,000 USDC per token
- KYC verification required
- Track total sold
- Owner can withdraw USDC and close sale

**Key Functions**:
```solidity
function buyTokens(uint256 amount)           // Buy AST with USDC
function calculateCost(uint256 astAmount) returns (uint256)
function withdrawFunds()                      // Owner withdraws USDC
function closeSale()                          // End primary distribution
```

### 4. ArtPriceOracle.sol
**Purpose**: Artwork valuation feed

**Key Features**:
- Multiple authorized oracles
- Price staleness detection (90 days)
- Update history tracking

**Key Functions**:
```solidity
function updatePrice(uint256 newPrice)       // Oracle updates price
function currentPrice() returns (uint256)
function isPriceStale() returns (bool)
function addOracle(address oracle)           // Admin adds oracle
```

### 5. ExitDistribution.sol
**Purpose**: Final redemption after artwork sale

**Key Features**:
- Deposit sale proceeds
- Burn AST for proportional USDC
- Return calculation
- Emergency withdraw

**Key Functions**:
```solidity
function depositProceeds(uint256 amount)     // Owner loads proceeds
function redeem(uint256 astAmount)           // Burn AST, get USDC
function calculateRedemption(uint256 astAmount) returns (uint256)
function finalPricePerToken() returns (uint256)
function calculateReturn(uint256 initialInvestment) returns (uint256)
```

### 6. GovernanceContract.sol
**Purpose**: Governance for key decisions

**Key Features**:
- Non-transferable governance tokens (70% SPV, 30% Art Advisor)
- Proposal types: EXIT_SALE, EMERGENCY_PAUSE, ENABLE_TRANSFERS
- 7-day voting period
- 50% quorum requirement

**Key Functions**:
```solidity
function createProposal(ProposalType, description, data) returns (uint256)
function vote(uint256 proposalId, bool support)
function executeProposal(uint256 proposalId)
function cancelProposal(uint256 proposalId)
```

## Installation

1. **Install Foundry**:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. **Install Dependencies**:
```bash
forge install OpenZeppelin/openzeppelin-contracts
```

3. **Build Contracts**:
```bash
forge build
```

## Testing

Run all tests:
```bash
forge test
```

Run tests with verbosity:
```bash
forge test -vvv
```

Run specific test file:
```bash
forge test --match-path test/ArtSecurityToken.t.sol
```

Run with gas reporting:
```bash
forge test --gas-report
```

## Deployment Flow

### 1. Deploy Core Infrastructure
```solidity
// 1. Deploy IdentityRegistry
IdentityRegistry registry = new IdentityRegistry();

// 2. Deploy ArtSecurityToken
ArtSecurityToken ast = new ArtSecurityToken(
    address(registry),
    "Fillette au beret",
    "Pablo Picasso",
    1937,
    4000000 * 10**6  // $4M initial valuation
);

// 3. Deploy ArtPriceOracle
ArtPriceOracle oracle = new ArtPriceOracle(4000000 * 10**18);
```

### 2. Deploy Distribution Contracts
```solidity
// 4. Deploy PrimarySale
PrimarySale sale = new PrimarySale(
    address(ast),
    address(usdc),  // USDC token address
    address(registry)
);

// Transfer AST tokens to sale contract
ast.transfer(address(sale), 2000 * 10**18);

// 5. Deploy ExitDistribution
ExitDistribution exit = new ExitDistribution(
    address(ast),
    address(usdc),
    address(registry)
);
```

### 3. Deploy Governance
```solidity
// 6. Deploy GovernanceContract
GovernanceContract governance = new GovernanceContract(
    spvAddress,
    artAdvisorAddress
);

// Set AST token reference
governance.setASTToken(address(ast));
```

## Usage Examples

### KYC Whitelisting
```solidity
// Add investor to whitelist
uint256 expiry = block.timestamp + 365 days;
registry.addToWhitelist(investorAddress, expiry, "US");

// Check if verified
bool verified = registry.isVerified(investorAddress);
```

### Primary Sale
```solidity
// Investor buys tokens
uint256 astAmount = 10 * 10**18;  // 10 tokens
uint256 cost = sale.calculateCost(astAmount);  // 20,000 USDC

usdc.approve(address(sale), cost);
sale.buyTokens(astAmount);
```

### Exit Redemption
```solidity
// Owner deposits proceeds after artwork sale
uint256 proceeds = 4600000 * 10**6;  // $4.6M (15% return)
usdc.approve(address(exit), proceeds);
exit.depositProceeds(proceeds);

// Investor redeems tokens
uint256 astAmount = 100 * 10**18;
ast.approve(address(exit), astAmount);
exit.redeem(astAmount);  // Receives proportional USDC
```

### Governance
```solidity
// Create proposal to enable transfers
bytes memory data = abi.encode(true);
uint256 proposalId = governance.createProposal(
    GovernanceContract.ProposalType.ENABLE_TRANSFERS,
    "Enable transfers for liquidity window",
    data
);

// Vote on proposal
governance.vote(proposalId, true);

// Execute after voting period
governance.executeProposal(proposalId);
```

## Compliance Features

### Transfer Restrictions
- Both sender and recipient must be KYC verified
- Transfers disabled outside liquidity windows
- Owner can always transfer (for distribution)
- Minting and burning always allowed

### KYC Requirements
- Off-chain KYC verification (simulated by PwC)
- On-chain whitelist with expiry dates
- Country tracking for regulatory compliance
- Renewable KYC status

## Security Considerations

1. **Access Control**: Uses OpenZeppelin's AccessControl and Ownable
2. **Reentrancy Protection**: ReentrancyGuard on sensitive functions
3. **Input Validation**: Comprehensive requirement checks
4. **Transfer Safety**: KYC verification on all transfers
5. **Emergency Functions**: Owner emergency withdraw capabilities

## Gas Optimization

- Immutable variables for frequently accessed addresses
- Efficient storage patterns
- Minimal external calls
- Batch operations where possible

## Events

All contracts emit comprehensive events for:
- KYC status changes
- Token transfers
- Sale activities
- Governance actions
- Price updates
- Redemptions

## License

MIT

## Case Study Details

Based on real-world Picasso "Fillette au béret" tokenization:
- **Artwork Value**: $4,000,000
- **Total Tokens**: 2,000
- **Price per Token**: $2,000 (2,000 USDC)
- **Holding Period**: ~2 years
- **Exit Return**: 15% ($4,600,000 sale price)
- **Token Standard**: Security token with compliance
- **Payment**: Stablecoin (USDC)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass: `forge test`
5. Submit a pull request

## Testing Coverage

All contracts have comprehensive test coverage including:
- Happy path scenarios
- Edge cases
- Access control
- Failure modes
- Gas optimization
- Integration tests

Run coverage report:
```bash
forge coverage
```

## Further Development

Potential enhancements:
- Secondary market implementation
- Dividend distribution mechanism
- Multi-signature governance
- Upgradeable contracts (if needed)
- Cross-chain bridging
- NFT representation of ownership

## Support

For issues and questions:
- Open an issue on GitHub
- Review test files for usage examples
- Check contract NatSpec documentation
