import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory } from "hardhat/types";

describe("Starknet", function () {
    let testCacheContractFactory: StarknetContractFactory;

    before(async function () {
        testCacheContractFactory = await starknet.getContractFactory("contract_test_cache");
    });

    it("should check updated contract with new function after recompilation", async function () {
        const contract: StarknetContract = await testCacheContractFactory.deploy();
        console.log("Deployed at", contract.address);

        const { res: balanceBefore } = await contract.call("get_balance");
        expect(balanceBefore).to.deep.equal(0n);
    });
});
