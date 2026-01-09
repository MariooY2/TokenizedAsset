// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/distribution/PrimarySale.sol";
import "../src/core/ArtSecurityToken.sol";
import "../src/core/IdentityRegistry.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("USDC", "USDC") {
        _mint(msg.sender, 10000000 * 10**6);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract PrimarySaleTest is Test {
    PrimarySale public sale;
    ArtSecurityToken public ast;
    MockUSDC public usdc;
    IdentityRegistry public registry;

    address public owner;
    address public investor1;
    address public investor2;

    function setUp() public {
        owner = address(this);
        investor1 = makeAddr("investor1");
        investor2 = makeAddr("investor2");

        registry = new IdentityRegistry();
        ast = new ArtSecurityToken(
            address(registry),
            "Fillette au beret",
            "Pablo Picasso",
            1937,
            4000000 * 10**6
        );
        usdc = new MockUSDC();

        sale = new PrimarySale(address(ast), address(usdc), address(registry));

        ast.transfer(address(sale), 2000 * 10**18);

        uint256 expiry = block.timestamp + 365 days;
        registry.addToWhitelist(investor1, expiry, "US");
        registry.addToWhitelist(investor2, expiry, "UK");

        usdc.mint(investor1, 10000000 * 10**6);
        usdc.mint(investor2, 10000000 * 10**6);
    }

    function testBuyTokens() public {
        uint256 astAmount = 5 * 10**18;
        uint256 usdcCost = sale.calculateCost(astAmount);

        assertEq(usdcCost, 10000 * 10**6);

        vm.startPrank(investor1);
        usdc.approve(address(sale), usdcCost);
        sale.buyTokens(astAmount);
        vm.stopPrank();

        assertEq(ast.balanceOf(investor1), astAmount);
        assertEq(usdc.balanceOf(address(sale)), usdcCost);
    }

    function testCannotBuyWithoutKYC() public {
        address nonKYC = makeAddr("nonKYC");
        usdc.mint(nonKYC, 10000 * 10**6);

        uint256 astAmount = 5 * 10**18;
        uint256 usdcCost = sale.calculateCost(astAmount);

        vm.startPrank(nonKYC);
        usdc.approve(address(sale), usdcCost);
        vm.expectRevert("Buyer not KYC verified");
        sale.buyTokens(astAmount);
        vm.stopPrank();
    }

    function testCannotBuyWhenSaleClosed() public {
        sale.closeSale();

        uint256 astAmount = 5 * 10**18;
        uint256 usdcCost = sale.calculateCost(astAmount);

        vm.startPrank(investor1);
        usdc.approve(address(sale), usdcCost);
        vm.expectRevert("Sale is closed");
        sale.buyTokens(astAmount);
        vm.stopPrank();
    }

    function testWithdrawFunds() public {
        uint256 astAmount = 5 * 10**18;
        uint256 usdcCost = sale.calculateCost(astAmount);

        vm.startPrank(investor1);
        usdc.approve(address(sale), usdcCost);
        sale.buyTokens(astAmount);
        vm.stopPrank();

        uint256 ownerBalanceBefore = usdc.balanceOf(owner);

        sale.withdrawFunds();

        assertEq(usdc.balanceOf(owner), ownerBalanceBefore + usdcCost);
        assertEq(usdc.balanceOf(address(sale)), 0);
    }

    function testCloseSale() public {
        uint256 remainingBefore = sale.remainingTokens();

        sale.closeSale();

        assertFalse(sale.saleActive());
        assertEq(ast.balanceOf(owner), remainingBefore);
    }

    function testRemainingTokens() public {
        assertEq(sale.remainingTokens(), 2000 * 10**18);

        uint256 astAmount = 5 * 10**18;
        uint256 usdcCost = sale.calculateCost(astAmount);

        vm.startPrank(investor1);
        usdc.approve(address(sale), usdcCost);
        sale.buyTokens(astAmount);
        vm.stopPrank();

        assertEq(sale.remainingTokens(), (2000 * 10**18) - astAmount);
    }

    function testCalculateCost() public {
        assertEq(sale.calculateCost(1 * 10**18), 2000 * 10**6);
        assertEq(sale.calculateCost(10 * 10**18), 20000 * 10**6);
        assertEq(sale.calculateCost(100 * 10**18), 200000 * 10**6);
    }

    function testTotalSoldTracking() public {
        uint256 astAmount = 5 * 10**18;
        uint256 usdcCost = sale.calculateCost(astAmount);

        vm.startPrank(investor1);
        usdc.approve(address(sale), usdcCost);
        sale.buyTokens(astAmount);
        vm.stopPrank();

        assertEq(sale.totalSold(), astAmount);

        vm.startPrank(investor2);
        usdc.approve(address(sale), usdcCost);
        sale.buyTokens(astAmount);
        vm.stopPrank();

        assertEq(sale.totalSold(), astAmount * 2);
    }
}
