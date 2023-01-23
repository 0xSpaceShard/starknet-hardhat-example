import { starknet } from "hardhat";

/**
 * Used for asserting minimum usability of the plugin.
 */

describe("ContractFactory", () => {
    it("should be created", async () => {
        await starknet.getContractFactory("contract");
    });
});
