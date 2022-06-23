import hardhat from "hardhat";
import { ensureEnvVar } from "../test/util";
import { StarknetContract } from "hardhat/types";
import { TIMEOUT } from "../test/constants";

function checkImplementation(candidate: string) {
  if (candidate === "Argent" || candidate === "OpenZeppelin") {
    return candidate;
  }
  throw new Error(`Invalid account implementation: ${candidate}`);
}

async function getBalance(token: StarknetContract, accountAddress: string) {
  const { balance } = await token.call("balanceOf", {
    account: accountAddress,
  });
  return balance;
}

describe("Argent account", function () {
  this.timeout(TIMEOUT);
  it("should be funded", async function () {
    const tokenFactory = await hardhat.starknet.getContractFactory(
      "../token-contract-artifacts/ERC20"
    );
    const tokenAddress = ensureEnvVar("TOKEN_ADDRESS");
    console.log("Token address", tokenAddress);
    const token = tokenFactory.getContractAt(tokenAddress);

    const senderAddress = ensureEnvVar("SENDER_ADDRESS");
    console.log("Sender address", senderAddress);
    const senderPrivateKey = ensureEnvVar("SENDER_PRIVATE_KEY");
    console.log("Sender private key", senderPrivateKey);
    const senderImplementation = checkImplementation(
      ensureEnvVar("SENDER_IMPLEMENTATION")
    );
    console.log("Sender implementation", senderImplementation);

    const sender = await hardhat.starknet.getAccountFromAddress(
      senderAddress,
      senderPrivateKey,
      senderImplementation
    );

    const recipientAddress = ensureEnvVar("RECIPIENT_ADDRESS");
    console.log("Recipient address", recipientAddress);

    console.log(
      "Balances before (sender, recipient):",
      await getBalance(token, sender.address),
      await getBalance(token, recipientAddress)
    );

    const transferAmount = BigInt(ensureEnvVar("TRANSFER_AMOUNT"));
    console.log(`Transfering fund amount: ${transferAmount}`);

    const transferArgs = {
      recipient: recipientAddress,
      amount: { high: 0, low: transferAmount }, // works for transferAmount < 2**128
    };
    await sender.invoke(token, "transfer", transferArgs, {
      maxFee: 1e18,
    });

    console.log(
      "Balances after (sender, recipient):",
      await getBalance(token, sender.address),
      await getBalance(token, recipientAddress)
    );
  });
});
