// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ArtPriceOracle
 * @dev Provides artwork valuation feed from authorized oracles
 * @notice Multiple oracles can update price, tracks freshness
 */
contract ArtPriceOracle is AccessControl {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    uint256 private _currentPrice;
    uint256 private _lastUpdateTime;
    address private _lastUpdater;

    uint256 public constant STALENESS_THRESHOLD = 90 days;

    event PriceUpdated(uint256 newPrice, uint256 timestamp, address indexed updater);

    constructor(uint256 initialPrice) {
        require(initialPrice > 0, "Initial price must be greater than 0");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);

        _currentPrice = initialPrice;
        _lastUpdateTime = block.timestamp;
        _lastUpdater = msg.sender;

        emit PriceUpdated(initialPrice, block.timestamp, msg.sender);
    }

    /**
     * @dev Update the artwork price
     * @param newPrice New valuation in USD (18 decimals)
     */
    function updatePrice(uint256 newPrice) external onlyRole(ORACLE_ROLE) {
        require(newPrice > 0, "Price must be greater than 0");

        _currentPrice = newPrice;
        _lastUpdateTime = block.timestamp;
        _lastUpdater = msg.sender;

        emit PriceUpdated(newPrice, block.timestamp, msg.sender);
    }

    /**
     * @dev Get current artwork price
     * @return Current price in USD (18 decimals)
     */
    function currentPrice() external view returns (uint256) {
        return _currentPrice;
    }

    /**
     * @dev Get timestamp of last price update
     * @return Unix timestamp
     */
    function lastUpdateTime() external view returns (uint256) {
        return _lastUpdateTime;
    }

    /**
     * @dev Get address of last updater
     * @return Address that performed last update
     */
    function lastUpdater() external view returns (address) {
        return _lastUpdater;
    }

    /**
     * @dev Check if price data is stale
     * @return True if last update was more than 90 days ago
     */
    function isPriceStale() external view returns (bool) {
        return block.timestamp > _lastUpdateTime + STALENESS_THRESHOLD;
    }

    /**
     * @dev Get time until price becomes stale
     * @return Seconds until staleness, 0 if already stale
     */
    function timeUntilStale() external view returns (uint256) {
        uint256 staleTime = _lastUpdateTime + STALENESS_THRESHOLD;
        if (block.timestamp >= staleTime) {
            return 0;
        }
        return staleTime - block.timestamp;
    }

    /**
     * @dev Add a new oracle address
     * @param oracle Address to grant oracle role
     */
    function addOracle(address oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(oracle != address(0), "Invalid oracle address");
        grantRole(ORACLE_ROLE, oracle);
    }

    /**
     * @dev Remove an oracle address
     * @param oracle Address to revoke oracle role
     */
    function removeOracle(address oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ORACLE_ROLE, oracle);
    }
}
