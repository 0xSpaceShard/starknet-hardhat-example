import hardhat, { ArgentAccount } from "hardhat";
import { ensureEnvVar } from "../test/util";

async function main() {
    const contractFactory = await hardhat.starknet.getContractFactory("contract");
    const account = await ArgentAccount.getAccountFromAddress(
        ensureEnvVar("OZ_ACCOUNT_ADDRESS"),
        ensureEnvVar("OZ_ACCOUNT_PRIVATE_KEY")
    );
    const contract = await account.deploy(contractFactory, { initial_balance: 0 });
    console.log("Deployed to:", contract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
