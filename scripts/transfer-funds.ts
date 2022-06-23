import hardhat from "hardhat";
import { ensureEnvVar } from "../test/util";

function checkImplementation(candidate: string) {
  if (candidate === "Argent" || candidate === "OpenZeppelin") {
    return candidate;
  }
  throw new Error(`Invalid account implementation: ${candidate}`);
}

async function main() {
  const tokenFactory = await hardhat.starknet.getContractFactory(
    "token-contract-artifacts/ERC20"
  );
  const token = tokenFactory.getContractAt(ensureEnvVar("TOKEN_ADDRESS"));

  const sender = await hardhat.starknet.getAccountFromAddress(
    ensureEnvVar("SENDER_ADDRESS"),
    ensureEnvVar("SENDER_PRIVATE_KEY"),
    checkImplementation(ensureEnvVar("SENDER_ACCOUNT_IMPLEMENTATION"))
  );

  const transferAmount = ensureEnvVar("TRANSFER_AMOUNT");

  await sender.invoke(token, "transferFrom", {
    sender: sender.address,
    recipient: ensureEnvVar("RECIPIENT_ADDRESS"),
    amount: { high: 0, low: transferAmount }, // works for transferAmount < 2**128
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
