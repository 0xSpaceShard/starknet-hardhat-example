import hardhat from "hardhat";

async function main() {
    const contractFactory = await hardhat.starknet.getContractFactory("contract");
    const contract = await contractFactory.deploy({ initial_balance: 0 });
    console.log("Deployed to:", contract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
