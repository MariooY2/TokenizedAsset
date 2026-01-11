// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/governance/GovernanceContract.sol";
import "../src/core/ArtSecurityToken.sol";
import "../src/core/IdentityRegistry.sol";

contract GovernanceContractTest is Test {
    GovernanceContract public governance;
    ArtSecurityToken public ast;
    IdentityRegistry public registry;

    address public owner;
    address public spv;
    address public artAdvisor;

    event ProposalCreated(
        uint256 indexed proposalId,
        GovernanceContract.ProposalType proposalType,
        address indexed proposer,
        string description
    );
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);

    function setUp() public {
        owner = address(this);
        spv = makeAddr("spv");
        artAdvisor = makeAddr("artAdvisor");

        governance = new GovernanceContract(spv, artAdvisor);

        registry = new IdentityRegistry();

        // Whitelist owner for initial token minting
        uint256 expiry = block.timestamp + 365 days;
        registry.addToWhitelist(owner, expiry, "US");

        ast = new ArtSecurityToken(
            address(registry),
            "Fillette au beret",
            "Pablo Picasso",
            1937,
            4000000 * 10**6
        );

        governance.setASTToken(address(ast));

        // Transfer AST ownership to governance contract so it can control transfers
        ast.transferOwnership(address(governance));
    }

    function testInitialGovernanceTokens() public {
        (address holder1, uint256 weight1, bool active1) = governance.governanceTokens(spv);
        assertEq(holder1, spv);
        assertEq(weight1, 7000);
        assertTrue(active1);

        (address holder2, uint256 weight2, bool active2) = governance.governanceTokens(artAdvisor);
        assertEq(holder2, artAdvisor);
        assertEq(weight2, 3000);
        assertTrue(active2);
    }

    function testCreateProposal() public {
        vm.prank(spv);
        uint256 proposalId = governance.createProposal(
            GovernanceContract.ProposalType.EMERGENCY_PAUSE,
            "Emergency pause due to security issue",
            ""
        );

        assertEq(proposalId, 1);
        assertEq(governance.proposalCount(), 1);

        (
            uint256 id,
            GovernanceContract.ProposalType proposalType,
            string memory description,
            address proposer,
            uint256 createdAt,
            uint256 votingEnds,
            uint256 votesFor,
            uint256 votesAgainst,
            GovernanceContract.ProposalStatus status
        ) = governance.getProposal(proposalId);

        assertEq(id, proposalId);
        assertTrue(proposalType == GovernanceContract.ProposalType.EMERGENCY_PAUSE);
        assertEq(description, "Emergency pause due to security issue");
        assertEq(proposer, spv);
        assertEq(createdAt, block.timestamp);
        assertEq(votingEnds, block.timestamp + 7 days);
        assertEq(votesFor, 0);
        assertEq(votesAgainst, 0);
        assertTrue(status == GovernanceContract.ProposalStatus.Active);
    }

    function testOnlyGovernanceTokenHolderCanCreateProposal() public {
        address nonHolder = makeAddr("nonHolder");

        vm.prank(nonHolder);
        vm.expectRevert("Not a governance token holder");
        governance.createProposal(
            GovernanceContract.ProposalType.EMERGENCY_PAUSE,
            "Test",
            ""
        );
    }

    function testVoteOnProposal() public {
        vm.prank(spv);
        uint256 proposalId = governance.createProposal(
            GovernanceContract.ProposalType.EXIT_SALE,
            "Exit sale proposal",
            ""
        );

        vm.prank(spv);
        governance.vote(proposalId, true);

        (, , , , , , uint256 votesFor, uint256 votesAgainst, ) = governance.getProposal(proposalId);

        assertEq(votesFor, 7000);
        assertEq(votesAgainst, 0);
    }

    function testBothPartiesVote() public {
        vm.prank(spv);
        uint256 proposalId = governance.createProposal(
            GovernanceContract.ProposalType.EXIT_SALE,
            "Exit sale proposal",
            ""
        );

        vm.prank(spv);
        governance.vote(proposalId, true);

        vm.prank(artAdvisor);
        governance.vote(proposalId, false);

        (, , , , , , uint256 votesFor, uint256 votesAgainst, ) = governance.getProposal(proposalId);

        assertEq(votesFor, 7000);
        assertEq(votesAgainst, 3000);
    }

    function testCannotVoteTwice() public {
        vm.prank(spv);
        uint256 proposalId = governance.createProposal(
            GovernanceContract.ProposalType.EXIT_SALE,
            "Exit sale proposal",
            ""
        );

        vm.prank(spv);
        governance.vote(proposalId, true);

        vm.prank(spv);
        vm.expectRevert("Already voted");
        governance.vote(proposalId, true);
    }

    function testCannotVoteAfterVotingPeriod() public {
        vm.prank(spv);
        uint256 proposalId = governance.createProposal(
            GovernanceContract.ProposalType.EXIT_SALE,
            "Exit sale proposal",
            ""
        );

        vm.warp(block.timestamp + 8 days);

        vm.prank(spv);
        vm.expectRevert("Voting period ended");
        governance.vote(proposalId, true);
    }

    function testExecuteProposal() public {
        vm.prank(spv);
        uint256 proposalId = governance.createProposal(
            GovernanceContract.ProposalType.EMERGENCY_PAUSE,
            "Emergency pause",
            ""
        );

        vm.prank(spv);
        governance.vote(proposalId, true);

        vm.warp(block.timestamp + 8 days);

        governance.executeProposal(proposalId);

        (, , , , , , , , GovernanceContract.ProposalStatus status) = governance.getProposal(proposalId);
        assertTrue(status == GovernanceContract.ProposalStatus.Executed);

        assertFalse(ast.transfersEnabled());
    }

    function testCannotExecuteWithoutQuorum() public {
        vm.prank(spv);
        uint256 proposalId = governance.createProposal(
            GovernanceContract.ProposalType.EXIT_SALE,
            "Exit sale proposal",
            ""
        );

        vm.warp(block.timestamp + 8 days);

        vm.expectRevert("Quorum not reached");
        governance.executeProposal(proposalId);
    }

    function testCannotExecuteRejectedProposal() public {
        vm.prank(spv);
        uint256 proposalId = governance.createProposal(
            GovernanceContract.ProposalType.EXIT_SALE,
            "Exit sale proposal",
            ""
        );

        vm.prank(spv);
        governance.vote(proposalId, false);

        vm.prank(artAdvisor);
        governance.vote(proposalId, false);

        vm.warp(block.timestamp + 8 days);

        vm.expectRevert("Proposal rejected");
        governance.executeProposal(proposalId);
    }

    function testCancelProposal() public {
        vm.prank(spv);
        uint256 proposalId = governance.createProposal(
            GovernanceContract.ProposalType.EXIT_SALE,
            "Exit sale proposal",
            ""
        );

        vm.prank(spv);
        governance.cancelProposal(proposalId);

        (, , , , , , , , GovernanceContract.ProposalStatus status) = governance.getProposal(proposalId);
        assertTrue(status == GovernanceContract.ProposalStatus.Cancelled);
    }

    function testHasVoted() public {
        vm.prank(spv);
        uint256 proposalId = governance.createProposal(
            GovernanceContract.ProposalType.EXIT_SALE,
            "Exit sale proposal",
            ""
        );

        assertFalse(governance.hasVoted(proposalId, spv));

        vm.prank(spv);
        governance.vote(proposalId, true);

        assertTrue(governance.hasVoted(proposalId, spv));
    }

    function testHasProposalPassed() public {
        vm.prank(spv);
        uint256 proposalId = governance.createProposal(
            GovernanceContract.ProposalType.EXIT_SALE,
            "Exit sale proposal",
            ""
        );

        assertFalse(governance.hasProposalPassed(proposalId));

        vm.prank(spv);
        governance.vote(proposalId, true);

        assertTrue(governance.hasProposalPassed(proposalId));
    }

    function testExecuteEnableTransfers() public {
        bytes memory data = abi.encode(true);

        vm.prank(spv);
        uint256 proposalId = governance.createProposal(
            GovernanceContract.ProposalType.ENABLE_TRANSFERS,
            "Enable transfers for liquidity window",
            data
        );

        vm.prank(spv);
        governance.vote(proposalId, true);

        vm.warp(block.timestamp + 8 days);

        governance.executeProposal(proposalId);

        assertTrue(ast.transfersEnabled());
    }
}
