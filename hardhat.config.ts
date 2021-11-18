import "@shardlabs/starknet-hardhat-plugin";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  cairo: {
    version: "0.6.0"
  },
  networks: {
    devnet: {
      url: "http://localhost:5000"
    }
  },
  mocha: {
    // starknetNetwork: "devnet"
    starknetNetwork: "alpha"
  }
};
