import { HardhatUserConfig } from "hardhat/types";
import "@shardlabs/starknet-hardhat-plugin";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  cairo: {
    version: "0.7.0" // alternatively choose one of the two venv options below

    // uses (my-venv) defined by `python -m venv path/to/my-venv`
    // venv: "path/to/my-venv"
    
    // uses the currently active Python environment (hopefully with available Starknet commands!) 
    //venv: "active"
  },
  networks: {
    devnet: {
      url: "http://localhost:5000"
    }
  },
  mocha: {
    //starknetNetwork: "devnet"
    starknetNetwork: "alpha"
  },
  wallets: {
    OpenZeppelin: {
      accountName: "OpenZeppelin",
      modulePath: "starkware.starknet.wallets.open_zeppelin.OpenZeppelinAccount",
      accountPath: "~/.starknet_accounts"
    }
  }
};

export default config;
