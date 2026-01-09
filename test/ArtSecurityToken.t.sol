// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/core/ArtSecurityToken.sol";
import "../src/core/IdentityRegistry.sol";

contract ArtSecurityTokenTest is Test {
    ArtSecurityToken public token;
    IdentityRegistry public registry;

    address public owner;
    address public investor1;
    address public investor2;

    function setUp() public {
        owner = address(this);
        investor1 = makeAddr("investor1");
        investor2 = makeAddr("investor2");

        registry = new IdentityRegistry();
        token = new ArtSecurityToken(
            address(registry),
            "Fillette au beret",
            "Pablo Picasso",
            1937,
            4000000 * 10**6
        );
    }

    function testInitialState() public {
        assertEq(token.name(), "Art Security Token - Fillette au beret");
        assertEq(token.symbol(), "AST");
        assertEq(token.totalSupply(), 2000 * 10**18);
        assertEq(token.balanceOf(owner), 2000 * 10**18);
        assertEq(token.artworkName(), "Fillette au beret");
        assertEq(token.artist(), "Pablo Picasso");
        assertEq(token.creationYear(), 1937);
        assertEq(token.initialValuation(), 4000000 * 10**6);
    }

    function testTransferRequiresKYC() public {
        uint256 expiry = block.timestamp + 365 days;
        registry.addToWhitelist(investor1, expiry, "US");

        uint256 amount = 10 * 10**18;
        token.transfer(investor1, amount);

        assertEq(token.balanceOf(investor1), amount);
    }

    function testCannotTransferToNonKYC() public {
        uint256 amount = 10 * 10**18;

        vm.expectRevert("Recipient not KYC verified");
        token.transfer(investor1, amount);
    }

    function testCannotTransferFromNonKYC() public {
        uint256 expiry = block.timestamp + 365 days;
        registry.addToWhitelist(investor1, expiry, "US");
        registry.addToWhitelist(investor2, expiry, "US");

        uint256 amount = 10 * 10**18;
        token.transfer(investor1, amount);

        vm.prank(investor1);
        token.approve(investor2, amount);

        vm.warp(block.timestamp + 400 days);

        vm.prank(investor2);
        vm.expectRevert("Sender not KYC verified");
        token.transferFrom(investor1, investor2, amount);
    }

    function testTransfersDisabledOutsideLiquidityWindow() public {
        uint256 expiry = block.timestamp + 365 days;
        registry.addToWhitelist(investor1, expiry, "US");
        registry.addToWhitelist(investor2, expiry, "US");

        uint256 amount = 10 * 10**18;
        token.transfer(investor1, amount);

        vm.prank(investor1);
        vm.expectRevert("Transfers disabled outside liquidity window");
        token.transfer(investor2, amount);
    }

    function testTransfersEnabledDuringLiquidityWindow() public {
        uint256 expiry = block.timestamp + 365 days;
        registry.addToWhitelist(investor1, expiry, "US");
        registry.addToWhitelist(investor2, expiry, "US");

        uint256 amount = 10 * 10**18;
        token.transfer(investor1, amount);

        token.setTransfersEnabled(true);

        vm.prank(investor1);
        token.transfer(investor2, amount / 2);

        assertEq(token.balanceOf(investor2), amount / 2);
    }

    function testOwnerCanAlwaysTransfer() public {
        uint256 expiry = block.timestamp + 365 days;
        registry.addToWhitelist(investor1, expiry, "US");

        uint256 amount = 10 * 10**18;
        token.transfer(investor1, amount);

        assertEq(token.balanceOf(investor1), amount);
    }

    function testSetTransfersEnabled() public {
        assertFalse(token.transfersEnabled());

        token.setTransfersEnabled(true);
        assertTrue(token.transfersEnabled());

        token.setTransfersEnabled(false);
        assertFalse(token.transfersEnabled());
    }

    function testOnlyOwnerCanSetTransfersEnabled() public {
        vm.prank(investor1);
        vm.expectRevert();
        token.setTransfersEnabled(true);
    }

    function testIsCompliant() public {
        assertFalse(token.isCompliant(investor1));

        uint256 expiry = block.timestamp + 365 days;
        registry.addToWhitelist(investor1, expiry, "US");

        assertTrue(token.isCompliant(investor1));
    }
}
