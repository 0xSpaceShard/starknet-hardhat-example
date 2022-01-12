import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory } from "hardhat/types/runtime";
import { TIMEOUT } from "./constants";

const EXPECTED_ADDRESS = "0x0479ace715103887f28e331401eb05bfe8c4bf3c3efa6943367c9e741f23297c";

describe("Starknet", function() {
    this.timeout(TIMEOUT);
    it("should work for a fresh deployment", async function() {
        console.log("Started deployment");
        const contractFactory: StarknetContractFactory = await starknet.getContractFactory("contract");
        const contract: StarknetContract = await contractFactory.deploy({ initial_balance: 0 });
        console.log("Deployed at", contract.address);
    
        const { res: balanceBefore } = await contract.call("get_balance");
        expect(balanceBefore).to.deep.equal(0n);
    
        await contract.invoke("increase_balance", { amount1: 10, amount2: 20 });
        console.log("Increased by 10 + 20");
    
        const { res: balanceAfter } = await contract.call("get_balance");
        expect(balanceAfter).to.deep.equal(30n);
    });

    it("deploy of a contract with salt should provide an expected address", async function() {
        console.log("Started deployment");
        const addressSalt: string = "0x99";
        const contractFactory: StarknetContractFactory = await starknet.getContractFactory("contract");

        const contract: StarknetContract = await contractFactory.deploy({ initial_balance: 0 },addressSalt);
        console.log("Deployed at", contract.address);

        expect(contract.address).to.deep.equal(EXPECTED_ADDRESS);

    });
});
