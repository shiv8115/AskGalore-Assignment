require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");
require("solidity-coverage");
require("dotenv").config();

const { PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.18",
  namedAccounts: {
    deployer: {
      default: 0,
    }
  },
  networks: {
    mumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/r1zLtlI4VzABNRCDTlzwkUudARlrlXRV",
      accounts: [PRIVATE_KEY],
    },
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/XV43uAjGjyYn4FEFd202cfufmON3kMYM",
      accounts: [PRIVATE_KEY],
    },
    fuji: {
      url: `https://api.avax-test.network/ext/bc/C/rpc`,
      chainId: 43113,
      accounts: [PRIVATE_KEY],
    },
  },
};
