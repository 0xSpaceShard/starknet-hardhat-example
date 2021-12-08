import { expect } from "chai";
import { starknet } from "hardhat";

const AMBIGUOUS_ERR_MSG = "More than one file was found because the path provided is ambiguous, please specify a relative path";

describe("getContractFactory", function() {
    this.timeout(600_000);

    it("should handle file name without extension", async function() {
        await starknet.getContractFactory("auth_contract");
    });

    it("should handle file name with extension", async function() {
        await starknet.getContractFactory("auth_contract.cairo");
    });

    it("should handle path without extension", async function() {
        await starknet.getContractFactory("contracts/auth_contract");
    });

    it("should handle path with extension", async function() {
        await starknet.getContractFactory("contracts/auth_contract.cairo");
    });

    it("should throw if name without extension ambiguous", async function() {
        try {
            await starknet.getContractFactory("contract");
            expect.fail("Should have failed");
        } catch (err: any) {
            expect(err.message).to.equal(AMBIGUOUS_ERR_MSG);
        }

        await starknet.getContractFactory("contracts/contract.cairo");
    });
});
