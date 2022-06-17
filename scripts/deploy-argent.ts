import hardhat from "hardhat";
import { ensureEnvVar } from "../test/util";

async function main() {
    const account = await hardhat.starknet.deployAccount("Argent", {
      salt: "0x42",
      privateKey: ensureEnvVar("ARGENT_ACCOUNT_PRIVATE_KEY")
    });
    
    const expectedAddress = ensureEnvVar("ARGENT_ACCOUNT_ADDRESS");
    if (BigInt(account.address) !== BigInt(expectedAddress)) {
      console.error(`Error! Actual: ${account.address}, expected: ${expectedAddress}`)
      process.exit(1);
    }

    // initializing the Argent account requires invoke `initialize` with a funded account
    const fundedAccount = await hardhat.starknet.getAccountFromAddress(
      ensureEnvVar("OZ_ACCOUNT_ADDRESS"),
      ensureEnvVar("OZ_ACCOUNT_PRIVATE_KEY"),
      "OpenZeppelin"
    );
    await fundedAccount.invoke(account.starknetContract, "initialize", {
      signer: account.publicKey,
      guardian: "0"
    }, {
      maxFee: 1e18
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
