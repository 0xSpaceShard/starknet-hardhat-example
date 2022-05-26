import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory } from "hardhat/types";

describe("Starknet", function () {
    let testCacheContractFactory: StarknetContractFactory;

    before(async function () {
        testCacheContractFactory = await starknet.getContractFactory("contract_test_cache");
    });

    it("should check a changed dependency", async function () {
        const contract: StarknetContract = await testCacheContractFactory.deploy();
        console.log("Deployed at", contract.address);

        const { res: res1 } = await contract.call("use_almost_equal", { a: 1, b: 2 });
        expect(res1).to.deep.equal(1n);
    });
});
