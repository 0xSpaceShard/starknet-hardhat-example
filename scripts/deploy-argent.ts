import hardhat from "hardhat";
import { ArgentAccount } from "hardhat/types/runtime";
import { TIMEOUT } from "../test/constants";
import { ensureEnvVar, expectAddressEquality } from "../test/util";

describe("Argent account", function () {
    this.timeout(TIMEOUT);
    it("should deploy and initialize", async function () {
        const account = <ArgentAccount> await hardhat.starknet.deployAccount("Argent", {
            salt: ensureEnvVar("ARGENT_ACCOUNT_SALT"),
            privateKey: ensureEnvVar("ARGENT_ACCOUNT_PRIVATE_KEY")
        });

        const expectedAddress = ensureEnvVar("ARGENT_ACCOUNT_ADDRESS");
        expectAddressEquality(account.address, expectedAddress);

        // initializing Argent account requires invoking `initialize` with a funded account
        const fundedAccount = await hardhat.starknet.getAccountFromAddress(
            ensureEnvVar("OZ_ACCOUNT_ADDRESS"),
            ensureEnvVar("OZ_ACCOUNT_PRIVATE_KEY"),
            "OpenZeppelin"
        );
        await account.initialize({ fundedAccount, maxFee: 1e18 });
    });
});
