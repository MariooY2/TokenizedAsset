// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/distribution/ExitDistribution.sol";
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

contract ExitDistributionTest is Test {
    ExitDistribution public exitDist;
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

        uint256 expiry = block.timestamp + 365 days;

        // Whitelist owner and investors
        registry.addToWhitelist(owner, expiry, "US");
        registry.addToWhitelist(investor1, expiry, "US");
        registry.addToWhitelist(investor2, expiry, "UK");

        ast = new ArtSecurityToken(
            address(registry),
            "Fillette au beret",
            "Pablo Picasso",
            1937,
            4000000 * 10**6
        );
        usdc = new MockUSDC();

        exitDist = new ExitDistribution(address(ast), address(usdc), address(registry));

        // Whitelist exit distribution contract for receiving burned tokens
        registry.addToWhitelist(address(exitDist), expiry, "US");

        ast.transfer(investor1, 1000 * 10**18);
        ast.transfer(investor2, 500 * 10**18);

        // Enable transfers for redemption period
        ast.setTransfersEnabled(true);
    }

    function testDepositProceeds() public {
        uint256 proceeds = 4600000 * 10**6; // 15% return on 4M

        usdc.approve(address(exitDist), proceeds);
        exitDist.depositProceeds(proceeds);

        assertTrue(exitDist.proceedsDeposited());
        assertEq(exitDist.totalProceeds(), proceeds);
    }

    function testCannotDepositProceedsTwice() public {
        uint256 proceeds = 4600000 * 10**6;

        usdc.approve(address(exitDist), proceeds);
        exitDist.depositProceeds(proceeds);

        vm.expectRevert("Proceeds already deposited");
        exitDist.depositProceeds(proceeds);
    }

    function testRedeem() public {
        uint256 proceeds = 4600000 * 10**6;
        usdc.approve(address(exitDist), proceeds);
        exitDist.depositProceeds(proceeds);

        uint256 astAmount = 100 * 10**18;
        uint256 expectedUSDC = exitDist.calculateRedemption(astAmount);

        vm.startPrank(investor1);
        ast.approve(address(exitDist), astAmount);
        exitDist.redeem(astAmount);
        vm.stopPrank();

        assertEq(usdc.balanceOf(investor1), expectedUSDC);
        assertEq(exitDist.totalRedeemed(), expectedUSDC);
    }

    function testCalculateRedemption() public {
        uint256 proceeds = 4600000 * 10**6;
        usdc.approve(address(exitDist), proceeds);
        exitDist.depositProceeds(proceeds);

        uint256 astAmount = 1000 * 10**18;
        uint256 expectedUSDC = (astAmount * proceeds) / (2000 * 10**18);

        assertEq(exitDist.calculateRedemption(astAmount), expectedUSDC);
    }

    function testFinalPricePerToken() public {
        uint256 proceeds = 4600000 * 10**6;
        usdc.approve(address(exitDist), proceeds);
        exitDist.depositProceeds(proceeds);

        uint256 pricePerToken = exitDist.finalPricePerToken();
        assertEq(pricePerToken, 2300 * 10**6);
    }

    function testCannotRedeemWithoutProceeds() public {
        uint256 astAmount = 100 * 10**18;

        vm.startPrank(investor1);
        ast.approve(address(exitDist), astAmount);
        vm.expectRevert("Proceeds not yet deposited");
        exitDist.redeem(astAmount);
        vm.stopPrank();
    }

    function testCannotRedeemWithoutKYC() public {
        uint256 proceeds = 4600000 * 10**6;
        usdc.approve(address(exitDist), proceeds);
        exitDist.depositProceeds(proceeds);

        vm.warp(block.timestamp + 400 days);

        uint256 astAmount = 100 * 10**18;

        vm.startPrank(investor1);
        ast.approve(address(exitDist), astAmount);
        vm.expectRevert("User not KYC verified");
        exitDist.redeem(astAmount);
        vm.stopPrank();
    }

    function testCalculateReturn() public {
        uint256 initialInvestment = 4000000 * 10**6;
        uint256 proceeds = 4600000 * 10**6;

        usdc.approve(address(exitDist), proceeds);
        exitDist.depositProceeds(proceeds);

        uint256 returnBps = exitDist.calculateReturn(initialInvestment);
        assertEq(returnBps, 1500); // 15%
    }

    function testMultipleRedemptions() public {
        uint256 proceeds = 4600000 * 10**6;
        usdc.approve(address(exitDist), proceeds);
        exitDist.depositProceeds(proceeds);

        uint256 astAmount1 = 500 * 10**18;
        vm.startPrank(investor1);
        ast.approve(address(exitDist), astAmount1);
        exitDist.redeem(astAmount1);
        vm.stopPrank();

        uint256 astAmount2 = 250 * 10**18;
        vm.startPrank(investor2);
        ast.approve(address(exitDist), astAmount2);
        exitDist.redeem(astAmount2);
        vm.stopPrank();

        uint256 expectedTotal = exitDist.calculateRedemption(astAmount1) +
            exitDist.calculateRedemption(astAmount2);

        assertEq(exitDist.totalRedeemed(), expectedTotal);
    }

    function testRemainingProceeds() public {
        uint256 proceeds = 4600000 * 10**6;
        usdc.approve(address(exitDist), proceeds);
        exitDist.depositProceeds(proceeds);

        assertEq(exitDist.remainingProceeds(), proceeds);

        uint256 astAmount = 500 * 10**18;
        uint256 expectedRedemption = exitDist.calculateRedemption(astAmount);

        vm.startPrank(investor1);
        ast.approve(address(exitDist), astAmount);
        exitDist.redeem(astAmount);
        vm.stopPrank();

        assertEq(exitDist.remainingProceeds(), proceeds - expectedRedemption);
    }

    function testEmergencyWithdraw() public {
        uint256 proceeds = 4600000 * 10**6;
        usdc.approve(address(exitDist), proceeds);
        exitDist.depositProceeds(proceeds);

        uint256 ownerBalanceBefore = usdc.balanceOf(owner);

        exitDist.emergencyWithdraw();

        assertEq(usdc.balanceOf(owner), ownerBalanceBefore + proceeds);
    }
}
