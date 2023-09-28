import { starknetLegacy as starknet } from "hardhat";

import { getOZAccount } from "../test/util";

async function main() {
    const account = await getOZAccount();

    // declare and deploy replacable
    const replaceableFactory = await starknet.getContractFactory("replaceable");
    await account.declare(replaceableFactory);
    const replaceableContract = await account.deploy(replaceableFactory);

    // declare replaced
    const replacedFactory = await starknet.getContractFactory("replaced");
    await account.declare(replacedFactory);

    // replace
    console.log("Before replacement:", await replaceableContract.call("foo"));
    await account.invoke(replaceableContract, "replace", {
        new_class_hash: await replacedFactory.getClassHash()
    });
    console.log("After replacement:", await replaceableContract.call("foo"));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
