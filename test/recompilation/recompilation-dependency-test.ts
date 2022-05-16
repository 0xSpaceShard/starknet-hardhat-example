import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory } from "hardhat/types";

describe("Starknet", function () {
    let helloContractFactory: StarknetContractFactory;

    before(async function () {
        helloContractFactory = await starknet.getContractFactory("hello");
    });

    it("should check a changed dependency", async function () {
        const contract: StarknetContract = await helloContractFactory.deploy();
        console.log("Deployed at", contract.address);

        const { res: res1 } = await contract.call("use_almost_equal", { a: 1, b: 2 });
        expect(res1).to.deep.equal(1n);
    });
});
