import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory } from "hardhat/types";

describe("Starknet", function () {
    let helloContractFactory: StarknetContractFactory;

    before(async function () {
        helloContractFactory = await starknet.getContractFactory("hello");
    });

    it("should check updated contract with new function after recompilation", async function () {
        const contract: StarknetContract = await helloContractFactory.deploy();
        console.log("Deployed at", contract.address);
    
        const { res: balanceBefore } = await contract.call("get_balance");
        expect(balanceBefore).to.deep.equal(0n);
    });
});``