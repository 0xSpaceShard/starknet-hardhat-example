import { expect } from "chai";
import { starknet } from "hardhat";
import { TIMEOUT } from "./constants";
import { expectFeeEstimationStructure, getOZAccount } from "./util";

describe("Class declaration", function () {
    this.timeout(TIMEOUT);
    it("should declare using declare v2 and interact with the class", async function () {
        const account = await getOZAccount();

        const contractFactory = await starknet.getContractFactory("contract1");
        // Estimates declare V2 tx fee
        const declareFee = await account.estimateDeclareFee(contractFactory);
        expectFeeEstimationStructure(declareFee);

        const declareTxHash = await account.declare(contractFactory);
        console.log("Declare v2 Tx Hash: ", declareTxHash);
        const deployFee = await account.estimateDeployFee(contractFactory, {
            initial_balance: 10n
        });
        console.log("Estimated deploy fee: ", deployFee);

        const contract = await account.deploy(
            contractFactory,
            {
                initial_balance: 10n
            },
            { maxFee: deployFee.amount }
        );
        const balanceBefore = await contract.call("get_balance");
        expect(balanceBefore.response).to.deep.equal(10n);

        const args = { amount1: 10n, amount2: 20n };
        const fee = await account.estimateFee(contract, "increase_balance", args);
        console.log("Estimated invoke fee:", fee);

        await account.invoke(contract, "increase_balance", args, { maxFee: fee.amount * 2n });
        console.log("Increased balance");

        const balanceAfter = await contract.call("get_balance");
        console.log("balance after", balanceAfter.response);
        expect(balanceAfter.response).to.deep.equal(40n);
    });
});
