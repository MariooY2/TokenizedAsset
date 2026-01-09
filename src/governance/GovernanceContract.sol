// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../core/ArtSecurityToken.sol";

/**
 * @title GovernanceContract
 * @dev Governance system for key decisions: exit timing, emergency actions
 * @notice Non-transferable governance tokens weighted 70% SPV, 30% Art Advisor
 */
contract GovernanceContract is Ownable {
    enum ProposalType {
        EXIT_SALE,
        EMERGENCY_PAUSE,
        ENABLE_TRANSFERS
    }

    enum ProposalStatus {
        Pending,
        Active,
        Executed,
        Rejected,
        Cancelled
    }

    struct Proposal {
        uint256 id;
        ProposalType proposalType;
        string description;
        address proposer;
        uint256 createdAt;
        uint256 votingEnds;
        uint256 votesFor;
        uint256 votesAgainst;
        ProposalStatus status;
        bytes data;
        mapping(address => bool) hasVoted;
    }

    struct GovernanceToken {
        address holder;
        uint256 weight;
        bool isActive;
    }

    ArtSecurityToken public astToken;

    mapping(uint256 => Proposal) public proposals;
    mapping(address => GovernanceToken) public governanceTokens;

    uint256 public proposalCount;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant QUORUM_BPS = 5000; // 50%
    uint256 public constant TOTAL_GOVERNANCE_WEIGHT = 10000; // 100% in basis points

    address public spvAddress;
    address public artAdvisorAddress;

    event ProposalCreated(
        uint256 indexed proposalId,
        ProposalType proposalType,
        address indexed proposer,
        string description
    );
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);
    event GovernanceTokenIssued(address indexed holder, uint256 weight);

    constructor(address _spvAddress, address _artAdvisorAddress) Ownable(msg.sender) {
        require(_spvAddress != address(0), "Invalid SPV address");
        require(_artAdvisorAddress != address(0), "Invalid advisor address");

        spvAddress = _spvAddress;
        artAdvisorAddress = _artAdvisorAddress;

        // Issue non-transferable governance tokens
        governanceTokens[_spvAddress] = GovernanceToken({
            holder: _spvAddress,
            weight: 7000, // 70%
            isActive: true
        });

        governanceTokens[_artAdvisorAddress] = GovernanceToken({
            holder: _artAdvisorAddress,
            weight: 3000, // 30%
            isActive: true
        });

        emit GovernanceTokenIssued(_spvAddress, 7000);
        emit GovernanceTokenIssued(_artAdvisorAddress, 3000);
    }

    /**
     * @dev Set the AST token contract
     * @param _astToken AST token address
     */
    function setASTToken(address _astToken) external onlyOwner {
        require(_astToken != address(0), "Invalid AST address");
        astToken = ArtSecurityToken(_astToken);
    }


    /**
     * @dev Create a new governance proposal
     * @param proposalType Type of proposal
     * @param description Proposal description
     * @param data Encoded data for execution
     */
    function createProposal(
        ProposalType proposalType,
        string calldata description,
        bytes calldata data
    ) external returns (uint256) {
        require(governanceTokens[msg.sender].isActive, "Not a governance token holder");
        require(bytes(description).length > 0, "Description required");

        proposalCount++;
        uint256 proposalId = proposalCount;

        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.proposalType = proposalType;
        proposal.description = description;
        proposal.proposer = msg.sender;
        proposal.createdAt = block.timestamp;
        proposal.votingEnds = block.timestamp + VOTING_PERIOD;
        proposal.status = ProposalStatus.Active;
        proposal.data = data;

        emit ProposalCreated(proposalId, proposalType, msg.sender, description);

        return proposalId;
    }

    /**
     * @dev Vote on a proposal
     * @param proposalId ID of the proposal
     * @param support True for yes, false for no
     */
    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        require(block.timestamp <= proposal.votingEnds, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(governanceTokens[msg.sender].isActive, "Not a governance token holder");

        uint256 weight = governanceTokens[msg.sender].weight;
        proposal.hasVoted[msg.sender] = true;

        if (support) {
            proposal.votesFor += weight;
        } else {
            proposal.votesAgainst += weight;
        }

        emit Voted(proposalId, msg.sender, support, weight);
    }

    /**
     * @dev Execute a passed proposal
     * @param proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        require(block.timestamp > proposal.votingEnds, "Voting still ongoing");

        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        require(totalVotes >= QUORUM_BPS, "Quorum not reached");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal rejected");

        proposal.status = ProposalStatus.Executed;

        // Execute based on proposal type
        if (proposal.proposalType == ProposalType.EMERGENCY_PAUSE) {
            _executeEmergencyPause();
        } else if (proposal.proposalType == ProposalType.EXIT_SALE) {
            _executeExitSale(proposal.data);
        } else if (proposal.proposalType == ProposalType.ENABLE_TRANSFERS) {
            _executeEnableTransfers(proposal.data);
        }

        emit ProposalExecuted(proposalId);
    }

    /**
     * @dev Cancel a proposal (only proposer or owner)
     * @param proposalId ID of the proposal
     */
    function cancelProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "Not authorized"
        );
        require(proposal.status == ProposalStatus.Active, "Proposal not active");

        proposal.status = ProposalStatus.Cancelled;

        emit ProposalCancelled(proposalId);
    }

    /**
     * @dev Execute emergency pause
     */
    function _executeEmergencyPause() internal {
        require(address(astToken) != address(0), "AST token not set");
        astToken.setTransfersEnabled(false);
    }

    /**
     * @dev Execute exit sale preparation
     * @param data Encoded exit data
     */
    function _executeExitSale(bytes memory data) internal {
        require(address(astToken) != address(0), "AST token not set");
        astToken.setTransfersEnabled(true);
    }

    /**
     * @dev Execute enable transfers (for liquidity windows)
     * @param data Encoded enable flag
     */
    function _executeEnableTransfers(bytes memory data) internal {
        require(address(astToken) != address(0), "AST token not set");
        bool enabled = abi.decode(data, (bool));
        astToken.setTransfersEnabled(enabled);
    }

    /**
     * @dev Get proposal details
     * @param proposalId Proposal ID
     * @return Proposal details tuple
     */
    function getProposal(uint256 proposalId)
        external
        view
        returns (
            uint256 id,
            ProposalType proposalType,
            string memory description,
            address proposer,
            uint256 createdAt,
            uint256 votingEnds,
            uint256 votesFor,
            uint256 votesAgainst,
            ProposalStatus status
        )
    {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.proposalType,
            proposal.description,
            proposal.proposer,
            proposal.createdAt,
            proposal.votingEnds,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.status
        );
    }

    /**
     * @dev Check if address has voted on a proposal
     * @param proposalId Proposal ID
     * @param voter Voter address
     * @return True if voted
     */
    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }

    /**
     * @dev Check if proposal has passed
     * @param proposalId Proposal ID
     * @return True if proposal passed
     */
    function hasProposalPassed(uint256 proposalId) external view returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;

        return totalVotes >= QUORUM_BPS && proposal.votesFor > proposal.votesAgainst;
    }
}
