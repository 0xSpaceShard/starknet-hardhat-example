import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory } from "hardhat/types/runtime";
import { TIMEOUT } from "./constants";

describe("Starknet", function () {
    this.timeout(TIMEOUT);

    it("quick test for relative artifacts", async function () {
        console.log("Started deployment");
        const contractFactory: StarknetContractFactory = await starknet.getContractFactory(
            "../test/test-artifacts/contract"
        );
        const contract: StarknetContract = await contractFactory.deploy({ initial_balance: 0 });
        console.log("Deployed at", contract.address);

        const { res: balanceBefore } = await contract.call("get_balance");
        expect(balanceBefore).to.deep.equal(0n);
    });
});
