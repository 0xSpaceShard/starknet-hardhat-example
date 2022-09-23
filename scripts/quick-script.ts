import hardhat from "hardhat";
import { ensureEnvVar } from "../test/util";

async function main() {
    const account = await hardhat.starknet.getAccountFromAddress(
        ensureEnvVar("OZ_ACCOUNT_ADDRESS"),
        ensureEnvVar("OZ_ACCOUNT_PRIVATE_KEY"),
        "OpenZeppelin"
    );

    const contractFactory = await hardhat.starknet.getContractFactory("contract");
    const contract = await contractFactory.deploy({ initial_balance: 0 });

    console.log("Deployed to:", contract.address);
    const { res: balanceBefore } = await contract.call("get_balance");
    console.log("Balance before invoke: ", balanceBefore);

    await account.invoke(contract, "increase_balance", { amount1: 10, amount2: 20 });
    const { res: balanceAfter } = await contract.call("get_balance");
    console.log("Balance after invoke:", balanceAfter);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
