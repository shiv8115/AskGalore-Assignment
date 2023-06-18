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
    it("Should set the correct token Name and symbol of ERC721 Token", async function () {
      const { token } = await loadFixture(deployNFTContractFixture);
      expect(await token.name()).to.equal("ERC721Token");

      expect(await token.symbol()).to.equal("MYTKN");
    });

    it("Should set the correct token Name and symbol of Wrapper ERC20 Token", async function () {
      const { wrapToken } = await loadFixture(deployWrapperContractFixture);
      expect(await wrapToken.name()).to.equal("ERC20Token");

      expect(await wrapToken.symbol()).to.equal("MYERC20");
    });
  });

  describe("Testing Functionality", function () {
    it("Should mint token id", async function () {
      const [owner] = await ethers.getSigners();
      const { token } = await loadFixture(deployNFTContractFixture);

      await token.mint(owner.address);
      expect(await token.balanceOf(owner.address)).to.equal(1);
    });

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

    it("User can getback NFT", async function () {
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
});
