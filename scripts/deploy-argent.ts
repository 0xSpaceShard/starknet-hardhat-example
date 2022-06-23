import hardhat from "hardhat";
import { ArgentAccount, StarknetContract } from "hardhat/types/runtime";
import { TIMEOUT } from "../test/constants";
import { ensureEnvVar, expectAddressEquality } from "../test/util";

describe("Argent account", function () {
  this.timeout(TIMEOUT);
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


    // const tokenFactory = await hardhat.starknet.getContractFactory(
    //   "../token-contract-artifacts/ERC20"
    // );
    // const token = tokenFactory.getContractAt(ensureEnvVar("TOKEN_ADDRESS"));
  
    // console.log(
    //   "Balances before (sender, recipient):",
    //   await getBalance(token, fundedAccount.address),
    //   await getBalance(token, account.address)
    // );
  
    // const transferAmount = BigInt(ensureEnvVar("TRANSFER_AMOUNT"));
    // console.log(`Transfering fund amount:${transferAmount}`);
  
    // const transferArgs = {
    //   recipient: account.address,
    //   amount: { high: 0, low: transferAmount }, // works for transferAmount < 2**128
    // };
    // await fundedAccount.invoke(token, "transfer", transferArgs, {
    //   maxFee: 1e18
    // });
  
    // console.log(
    //   "Balances after (sender, recipient):",
    //   await getBalance(token, fundedAccount.address),
    //   await getBalance(token, account.address)
    // );
  });
});
