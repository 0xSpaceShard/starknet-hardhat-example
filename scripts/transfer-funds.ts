import hardhat, { starknet } from "hardhat";
import { ensureEnvVar } from "../test/util";
import { StarknetContract } from "hardhat/types";
import { TIMEOUT } from "../test/constants";
import { expect } from "chai";

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

        const sender = await starknet.OpenZeppelinAccount.getAccountFromAddress(
            ensureEnvVar("SENDER_ADDRESS"),
            ensureEnvVar("SENDER_PRIVATE_KEY")
        );

        const transferAmount = BigInt(ensureEnvVar("TRANSFER_AMOUNT"));
        const recipientAddress = ensureEnvVar("RECIPIENT_ADDRESS");
        console.log(`Sending ${transferAmount} wei from ${sender.address} to ${recipientAddress}`);

        const recipientBalanceBefore = await getBalance(token, recipientAddress);

        await sender.invoke(token, "transfer", {
            recipient: recipientAddress,
            amount: { high: 0, low: transferAmount } // works for transferAmount < 2**128
        });

        const recipientBalanceAfter = await getBalance(token, recipientAddress);
        const expectedBalanceAfter = {
            high: recipientBalanceBefore.high,
            low: recipientBalanceBefore.low + transferAmount
        };
        expect(recipientBalanceAfter).to.deep.equal(expectedBalanceAfter);
    });
});
