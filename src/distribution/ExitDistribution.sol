// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IIdentityRegistry.sol";

/**
 * @title ExitDistribution
 * @dev Handles final redemption when artwork is sold
 * @notice Investors burn AST tokens to receive proportional USDC proceeds
 */
contract ExitDistribution is Ownable, ReentrancyGuard {
    IERC20 public immutable astToken;
    IERC20 public immutable usdcToken;
    IIdentityRegistry public immutable identityRegistry;

    uint256 public totalProceeds;
    uint256 public totalRedeemed;
    bool public proceedsDeposited;

    uint256 public constant TOTAL_AST_SUPPLY = 2000 * 10**18;

    event ProceedsDeposited(uint256 amount, uint256 timestamp);
    event Redeemed(address indexed investor, uint256 astAmount, uint256 usdcAmount);

    constructor(
        address _astToken,
        address _usdcToken,
        address _identityRegistry
    ) Ownable(msg.sender) {
        require(_astToken != address(0), "Invalid AST address");
        require(_usdcToken != address(0), "Invalid USDC address");
        require(_identityRegistry != address(0), "Invalid registry address");

        astToken = IERC20(_astToken);
        usdcToken = IERC20(_usdcToken);
        identityRegistry = IIdentityRegistry(_identityRegistry);
    }

    /**
     * @dev Deposit sale proceeds to enable redemptions
     * @param amount Amount of USDC from artwork sale
     */
    function depositProceeds(uint256 amount) external onlyOwner {
        require(!proceedsDeposited, "Proceeds already deposited");
        require(amount > 0, "Amount must be greater than 0");

        require(
            usdcToken.transferFrom(msg.sender, address(this), amount),
            "USDC transfer failed"
        );

        totalProceeds = amount;
        proceedsDeposited = true;

        emit ProceedsDeposited(amount, block.timestamp);
    }

    /**
     * @dev Redeem AST tokens for proportional USDC proceeds
     * @param astAmount Amount of AST tokens to burn
     */
    function redeem(uint256 astAmount) external nonReentrant {
        require(proceedsDeposited, "Proceeds not yet deposited");
        require(astAmount > 0, "Amount must be greater than 0");
        require(identityRegistry.isVerified(msg.sender), "User not KYC verified");

        uint256 usdcAmount = calculateRedemption(astAmount);
        require(usdcAmount > 0, "Redemption amount too small");
        require(
            usdcAmount <= usdcToken.balanceOf(address(this)),
            "Insufficient USDC in contract"
        );

        // Burn AST tokens
        require(
            astToken.transferFrom(msg.sender, address(this), astAmount),
            "AST transfer failed"
        );

        // Transfer USDC to investor
        require(usdcToken.transfer(msg.sender, usdcAmount), "USDC transfer failed");

        totalRedeemed += usdcAmount;

        emit Redeemed(msg.sender, astAmount, usdcAmount);
    }

    /**
     * @dev Calculate USDC redemption amount for given AST amount
     * @param astAmount Amount of AST tokens
     * @return USDC amount (6 decimals)
     */
    function calculateRedemption(uint256 astAmount) public view returns (uint256) {
        require(proceedsDeposited, "Proceeds not yet deposited");

        // Calculate proportional share: (astAmount / TOTAL_SUPPLY) * totalProceeds
        // Handle decimal precision carefully
        return (astAmount * totalProceeds) / TOTAL_AST_SUPPLY;
    }

    /**
     * @dev Get final price per AST token
     * @return Price in USDC per AST token (6 decimals)
     */
    function finalPricePerToken() external view returns (uint256) {
        require(proceedsDeposited, "Proceeds not yet deposited");
        return (totalProceeds * 10**18) / TOTAL_AST_SUPPLY;
    }

    /**
     * @dev Get remaining USDC available for redemption
     * @return USDC amount
     */
    function remainingProceeds() external view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }

    /**
     * @dev Calculate total return percentage
     * @param initialInvestment Initial investment amount in USDC
     * @return Return percentage in basis points (e.g., 1500 = 15%)
     */
    function calculateReturn(uint256 initialInvestment) external view returns (uint256) {
        require(proceedsDeposited, "Proceeds not yet deposited");
        require(initialInvestment > 0, "Invalid initial investment");

        if (totalProceeds <= initialInvestment) {
            return 0;
        }

        uint256 profit = totalProceeds - initialInvestment;
        return (profit * 10000) / initialInvestment;
    }

    /**
     * @dev Emergency withdraw function for owner
     * @notice Only callable if something goes wrong
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 usdcBalance = usdcToken.balanceOf(address(this));
        if (usdcBalance > 0) {
            require(usdcToken.transfer(owner(), usdcBalance), "USDC transfer failed");
        }

        uint256 astBalance = astToken.balanceOf(address(this));
        if (astBalance > 0) {
            require(astToken.transfer(owner(), astBalance), "AST transfer failed");
        }
    }
}
