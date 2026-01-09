// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../interfaces/IIdentityRegistry.sol";

/**
 * @title IdentityRegistry
 * @dev Manages KYC whitelist for art tokenization platform
 * @notice Based on ERC-3643 identity management principles
 */
contract IdentityRegistry is IIdentityRegistry, AccessControl {
    bytes32 public constant KYC_ADMIN_ROLE = keccak256("KYC_ADMIN_ROLE");

    mapping(address => Identity) private identities;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(KYC_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Add an investor to the whitelist after KYC approval
     * @param investor Address of the investor
     * @param expiryDate Timestamp when KYC expires
     * @param country Country code of the investor
     */
    function addToWhitelist(
        address investor,
        uint256 expiryDate,
        string calldata country
    ) external onlyRole(KYC_ADMIN_ROLE) {
        require(investor != address(0), "Invalid investor address");
        require(expiryDate > block.timestamp, "Expiry must be in future");
        require(bytes(country).length > 0, "Country required");

        identities[investor] = Identity({
            isVerified: true,
            approvedAt: block.timestamp,
            expiryDate: expiryDate,
            country: country
        });

        emit AddedToWhitelist(investor, expiryDate, country);
    }

    /**
     * @dev Remove an investor from the whitelist
     * @param investor Address to remove
     */
    function removeFromWhitelist(address investor) external onlyRole(KYC_ADMIN_ROLE) {
        require(identities[investor].isVerified, "Investor not whitelisted");

        delete identities[investor];

        emit RemovedFromWhitelist(investor);
    }

    /**
     * @dev Check if an investor is verified and not expired
     * @param investor Address to check
     * @return bool True if verified and not expired
     */
    function isVerified(address investor) external view returns (bool) {
        Identity memory identity = identities[investor];
        return identity.isVerified && identity.expiryDate > block.timestamp;
    }

    /**
     * @dev Renew KYC expiry for an existing investor
     * @param investor Address to renew
     * @param newExpiry New expiry timestamp
     */
    function renewKYC(address investor, uint256 newExpiry) external onlyRole(KYC_ADMIN_ROLE) {
        require(identities[investor].isVerified, "Investor not whitelisted");
        require(newExpiry > block.timestamp, "Expiry must be in future");

        identities[investor].expiryDate = newExpiry;

        emit KYCRenewed(investor, newExpiry);
    }

    /**
     * @dev Get full identity information for an investor
     * @param investor Address to query
     * @return Identity struct with all details
     */
    function getIdentity(address investor) external view returns (Identity memory) {
        return identities[investor];
    }
}
