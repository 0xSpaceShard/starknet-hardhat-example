import { HardhatUserConfig } from "hardhat/types";
import "@shardlabs/starknet-hardhat-plugin";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from "dotenv";
dotenv.config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
    solidity: "0.6.12",
    starknet: {
        dockerizedVersion: "0.10.3", // alternatively choose one of the two venv options below
        // uses (my-venv) defined by `python -m venv path/to/my-venv`
        // venv: "path/to/my-venv",

        // uses the currently active Python environment (hopefully with available Starknet commands!)
        // venv: "active",
        recompile: false,
        network: "integrated-devnet",
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
            url: "http://127.0.0.1:5050"
        },
        integration: {
            url: "https://external.integration.starknet.io"
        },
        integratedDevnet: {
            url: "http://127.0.0.1:5050",
            // venv: "active",
            // dockerizedVersion: "<DEVNET_VERSION>",
            args: [
                // Uncomment the lines below to activate Devnet features in your integrated-devnet instance
                // Read about Devnet options here: https://shard-labs.github.io/starknet-devnet/docs/guide/run
                //
                // *Account predeployment*
                // "--seed",
                // "42",
                // "--accounts",
                // "1",
                // "--initial-balance", <VALUE>
                //
                // *Forking*
                // "--fork-network",
                // "alpha-goerli2"
                // "--fork-block", <VALUE>
                //
                // *Chain ID*
                // "--chain-id", <VALUE>
                //
                // *Gas price*
                // "--gas-price", <VALUE>
            ]
        },
        hardhat: {}
    }
};

export default config;
