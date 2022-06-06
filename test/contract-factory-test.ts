import { starknet } from "hardhat";

describe("ContractFactory", () => {
    it("should be created", async () => {
        await starknet.getContractFactory("contract");
    });

    it('load artifact outside artifacts folder', async () => {
        await starknet.getContractFactory("../test/test-artifacts/contract");
    })
});
