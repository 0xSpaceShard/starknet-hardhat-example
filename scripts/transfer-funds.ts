import hardhat from "hardhat";
import { ensureEnvVar } from "../test/util";
import { StarknetContract } from "hardhat/types";
import { TIMEOUT } from "../test/constants";
import { expect } from "chai";

function checkImplementation(candidate: string) {
    if (candidate === "Argent" || candidate === "OpenZeppelin") {
        return candidate;
    }
    throw new Error(`Invalid account implementation: ${candidate}`);
}

async function getBalance(token: StarknetContract, accountAddress: string) {
    const { balance } = await token.call("balanceOf", {
        account: accountAddress
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
        const token = tokenFactory.getContractAt(tokenAddress);

        const sender = await hardhat.starknet.getAccountFromAddress(
            ensureEnvVar("SENDER_ADDRESS"),
            ensureEnvVar("SENDER_PRIVATE_KEY"),
            checkImplementation(ensureEnvVar("SENDER_IMPLEMENTATION"))
        );

        const transferAmount = BigInt(ensureEnvVar("TRANSFER_AMOUNT"));
        const recipientAddress = ensureEnvVar("RECIPIENT_ADDRESS");
        console.log(`Sending ${transferAmount} wei from ${sender.address} to ${recipientAddress}`);

        const recipientBalanceBefore = await getBalance(token, recipientAddress);

        const transferArgs = {
            recipient: recipientAddress,
            amount: { high: 0, low: transferAmount } // works for transferAmount < 2**128
        };
        const estimatedFee = await sender.estimateFee(token, "transfer", transferArgs);
        await sender.invoke(token, "transfer", transferArgs, {
            maxFee: estimatedFee.amount * 2n
        });

        const recipientBalanceAfter = await getBalance(token, recipientAddress);
        const expectedBalanceAfter = {
            high: recipientBalanceBefore.high,
            low: recipientBalanceBefore.low + transferAmount
        };
        expect(recipientBalanceAfter).to.deep.equal(expectedBalanceAfter);
    });
});
