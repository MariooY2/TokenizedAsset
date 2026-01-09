// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/core/IdentityRegistry.sol";

contract IdentityRegistryTest is Test {
    IdentityRegistry public registry;

    address public admin;
    address public investor1;
    address public investor2;

    event AddedToWhitelist(address indexed investor, uint256 expiryDate, string country);
    event RemovedFromWhitelist(address indexed investor);
    event KYCRenewed(address indexed investor, uint256 newExpiry);

    function setUp() public {
        admin = address(this);
        investor1 = makeAddr("investor1");
        investor2 = makeAddr("investor2");

        registry = new IdentityRegistry();
    }

    function testAddToWhitelist() public {
        uint256 expiry = block.timestamp + 365 days;

        vm.expectEmit(true, false, false, true);
        emit AddedToWhitelist(investor1, expiry, "US");

        registry.addToWhitelist(investor1, expiry, "US");

        assertTrue(registry.isVerified(investor1));

        IIdentityRegistry.Identity memory identity = registry.getIdentity(investor1);
        assertEq(identity.isVerified, true);
        assertEq(identity.expiryDate, expiry);
        assertEq(identity.country, "US");
    }

    function testCannotAddWithZeroAddress() public {
        uint256 expiry = block.timestamp + 365 days;

        vm.expectRevert("Invalid investor address");
        registry.addToWhitelist(address(0), expiry, "US");
    }

    function testCannotAddWithPastExpiry() public {
        uint256 expiry = block.timestamp - 1 days;

        vm.expectRevert("Expiry must be in future");
        registry.addToWhitelist(investor1, expiry, "US");
    }

    function testCannotAddWithoutCountry() public {
        uint256 expiry = block.timestamp + 365 days;

        vm.expectRevert("Country required");
        registry.addToWhitelist(investor1, expiry, "");
    }

    function testRemoveFromWhitelist() public {
        uint256 expiry = block.timestamp + 365 days;
        registry.addToWhitelist(investor1, expiry, "US");

        assertTrue(registry.isVerified(investor1));

        vm.expectEmit(true, false, false, false);
        emit RemovedFromWhitelist(investor1);

        registry.removeFromWhitelist(investor1);

        assertFalse(registry.isVerified(investor1));
    }

    function testRenewKYC() public {
        uint256 expiry = block.timestamp + 365 days;
        registry.addToWhitelist(investor1, expiry, "US");

        uint256 newExpiry = block.timestamp + 730 days;

        vm.expectEmit(true, false, false, true);
        emit KYCRenewed(investor1, newExpiry);

        registry.renewKYC(investor1, newExpiry);

        IIdentityRegistry.Identity memory identity = registry.getIdentity(investor1);
        assertEq(identity.expiryDate, newExpiry);
    }

    function testExpiredKYCNotVerified() public {
        uint256 expiry = block.timestamp + 1 days;
        registry.addToWhitelist(investor1, expiry, "US");

        assertTrue(registry.isVerified(investor1));

        vm.warp(block.timestamp + 2 days);

        assertFalse(registry.isVerified(investor1));
    }

    function testOnlyAdminCanAddToWhitelist() public {
        uint256 expiry = block.timestamp + 365 days;

        vm.prank(investor1);
        vm.expectRevert();
        registry.addToWhitelist(investor2, expiry, "US");
    }

    function testMultipleInvestors() public {
        uint256 expiry = block.timestamp + 365 days;

        registry.addToWhitelist(investor1, expiry, "US");
        registry.addToWhitelist(investor2, expiry, "UK");

        assertTrue(registry.isVerified(investor1));
        assertTrue(registry.isVerified(investor2));

        assertEq(registry.getIdentity(investor1).country, "US");
        assertEq(registry.getIdentity(investor2).country, "UK");
    }
}
