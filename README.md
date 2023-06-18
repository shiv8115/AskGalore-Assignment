# Description of Assignment

**`WrappedERC20`** acts as a bridge between an ERC20 token and an ERC721 non-fungible token (NFT). The contract allows users to deposit ERC721 tokens and mint an equivalent number of ERC20 tokens, and vice versa.

Here is a point-by-point description of the code:

1. The contract begins with importing necessary dependencies from the OpenZeppelin library, including the ERC20 token implementation and the SafeMath library for secure mathematical operations.
2. The contract defines several state variables:
    - **`depositedTokenIdArray`**: An array that keeps track of the deposited token IDs.
    - **`tokenIdIsDepositedInContract`**: A mapping that stores whether a token ID is currently deposited in the contract.
    - **`idOfOwner`**: A mapping that tracks the ID of the user's NFT when the user mints an NFT by depositing ERC20 tokens.
    - **`isNftMinted`**: A mapping that keeps track of whether an NFT has been minted for a particular user and token ID.
    - **`nftContractAddress`**: An instance of the **`IERC721`** interface representing the address of the ERC721 contract.
3. The contract constructor initializes the **`WrappedERC20`** contract by setting the name, symbol, and ERC721 contract address.
4. The **`mintERC20`** function allows the contract owner to mint ERC20 tokens and transfer them to a specified address.
5. The **`depositTokenIdAndMintTokens`** function enables users to deposit an ERC721 token ID and receive an equivalent number of ERC20 tokens. The function requires that the user is the owner of the NFT, has approved the contract to transfer the NFT, and transfers the NFT to the contract. It then mints ERC20 tokens for the user and emits a **`DepositERC721AndMint20Token`** event.
6. The **`burnTokensAndWithdrawId`** function allows users to burn a specified amount of ERC20 tokens and withdraw the corresponding ERC721 token from the contract. The function requires that the token ID has not been previously withdrawn, the user has enough ERC20 tokens, and the contract is the current owner of the token. It then burns ERC20 tokens from the user and transfers the ERC721 token to the specified destination address. Afterward, it updates the status of the token ID in the mapping and emits a **`BurnTokenAndWithdrawERC721Id`** event.
7. The **`mintNFTByDepositingERC20`** function enables users to mint an NFT by depositing ERC20 tokens. The user must have a sufficient balance of ERC20 tokens, and the contract transfers the required tokens from the user to itself. It then mints an NFT for the user, updates the mapping to track the ID of the owner, and marks the NFT as minted.
8. The **`burnNFTAndGetERC20`** function allows users to burn an NFT and receive ERC20 tokens in return. The user must own the specified NFT, and the NFT must not have been burned previously. The function transfers ERC20 tokens to the user and burns the NFT. It then updates the mapping and removes the ID of the owner.
9. The internal function **`_pushTokenId`** is used to add a locked token ID to the end of the **`depositedTokenIdArray`** and update the status of the token ID in the mapping.
10. The contract includes the **`onERC721Received`** function, which is the implementation of the ERC721Receiver interface. It returns the selector of the **`onERC721Received`** function to indicate support for ERC721 token transfers.
—————————————————————————————————————————-

**`MyERC721`** implements the ERC721 standard for non-fungible tokens (NFTs). It allows for the minting of unique tokens and tracks the token IDs using the Counters library.

1. The contract begins with importing necessary dependencies from the OpenZeppelin library, including the ERC721 token implementation and the Counters library for managing token IDs.
2. The contract defines a state variable:
    - **`_tokenIds`**: A Counter instance used to keep track of the token IDs.
3. The contract constructor initializes the **`MyERC721`** contract by setting the name and symbol for the NFT.
4. The **`mint`** function allows anyone to mint a new NFT and assign it to the specified recipient. It increments the token ID counter, assigns the new ID to the recipient by calling the **`_mint`** function from the ERC721 contract, and returns the newly minted token ID.
5. The **`burn`** function allows the contract owner to burn (delete) an existing NFT. It calls the **`_burn`** function from the ERC721 contract to remove the NFT from existence.

———————————————————————————————————————
**What I have done:**
1- My Repo consists of Contract
2- It also consists deployment script and its testing with **100% Coverage**
3- The repository consists of proper **natspec Comment and documentation**.
