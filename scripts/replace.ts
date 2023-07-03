import { starknet } from "hardhat";
import { getOZAccount } from "../test/util";

async function main() {
    const account = await getOZAccount();
    const replaceableFactory = await starknet.getContractFactory("replaceable");
    await account.declare(replaceableFactory);
    const replaceableContract = await account.deploy(replaceableFactory);
    console.log(await replaceableContract.call("foo"));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
