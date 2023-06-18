// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**

@title MyERC721
@dev This contract implements the ERC721 standard for non-fungible tokens (NFTs).
It allows for the minting of unique tokens and tracks the token IDs using the Counters library.
*/
contract MyERC721 is ERC721 {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    /**
     * @dev Initializes the contract with the provided name and symbol for the NFT.
     * @param name The name of the NFT.
     * @param symbol The symbol of the NFT.
     */
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    /**
     * @dev Mints a new NFT and assigns it to the specified recipient.
     * @param recipient The address to which the minted NFT will be assigned.
     * @return newItemId The ID of the newly minted NFT.
     */
    function mint(address recipient) external returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        return newItemId;
    }

    function burn(uint256 tokenId) external {
        _burn(tokenId);
    }
}
