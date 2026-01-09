// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/defi/ArtPriceOracle.sol";

contract ArtPriceOracleTest is Test {
    ArtPriceOracle public oracle;

    address public admin;
    address public oracle1;
    address public oracle2;

    uint256 public constant INITIAL_PRICE = 4000000 * 10**18;

    event PriceUpdated(uint256 newPrice, uint256 timestamp, address indexed updater);

    function setUp() public {
        admin = address(this);
        oracle1 = makeAddr("oracle1");
        oracle2 = makeAddr("oracle2");

        oracle = new ArtPriceOracle(INITIAL_PRICE);
    }

    function testInitialPrice() public {
        assertEq(oracle.currentPrice(), INITIAL_PRICE);
        assertEq(oracle.lastUpdateTime(), block.timestamp);
        assertEq(oracle.lastUpdater(), admin);
    }

    function testUpdatePrice() public {
        uint256 newPrice = 5000000 * 10**18;

        vm.expectEmit(true, true, true, true);
        emit PriceUpdated(newPrice, block.timestamp, admin);

        oracle.updatePrice(newPrice);

        assertEq(oracle.currentPrice(), newPrice);
        assertEq(oracle.lastUpdateTime(), block.timestamp);
        assertEq(oracle.lastUpdater(), admin);
    }

    function testCannotUpdateWithZeroPrice() public {
        vm.expectRevert("Price must be greater than 0");
        oracle.updatePrice(0);
    }

    function testMultipleOraclesCanUpdate() public {
        oracle.addOracle(oracle1);
        oracle.addOracle(oracle2);

        uint256 price1 = 4500000 * 10**18;
        vm.prank(oracle1);
        oracle.updatePrice(price1);

        assertEq(oracle.currentPrice(), price1);
        assertEq(oracle.lastUpdater(), oracle1);

        uint256 price2 = 4800000 * 10**18;
        vm.prank(oracle2);
        oracle.updatePrice(price2);

        assertEq(oracle.currentPrice(), price2);
        assertEq(oracle.lastUpdater(), oracle2);
    }

    function testOnlyOracleCanUpdatePrice() public {
        address nonOracle = makeAddr("nonOracle");

        vm.prank(nonOracle);
        vm.expectRevert();
        oracle.updatePrice(5000000 * 10**18);
    }

    function testPriceStaleness() public {
        assertFalse(oracle.isPriceStale());

        vm.warp(block.timestamp + 89 days);
        assertFalse(oracle.isPriceStale());

        vm.warp(block.timestamp + 2 days);
        assertTrue(oracle.isPriceStale());
    }

    function testTimeUntilStale() public {
        uint256 timeUntilStale = oracle.timeUntilStale();
        assertEq(timeUntilStale, 90 days);

        vm.warp(block.timestamp + 30 days);
        assertEq(oracle.timeUntilStale(), 60 days);

        vm.warp(block.timestamp + 61 days);
        assertEq(oracle.timeUntilStale(), 0);
    }

    function testAddOracle() public {
        oracle.addOracle(oracle1);

        uint256 newPrice = 4200000 * 10**18;
        vm.prank(oracle1);
        oracle.updatePrice(newPrice);

        assertEq(oracle.currentPrice(), newPrice);
    }

    function testRemoveOracle() public {
        oracle.addOracle(oracle1);

        oracle.removeOracle(oracle1);

        vm.prank(oracle1);
        vm.expectRevert();
        oracle.updatePrice(5000000 * 10**18);
    }

    function testOnlyAdminCanAddOracle() public {
        vm.prank(oracle1);
        vm.expectRevert();
        oracle.addOracle(oracle2);
    }

    function testCannotAddZeroAddressAsOracle() public {
        vm.expectRevert("Invalid oracle address");
        oracle.addOracle(address(0));
    }
}
