import hardhat from "hardhat";

async function main() {
    await hardhat.run("starknet-compile-deprecated", {
        paths: ["contracts/contract.cairo"]
    });

    await hardhat.run("starknet-compile", {
        paths: ["cairo1-contracts/contract1.cairo"],
        addPythonicHints: true,
        singleFile: true
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
