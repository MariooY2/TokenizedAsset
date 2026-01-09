# Installation Instructions

This document provides step-by-step instructions to set up the Art Tokenization project.

## Prerequisites

1. **Install Foundry**:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. **Verify Installation**:
```bash
forge --version
```

## Required Dependencies

The project requires the following dependencies to be installed:

### 1. Forge Standard Library (Testing Framework)

```bash
forge install foundry-rs/forge-std
```

This library provides:
- Test utilities
- VM cheats for testing
- Console logging
- Assertions

### 2. OpenZeppelin Contracts (Security & Standards)

```bash
forge install OpenZeppelin/openzeppelin-contracts
```

This library provides:
- ERC20 token implementation
- Access control (Ownable, AccessControl)
- Reentrancy guards
- Security utilities

## Installation Steps

1. **Clone/Navigate to the project directory**:
```bash
cd Tokenization
```

2. **Install dependencies**:
```bash
# Install Forge Standard Library
forge install foundry-rs/forge-std

# Install OpenZeppelin Contracts
forge install OpenZeppelin/openzeppelin-contracts
```

3. **Build the project**:
```bash
forge build
```

Expected output:
```
[⠊] Compiling...
[⠒] Compiling 6 files with 0.8.20
[⠑] Solc 0.8.20 finished in XXXms
Compiler run successful!
```

4. **Run tests**:
```bash
forge test
```

Expected output: All tests should pass
```
Running 50+ tests...
Test result: ok. X passed; 0 failed; finished in XXXms
```

## Troubleshooting

### Issue: "Source not found" errors

**Problem**: Forge cannot find dependencies
```
ParserError: Source "forge-std/Test.sol" not found
ParserError: Source "@openzeppelin/contracts/..." not found
```

**Solution**: Ensure dependencies are installed
```bash
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts
```

### Issue: Network connectivity problems

**Problem**: Cannot clone from GitHub
```
fatal: unable to access 'https://github.com/...'
```

**Solution 1**: Check internet connection and firewall settings

**Solution 2**: Use Git with SSH instead of HTTPS
```bash
git config --global url."git@github.com:".insteadOf "https://github.com/"
```

**Solution 3**: Manually download dependencies
1. Download forge-std from: https://github.com/foundry-rs/forge-std
2. Download openzeppelin-contracts from: https://github.com/OpenZeppelin/openzeppelin-contracts
3. Extract to `lib/forge-std` and `lib/openzeppelin-contracts` respectively

### Issue: Compiler version mismatch

**Problem**: Wrong Solidity version
```
Error: Compiler version mismatch
```

**Solution**: Check `foundry.toml` and ensure:
```toml
[profile.default]
solc_version = "0.8.20"
```

### Issue: Out of memory during compilation

**Problem**: Large project compilation fails

**Solution**: Increase optimizer runs or disable optimizer
```toml
[profile.default]
optimizer = true
optimizer_runs = 200  # Reduce this number
```

## Verifying Installation

Run this command to verify everything is set up correctly:

```bash
forge test --match-test testInitialState -vvv
```

This will run a simple test with verbose output to confirm the environment works.

## Next Steps

After successful installation:

1. **Explore the contracts**:
   - Review `src/` directory
   - Read contract documentation in code comments

2. **Run specific tests**:
   ```bash
   forge test --match-contract IdentityRegistryTest -vvv
   forge test --match-contract ArtSecurityTokenTest -vvv
   ```

3. **Check test coverage**:
   ```bash
   forge coverage
   ```

4. **Generate gas reports**:
   ```bash
   forge test --gas-report
   ```

5. **Read the main README**:
   - Check `README.md` for project overview
   - Review deployment flow
   - Study usage examples

## Project Structure Verification

After installation, your directory should look like:

```
Tokenization/
├── lib/
│   ├── forge-std/           # Testing library
│   └── openzeppelin-contracts/  # OpenZeppelin
├── src/
│   ├── core/
│   ├── distribution/
│   ├── defi/
│   ├── governance/
│   └── interfaces/
├── test/
│   ├── IdentityRegistry.t.sol
│   ├── ArtSecurityToken.t.sol
│   ├── PrimarySale.t.sol
│   ├── ArtPriceOracle.t.sol
│   ├── ExitDistribution.t.sol
│   └── GovernanceContract.t.sol
├── foundry.toml
└── README.md
```

## Getting Help

If you encounter issues:

1. Check Foundry documentation: https://book.getfoundry.sh/
2. Review OpenZeppelin docs: https://docs.openzeppelin.com/
3. Check GitHub issues for similar problems
4. Ensure all prerequisites are installed correctly

## Quick Reference

```bash
# Build project
forge build

# Run all tests
forge test

# Run tests with verbosity
forge test -vvv

# Run specific test file
forge test --match-path test/ArtSecurityToken.t.sol

# Run specific test function
forge test --match-test testBuyTokens

# Get gas report
forge test --gas-report

# Check coverage
forge coverage

# Format code
forge fmt

# Clean build artifacts
forge clean
```
