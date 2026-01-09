// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IIdentityRegistry
 * @dev Interface for managing investor KYC verification based on ERC-3643 principles
 */
interface IIdentityRegistry {
    struct Identity {
        bool isVerified;
        uint256 approvedAt;
        uint256 expiryDate;
        string country;
    }

    event AddedToWhitelist(address indexed investor, uint256 expiryDate, string country);
    event RemovedFromWhitelist(address indexed investor);
    event KYCRenewed(address indexed investor, uint256 newExpiry);

    function addToWhitelist(address investor, uint256 expiryDate, string calldata country) external;
    function removeFromWhitelist(address investor) external;
    function isVerified(address investor) external view returns (bool);
    function renewKYC(address investor, uint256 newExpiry) external;
    function getIdentity(address investor) external view returns (Identity memory);
}
