import { HardhatUserConfig } from "hardhat/types";
import "@shardlabs/starknet-hardhat-plugin";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-ganache";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  solidity: '0.6.12',
  starknet: {
    dockerizedVersion: "0.7.1", // alternatively choose one of the two venv options below
    // uses (my-venv) defined by `python -m venv path/to/my-venv`
    venv: "env",

    // uses the currently active Python environment (hopefully with available Starknet commands!)
    //venv: "active"
    network: "devnet",
    wallets: {
      OpenZeppelin: {
        accountName: "OpenZeppelin",
        modulePath: "starkware.starknet.wallets.open_zeppelin.OpenZeppelinAccount",
        accountPath: "~/.starknet_accounts"
      }
    }
  },
  networks: {
    devnet: {
      url: "http://localhost:5000"
    },
  },
};

export default config;
