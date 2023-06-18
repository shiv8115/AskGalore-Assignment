module.exports = async ({getNamedAccounts, deployments}) => {
  const {deploy} = deployments;
  const {deployer} = await getNamedAccounts();
  await deploy('MyERC721', {
    from: deployer,
    args: ['ERC721', "myToken"],
    log: true,
  });
};
module.exports.tags = ['MyERC721'];
