require("@nomiclabs/hardhat-waffle");
require("YOUR PATH HERE");

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  cairo: {
    version: "0.4.0"
  }
};
