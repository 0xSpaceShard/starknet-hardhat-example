import { starknetLegacy as starknet } from "hardhat";

import { ensureEnvVar, getOZAccount } from "../test/util";

/**
 * Should work if run with:
 * $ DECLARABLE_CONTRACT=<YOUR_CONTRACT_NAME> npx hardhat run <NAME_OF_THIS_SCRIPT>
 */
async function main() {
    const account = await getOZAccount();

    const contractName = ensureEnvVar("DECLARABLE_CONTRACT");
    console.log("Declaring", contractName);

    const contractFactory = await starknet.getContractFactory(contractName);

    const declarationTxHash = await account.declare(contractFactory, {
        maxFee: 1e18
    });

    const classHash = await contractFactory.getClassHash();
    console.log(`Declared class ${classHash} in tx ${declarationTxHash}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
