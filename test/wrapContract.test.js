const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Contract Creation", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployNFTContractFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MyERC721");
    const token = await Token.deploy("ERC721Token", "MYTKN");

    return { token, owner, otherAccount };
  }

  async function deployWrapperContractFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const { token } = await loadFixture(deployNFTContractFixture);

    const Token = await ethers.getContractFactory("WrappedERC20");
    const wrapToken = await Token.deploy(
      "ERC20Token",
      "MYERC20",
      token.address
    );

    return { wrapToken, token, owner, otherAccount };
  }

  describe("Deployment", function () {
    //It ensures that the deployed ERC721 token has the correct name and symbol.
    it("Should set the correct token Name and symbol of ERC721 Token", async function () {
      const { token } = await loadFixture(deployNFTContractFixture);
      expect(await token.name()).to.equal("ERC721Token");

      expect(await token.symbol()).to.equal("MYTKN");
    });

    //It ensures that the deployed Wrapper ERC20 token has the correct name and symbol.
    it("Should set the correct token Name and symbol of Wrapper ERC20 Token", async function () {
      const { wrapToken } = await loadFixture(deployWrapperContractFixture);
      expect(await wrapToken.name()).to.equal("ERC20Token");

      expect(await wrapToken.symbol()).to.equal("MYERC20");
    });
  });

  // Testing of mapping from ERC721 to ERC20

  describe("Testing Functionality mapping from ERC721 to ERC20", function () {
    //It tests the minting of an ERC721 token and verifies the balance of the token owner.
    it("Should mint token id", async function () {
      const [owner] = await ethers.getSigners();
      const { token } = await loadFixture(deployNFTContractFixture);

      await token.mint(owner.address);
      expect(await token.balanceOf(owner.address)).to.equal(1);
    });

    //It tests the approval of an ERC721 token to the Wrapper ERC20 contract
    // verifies the approval status.
    it("Should Approve to the Wrapper contract", async function () {
      const [owner] = await ethers.getSigners();
      const { wrapToken, token } = await loadFixture(
        deployWrapperContractFixture
      );

      await token.mint(owner.address);
      expect(await token.balanceOf(owner.address)).to.equal(1);

      await token.approve(wrapToken.address, 1);

      expect(await token.getApproved(1)).to.equal(wrapToken.address);
    });

    //It tests the transfer of an ERC721 token to the Wrapper ERC20 contract
    // verifies the corresponding ERC20 balance.
    it("Transfer NFT to the wrapper Contract and get corresponding ERC20 Token", async function () {
      const [owner] = await ethers.getSigners();
      const { wrapToken, token } = await loadFixture(
        deployWrapperContractFixture
      );

      await token.mint(owner.address);
      expect(await token.balanceOf(owner.address)).to.equal(1);

      await token.approve(wrapToken.address, 1);

      expect(await token.getApproved(1)).to.equal(wrapToken.address);

      await wrapToken.depositTokenIdAndMintTokens(1);

      expect(await token.balanceOf(wrapToken.address)).to.equal(1);

      expect(await wrapToken.balanceOf(owner.address)).to.equal(1000);
    });

    // It tests the transfer of the Wrapper ERC20 token between accounts
    // verifies the updated balances
    it("Wrapped Minted token can transfer between accounts", async function () {
      const [owner, addr1] = await ethers.getSigners();
      const { wrapToken, token } = await loadFixture(
        deployWrapperContractFixture
      );

      await token.mint(owner.address);

      await token.approve(wrapToken.address, 1);

      await wrapToken.depositTokenIdAndMintTokens(1);

      await wrapToken.transfer(addr1.address, 600);

      expect(await wrapToken.balanceOf(addr1.address)).to.equal(600);

      expect(await wrapToken.balanceOf(owner.address)).to.equal(400);
    });

    // It tests the process of returning an ERC721 token from the Wrapper ERC20 contract to the original owner
    // verifies the balances and ownership
    it("User can getback NFT and ERC20 Token should be burned", async function () {
      const [owner, addr1] = await ethers.getSigners();
      const { wrapToken, token } = await loadFixture(
        deployWrapperContractFixture
      );

      await token.mint(owner.address);

      await token.approve(wrapToken.address, 1);

      await wrapToken.depositTokenIdAndMintTokens(1);

      // Before
      expect(await token.ownerOf(1)).to.equal(wrapToken.address);
      expect(await token.balanceOf(owner.address)).to.equal(0);
      expect(await wrapToken.balanceOf(owner.address)).to.equal(1000);

      // After deposit ERC20 token and get back 1 NFT

      await wrapToken.burnTokensAndWithdrawId(1, owner.address);

      expect(await token.ownerOf(1)).to.equal(owner.address);
      expect(await token.balanceOf(owner.address)).to.equal(1);
      expect(await wrapToken.balanceOf(owner.address)).to.equal(0);
      expect(await token.balanceOf(wrapToken.address)).to.equal(0);
    });

    //It tests the transfer of an ERC721 token from one account to another
    // verifies the updated balances and ownership
    it("User can transfer NFT between different accounts", async function () {
      const [owner, addr1] = await ethers.getSigners();
      const { wrapToken, token } = await loadFixture(
        deployWrapperContractFixture
      );

      await token.mint(owner.address);

      await token.approve(wrapToken.address, 1);

      await wrapToken.depositTokenIdAndMintTokens(1);

      await wrapToken.burnTokensAndWithdrawId(1, owner.address);
      await token.transferFrom(owner.address, addr1.address, 1);
      expect(await token.balanceOf(addr1.address)).to.equal(1);
      expect(await token.ownerOf(1)).to.equal(addr1.address);
    });
  });

  // testing of mapping from ERC20 to ERC721 and user can exhange ERC20 token and get NFT

  describe("Testing Functionality mapping from ERC20 to ERC721", function () {
    // It tests the minting of an ERC20 token and verifies the balance of the token owner.
    it("Should mint ERC20 token", async function () {
      const [owner] = await ethers.getSigners();
      const { wrapToken } = await loadFixture(deployWrapperContractFixture);

      await wrapToken.mintERC20(owner.address, 2000);
      expect(await wrapToken.balanceOf(owner.address)).to.equal(2000);
    });

    // it tests the approval of an ERC20 token to another account using the Wrapper ERC20 contract and verifies the approval status.
    it("Wrapper Contract Approve to the different account", async function () {
      const [owner] = await ethers.getSigners();
      const { wrapToken, token } = await loadFixture(
        deployWrapperContractFixture
      );

      await wrapToken.mintERC20(owner.address, 2000);
      expect(await wrapToken.balanceOf(owner.address)).to.equal(2000);

      await wrapToken.approve(wrapToken.address, 2000);

      expect(
        await wrapToken.allowance(owner.address, wrapToken.address)
      ).to.equal(2000);
    });

    // It tests the exchange of ERC20 tokens for an ERC721 token using the Wrapper ERC20 contract
    it("User can exhange ERC20 Token and able to get NFT", async function () {
      const [owner] = await ethers.getSigners();
      const { wrapToken, token } = await loadFixture(
        deployWrapperContractFixture
      );

      await wrapToken.mintERC20(owner.address, 3000);
      await wrapToken.mintNFTByDepositingERC20(owner.address);

      expect(await wrapToken.balanceOf(owner.address)).to.equal(2000);

      expect(await wrapToken.balanceOf(wrapToken.address)).to.equal(1000);
    });

    // It tests that a user can mint an ERC721 token by exchanging ERC20 tokens using the Wrapper ERC20 contract and verifies the ownership.
    it("User are able to mint NFT by exchanging tokens", async function () {
      const [owner] = await ethers.getSigners();
      const { wrapToken, token } = await loadFixture(
        deployWrapperContractFixture
      );

      await wrapToken.mintERC20(owner.address, 3000);
      await wrapToken.mintNFTByDepositingERC20(owner.address);

      expect(await token.ownerOf(1)).to.equal(owner.address);
    });

    // It tests the withdrawal of ERC20 tokens from the Wrapper ERC20 contract
    // It ensures that the corresponding ERC721 token is burned.
    it("User can withdrawn its ERC20 token and NFT token should be burn", async function () {
      const [owner] = await ethers.getSigners();
      const { wrapToken, token } = await loadFixture(
        deployWrapperContractFixture
      );

      await wrapToken.mintERC20(owner.address, 3000);
      await wrapToken.mintNFTByDepositingERC20(owner.address);

      // before the withdraw function call
      expect(await wrapToken.balanceOf(owner.address)).to.equal(2000);
      expect(await wrapToken.balanceOf(wrapToken.address)).to.equal(1000);
      expect(await token.ownerOf(1)).to.equal(owner.address);
      expect(await token.balanceOf(owner.address)).to.equal(1);

      // After the withdraw function called
      await wrapToken.burnNFTAndGetERC20(owner.address, 1);

      expect(await wrapToken.balanceOf(owner.address)).to.equal(3000);
      expect(await wrapToken.balanceOf(wrapToken.address)).to.equal(0);
      expect(await token.balanceOf(owner.address)).to.equal(0);
    });

    // It tests the transfer of a newly minted ERC721 token from one account to another
    it("User can transfer Newly NFT between different accounts", async function () {
      const [owner, addr1] = await ethers.getSigners();
      const { wrapToken, token } = await loadFixture(
        deployWrapperContractFixture
      );
      await wrapToken.mintERC20(owner.address, 3000);
      await wrapToken.mintNFTByDepositingERC20(owner.address);

      await token.transferFrom(owner.address, addr1.address, 1);
      expect(await token.balanceOf(addr1.address)).to.equal(1);
      expect(await token.ownerOf(1)).to.equal(addr1.address);
    });
  });
});
