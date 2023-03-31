import { expect } from "chai";
import { starknet } from "hardhat";
import { TIMEOUT } from "./constants";
import { getOZAccount } from "./util";

describe("Class declaration", function () {
    this.timeout(TIMEOUT);
    it("should declare using declare v2 and interact with the class", async function () {
        const account = await getOZAccount();

        const contractFactory = await starknet.getContractFactory("cairo1");
        const declareTxHash = await account.declareV2(contractFactory);
        console.log("Declare Tx Hash: ", declareTxHash);
        const deployFee = await account.estimateDeployFee(contractFactory);
        console.log("Estimated deploy fee: ", deployFee);

        const contract = await account.deploy(contractFactory, {}, { maxFee: 1e18 });
        const { res: balanceBefore } = await contract.call("get_balance");
        expect(balanceBefore).to.deep.equal(0n);

        const args = { amount1: 10, amount2: 20 };
        const fee = await account.estimateFee(contract, "increase_balance", args);
        console.log("Estimated invoke fee:", fee);

        await account.invoke(contract, "increase_balance", args, { maxFee: fee.amount * 2n });
        console.log("Increased balance");

        const { res: balanceAfter } = await contract.call("get_balance");
        expect(balanceAfter).to.deep.equal(30n);
    });
});
