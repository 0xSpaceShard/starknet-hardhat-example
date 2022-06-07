import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory } from "hardhat/types/runtime";
import { TIMEOUT } from "./constants";

async function quickTest(artifactsPathSegment: string) {
    console.log("Started deployment");
    const contractFactory: StarknetContractFactory = await starknet.getContractFactory(artifactsPathSegment);
    const contract: StarknetContract = await contractFactory.deploy({ initial_balance: 0 });
    console.log("Deployed at", contract.address);

    const { res: balanceBefore } = await contract.call("get_balance");
    expect(balanceBefore).to.deep.equal(0n);

    await contract.invoke("increase_balance", { amount1: 10, amount2: 20 });
    console.log("Increased by 10 + 20");

    const { res: balanceAfter } = await contract.call("get_balance");
    expect(balanceAfter).to.deep.equal(30n);
}

describe("Starknet", function () {
    this.timeout(TIMEOUT);

    it("should work for a fresh deployment", async function () {
        await quickTest("contract");
    });

    it("quick test for relative artifacts", async function () {
        await quickTest("../test/test-aritfacts/contract")
    });
});
