// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./IERC721.sol";

/**
@author Shivam Singh
@notice WrappedERC20 acts as a bridge between an ERC20 token and an ERC721 non-fungible token (NFT). The contract allows users to deposit ERC721 tokens and mint an equivalent number of ERC20 tokens, and vice versa.
 */
contract WrappedERC20 is ERC20 {
    using SafeMath for uint256;

    // Mapping to track if a token ID is deposited in the contract
    mapping(uint256 => bool) private tokenIdIsDepositedInContract; // use owner of

    // Mapping to track the ID of the owner when a user mints an NFT by depositing ERC20 in the contract
    mapping(address => uint256) public nftTokenIdByOwner; // uint256=> address

    // Mapping to track when a user deposits ERC20 and mints ERC721 tokens
    mapping(address => mapping(uint256 => bool)) private isNftMinted;

    // Address of the ERC721 contract
    IERC721 nftContractAddress;

    /// @dev This event is fired when a user deposits NFT into the contract in exchange
    ///  for an equal number of ERC20 tokens.
    /// @param tokenId  The token id of the NFT that was deposited into the contract.
    event DepositERC721AndMint20Token(uint256 tokenId);

    /// @dev This event is fired when a user deposits ERC20 tokens into the contract in exchange
    ///  for an equal number of locked token ID.
    /// @param tokenId  The token id of the NFT that was withdrawn from the contract.
    event BurnERC20AndWithdrawERC721(uint256 tokenId);

    // Emitted when a user deposits ERC20 tokens into the contract and mints an equivalent ERC721 token.
    event DepositERC20AndMint721Token(uint256 tokenId);

    // Emitted when a user burns ERC20 tokens and withdraws the corresponding ERC721 token from the contract
    event BurnERC721AndWithdrawERC20(uint256 tokenId);

    /**
     * @dev Initializes the WrappedERC20 contract.
     * @param name The name of the ERC20 token.
     * @param symbol The symbol of the ERC20 token.
     * @param erc721 The address of the ERC721 contract.
     */
    constructor(
        string memory name,
        string memory symbol,
        address erc721
    ) ERC20(name, symbol) {
        nftContractAddress = IERC721(erc721);
    }

    /**
    @dev Mints ERC20 tokens and transfers them to the specified address.
    @param to The address to which the ERC20 tokens will be minted and transferred.
    @param amount The amount of ERC20 tokens to mint and transfer.
    */
    function mintERC20(address to, uint256 amount) external {
        require(to != address(0), "Address cannot be zero");
        _mint(to, amount);
    }

    /**
     * @dev Deposits an ERC721 token ID and mints an equivalent number of ERC20 tokens.
     * @param _tokenId The token ID of the ERC721 token to be deposited.
     */
    function depositNFTAndMintTokens(uint256 _tokenId) external {
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
    function burnTokensAndWithdrawNFT(
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
        emit BurnERC20AndWithdrawERC721(_tokenId);
    }

    /// Mapping from ERC20 to ERC721, we can get NFT by exchanging of ERC20 Token and that ERC721 user can use and transfer between accounts
    /// Mints an NFT by depositing ERC20 tokens.
    /// _user The address of the user who will receive the minted NFT.
    function mintNFTByDepositingERC20(address _user) external {
        require(_user != address(0), "Address cannot be zero");
        require(
            balanceOf(_user) >= 1000,
            "You have not sufficient Token for Mint NFT"
        );
        transfer(address(this), 1000);

        uint256 id = nftContractAddress.mint(_user);
        nftTokenIdByOwner[_user] = id;
        isNftMinted[_user][id] = true;
        emit DepositERC20AndMint721Token(id);
    }

    /**
    @dev Burns an NFT and transfers ERC20 tokens to the specified user.
    @param _user The address of the user who will receive the ERC20 tokens.
    @param tokenId The ID of the NFT to be burned.
    */
    function burnNFTAndGetERC20(address _user, uint256 tokenId) external {
        require(
            nftContractAddress.ownerOf(tokenId) == _user,
            "token does not exist"
        );
        require(isNftMinted[_user][tokenId] == true, "tokenId already burned");
        IERC20(address(this)).transfer(_user, 1000);
        nftContractAddress.burn(tokenId);
        isNftMinted[_user][tokenId] = false;
        delete nftTokenIdByOwner[_user];
        emit BurnERC721AndWithdrawERC20(tokenId);
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

    /// @notice Adds a locked tokenId to the end of the array
    /// @param _tokenId  The id of the NFT that will be locked into the contract.
    function _pushTokenId(uint256 _tokenId) internal {
        tokenIdIsDepositedInContract[_tokenId] = true;
    }
}
