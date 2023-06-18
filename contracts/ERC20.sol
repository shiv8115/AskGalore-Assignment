// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./IERC721.sol";

contract WrappedERC20 is ERC20 {
    using SafeMath for uint256;

    uint256[] private depositedTokenIdArray;

    mapping(uint256 => bool) private tokenIdIsDepositedInContract;

    IERC721 nftContractAddress;

    /// @dev This event is fired when a user deposits NFT into the contract in exchange
    ///  for an equal number of ERC20 tokens.
    /// @param tokenId  The token id of the NFT that was deposited into the contract.
    event DepositERC721AndMint20Token(uint256 tokenId);

    /// @dev This event is fired when a user deposits ERC20 tokens into the contract in exchange
    ///  for an equal number of locked token ID.
    /// @param tokenId  The token id of the NFT that was withdrawn from the contract.
    event BurnTokenAndWithdrawERC721Id(uint256 tokenId);

    constructor(
        string memory name,
        string memory symbol,
        address erc721
    ) ERC20(name, symbol) {
        nftContractAddress = IERC721(erc721);
    }

    /**
     * @dev Deposits an ERC721 token ID and mints an equivalent number of ERC20 tokens.
     * @param _tokenId The token ID of the ERC721 token to be deposited.
     */
    function depositTokenIdAndMintTokens(uint256 _tokenId) external {
        require(_tokenId > 0, "Id cannot be zero");
        require(
            msg.sender == nftContractAddress.ownerOf(_tokenId),
            "only owner of NFT can deposit tokenId"
        );
        require(
            nftContractAddress.getApproved(_tokenId) == address(this),
            "you must approve the this contract"
        );
        nftContractAddress.safeTransferFrom(
            msg.sender,
            address(this),
            _tokenId
        );
        _pushTokenId(_tokenId);
        emit DepositERC721AndMint20Token(_tokenId);

        _mint(msg.sender, 1000);
    }

    /**
     * @dev Burns ERC20 tokens and withdraws the corresponding ERC721 token ID from the contract.
     * @param _tokenId The token ID of the ERC721 token to be withdrawn.
     * @param destination The address to which the withdrawn ERC721 token will be transferred.
     */
    function burnTokensAndWithdrawId(
        uint256 _tokenId,
        address destination
    ) external {
        require(
            tokenIdIsDepositedInContract[_tokenId] == true,
            "ID has already been withdrawn"
        );
        require(_tokenId > 0, "Id cannot be zero");
        require(
            address(this) == nftContractAddress.ownerOf(_tokenId),
            "Contract does not have token ID"
        );
        require(balanceOf(msg.sender) >= 1000, "Not enough Balance");
        _burn(msg.sender, 1000);
        nftContractAddress.safeTransferFrom(
            address(this),
            destination,
            _tokenId
        );
        tokenIdIsDepositedInContract[_tokenId] = false;
        emit BurnTokenAndWithdrawERC721Id(_tokenId);
    }

    /// @notice Adds a locked tokenId to the end of the array
    /// @param _tokenId  The id of the NFT that will be locked into the contract.

    function _pushTokenId(uint256 _tokenId) internal {
        depositedTokenIdArray.push(_tokenId);
        tokenIdIsDepositedInContract[_tokenId] = true;
    }

    
/// This function is the implementation of the ERC721Receiver interface. 
// It returns the selector of the onERC721Received function to indicate support for ERC721 token transfers.
    function onERC721Received(
        address /* operator */,
        address /* from */,
        uint256 /* tokenId */,
        bytes calldata /* data */
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
