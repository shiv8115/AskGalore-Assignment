module.exports = async ({getNamedAccounts, deployments}) => {
  const {deploy} = deployments;
  const {deployer} = await getNamedAccounts();
  const nftContract = await deployments.get('MyERC721');
  await deploy('WrappedERC20', {
    from: deployer,
    args: ['ERC20', "myTokenWrapper", nftContract.address ],
    log: true,
  });
};
module.exports.tags = ['wrap'];
