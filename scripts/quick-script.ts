import hardhat from "hardhat";
import { getOZAccount } from "../test/util";

async function main() {
    const account = await getOZAccount();

    const contractFactory = await hardhat.starknet.getContractFactory("contract");
    await account.declare(contractFactory);
    const contract = await account.deploy(contractFactory, { initial_balance: 0 });

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
