// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IIdentityRegistry.sol";

/**
 * @title PrimarySale
 * @dev Handles initial distribution of Art Security Tokens
 * @notice Investors buy AST tokens with USDC at fixed price
 */
contract PrimarySale is Ownable, ReentrancyGuard {
    IERC20 public immutable astToken;
    IERC20 public immutable usdcToken;
    IIdentityRegistry public immutable identityRegistry;

    uint256 public constant PRICE_PER_TOKEN = 2000 * 10**6; // 2000 USDC (6 decimals)
    uint256 public totalSold;
    bool public saleActive = true;

    event TokensPurchased(address indexed buyer, uint256 astAmount, uint256 usdcAmount);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event SaleClosed();

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
     * @dev Purchase AST tokens with USDC
     * @param amount Number of AST tokens to buy (in wei, 18 decimals)
     */
    function buyTokens(uint256 amount) external nonReentrant {
        require(saleActive, "Sale is closed");
        require(amount > 0, "Amount must be greater than 0");
        require(identityRegistry.isVerified(msg.sender), "Buyer not KYC verified");

        uint256 usdcAmount = (amount * PRICE_PER_TOKEN) / 10**18;
        require(usdcAmount > 0, "USDC amount too small");

        // Check AST token availability
        uint256 available = astToken.balanceOf(address(this));
        require(available >= amount, "Insufficient AST tokens available");

        // Transfer USDC from buyer to this contract
        require(
            usdcToken.transferFrom(msg.sender, address(this), usdcAmount),
            "USDC transfer failed"
        );

        // Transfer AST tokens to buyer
        require(astToken.transfer(msg.sender, amount), "AST transfer failed");

        totalSold += amount;

        emit TokensPurchased(msg.sender, amount, usdcAmount);
    }

    /**
     * @dev Withdraw collected USDC funds
     * @notice Only owner can withdraw
     */
    function withdrawFunds() external onlyOwner {
        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance > 0, "No funds to withdraw");

        require(usdcToken.transfer(owner(), balance), "USDC withdrawal failed");

        emit FundsWithdrawn(owner(), balance);
    }

    /**
     * @dev Close the primary sale
     * @notice Unsold tokens can be withdrawn by owner
     */
    function closeSale() external onlyOwner {
        require(saleActive, "Sale already closed");

        saleActive = false;

        // Return unsold AST tokens to owner
        uint256 remaining = astToken.balanceOf(address(this));
        if (remaining > 0) {
            require(astToken.transfer(owner(), remaining), "AST return failed");
        }

        emit SaleClosed();
    }

    /**
     * @dev Get the USDC cost for a specific AST amount
     * @param astAmount Amount of AST tokens
     * @return USDC cost in 6 decimals
     */
    function calculateCost(uint256 astAmount) external pure returns (uint256) {
        return (astAmount * PRICE_PER_TOKEN) / 10**18;
    }

    /**
     * @dev Get remaining AST tokens available for sale
     * @return Available token count
     */
    function remainingTokens() external view returns (uint256) {
        return astToken.balanceOf(address(this));
    }
}
