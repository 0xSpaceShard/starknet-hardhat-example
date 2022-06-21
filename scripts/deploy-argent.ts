import hardhat from "hardhat";
import { ArgentAccount } from "hardhat/types/runtime";
import { ensureEnvVar, expectAddressEquality } from "../test/util";

describe("Argent account", function () {
  it("should deploy and initialize", async function () {
    const account = <ArgentAccount>await hardhat.starknet.deployAccount(
      "Argent",
      {
        salt: "0x42",
        privateKey: ensureEnvVar("ARGENT_ACCOUNT_PRIVATE_KEY"),
      }
    );

    const expectedAddress = ensureEnvVar("ARGENT_ACCOUNT_ADDRESS");
    expectAddressEquality(account.address, expectedAddress);

    // initializing Argent account requires invoking `initialize` with a funded account
    const fundedAccount = await hardhat.starknet.getAccountFromAddress(
      ensureEnvVar("OZ_ACCOUNT_ADDRESS"),
      ensureEnvVar("OZ_ACCOUNT_PRIVATE_KEY"),
      "OpenZeppelin"
    );
    await fundedAccount.invoke(
      account.starknetContract,
      "initialize",
      {
        signer: account.publicKey,
        guardian: account.guardianPublicKey || "0",
      },
      {
        maxFee: 1e18,
      }
    );
  });
});
