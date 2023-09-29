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
        // One approach to Cairo 1 compilation is by using Scarb.
        // For direct use of the Cairo compiler, check `compilerVersion` property
        // Value can be a path or a resolvable command (e.g. `path/to/scarb-1.2.3` or `scarb`)
        scarbCommand: "scarb",

        // which compiler to download from https://github.com/starkware-libs/cairo/releases
        compilerVersion: "2.2.0",

        // Alternatively to using `compilerVersion`, specify the directory containing Cairo 1 compiler binaries
        // cairo1BinDir: "path/to/cairo/target/release",

        // The Starknet network to be used
        network: "integrated-devnet",

        // Cairo 0 compilation is by default done using the latest stable Dockerized compiler.
        // If you want to use an older Cairo 0 compiler, specify the full semver string:
        // dockerizedVersion: "0.11.2",
        // If you cannot use Docker use one of the following:
        // venv: "path/to/my-venv", <- uses (my-venv) defined by `python -m venv path/to/my-venv`
        // venv: "active",          <- uses active Python venv

        // Whether to automatically recompile contracts or not
        // Works with Cairo 0
        recompile: false
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

            // Select whether to use a Devnet instance installed in your Python venv or a dockerizedVersion.
            // Latest compatible dockerizedVersion is the default.
            // venv: "active",
            // dockerizedVersion: "<DEVNET_VERSION>",

            args: [
                // Uncomment the lines below to activate Devnet features in your integrated-devnet instance
                // Read about Devnet options here: https://0xSpaceShard.github.io/starknet-devnet/docs/guide/run
                //
                // *Account predeployment*
                "--seed",
                "42"
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
