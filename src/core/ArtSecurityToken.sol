// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IIdentityRegistry.sol";

/**
 * @title ArtSecurityToken
 * @dev ERC-20 compliant security token representing fractional ownership of Picasso's "Fillette au béret"
 * @notice Implements transfer restrictions based on KYC verification and liquidity windows
 */
contract ArtSecurityToken is ERC20, Ownable {
    IIdentityRegistry public immutable identityRegistry;

    bool public transfersEnabled;

    // Artwork metadata
    string public artworkName;
    string public artist;
    uint256 public creationYear;
    uint256 public initialValuation;

    uint256 public constant TOTAL_SUPPLY = 2000 * 10**18; // 2,000 tokens

    event TransfersToggled(bool enabled);
    event ArtworkMetadataSet(string name, string artist, uint256 year, uint256 valuation);

    modifier onlyCompliant(address from, address to) {
        if (from != address(0)) {
            require(identityRegistry.isVerified(from), "Sender not KYC verified");
        }
        if (to != address(0)) {
            require(identityRegistry.isVerified(to), "Recipient not KYC verified");
        }
        _;
    }

    constructor(
        address _identityRegistry,
        string memory _artworkName,
        string memory _artist,
        uint256 _creationYear,
        uint256 _initialValuation
    ) ERC20("Art Security Token - Fillette au beret", "AST") Ownable(msg.sender) {
        require(_identityRegistry != address(0), "Invalid registry address");
        require(bytes(_artworkName).length > 0, "Artwork name required");
        require(bytes(_artist).length > 0, "Artist name required");
        require(_creationYear > 0, "Creation year required");
        require(_initialValuation > 0, "Initial valuation required");

        identityRegistry = IIdentityRegistry(_identityRegistry);
        artworkName = _artworkName;
        artist = _artist;
        creationYear = _creationYear;
        initialValuation = _initialValuation;

        _mint(msg.sender, TOTAL_SUPPLY);

        emit ArtworkMetadataSet(_artworkName, _artist, _creationYear, _initialValuation);
    }

    /**
     * @dev Override _update to implement compliance checks
     * @notice Checks both sender and recipient are KYC verified
     * @notice Enforces transfer restrictions outside liquidity windows
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override onlyCompliant(from, to) {
        // Allow minting (from = 0) and burning (to = 0) always
        if (from != address(0) && to != address(0)) {
            require(
                transfersEnabled || from == owner() || to == owner(),
                "Transfers disabled outside liquidity window"
            );
        }

        super._update(from, to, value);
    }

    /**
     * @dev Toggle transfers on/off for liquidity windows
     * @param _enabled True to enable transfers, false to disable
     */
    function setTransfersEnabled(bool _enabled) external onlyOwner {
        transfersEnabled = _enabled;
        emit TransfersToggled(_enabled);
    }

    /**
     * @dev Check if an address is compliant for transfers
     * @param account Address to check
     * @return bool True if account is KYC verified
     */
    function isCompliant(address account) external view returns (bool) {
        return identityRegistry.isVerified(account);
    }
}
