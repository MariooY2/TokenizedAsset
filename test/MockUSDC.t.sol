// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/mocks/MockUSDC.sol";

contract MockUSDCTest is Test {
    MockUSDC public usdc;
    address public user1 = address(0x1);
    address public user2 = address(0x2);

    function setUp() public {
        usdc = new MockUSDC();
    }

    function testMetadata() public {
        assertEq(usdc.name(), "USD Coin");
        assertEq(usdc.symbol(), "USDC");
        assertEq(usdc.decimals(), 6);
    }

    function testMint() public {
        uint256 amount = 1000 * 10**6; // 1000 USDC
        usdc.mint(user1, amount);
        assertEq(usdc.balanceOf(user1), amount);
    }

    function testTransfer() public {
        uint256 amount = 1000 * 10**6;
        usdc.mint(user1, amount);

        vm.prank(user1);
        usdc.transfer(user2, 500 * 10**6);

        assertEq(usdc.balanceOf(user1), 500 * 10**6);
        assertEq(usdc.balanceOf(user2), 500 * 10**6);
    }

    function testApproveAndTransferFrom() public {
        uint256 amount = 1000 * 10**6;
        usdc.mint(user1, amount);

        vm.prank(user1);
        usdc.approve(user2, 500 * 10**6);

        assertEq(usdc.allowance(user1, user2), 500 * 10**6);

        vm.prank(user2);
        usdc.transferFrom(user1, user2, 500 * 10**6);

        assertEq(usdc.balanceOf(user1), 500 * 10**6);
        assertEq(usdc.balanceOf(user2), 500 * 10**6);
    }

    function testBurn() public {
        uint256 amount = 1000 * 10**6;
        usdc.mint(user1, amount);

        vm.prank(user1);
        usdc.burn(500 * 10**6);

        assertEq(usdc.balanceOf(user1), 500 * 10**6);
    }

    function testAnyoneCanMint() public {
        uint256 amount = 1000 * 10**6;

        // Anyone can mint
        vm.prank(user1);
        usdc.mint(user2, amount);

        assertEq(usdc.balanceOf(user2), amount);
    }
}
