import { expect } from "chai";
import { starknet } from "hardhat";
import { TIMEOUT } from "./constants";

describe("Devnet restart", function () {
    this.timeout(TIMEOUT);

    it("should fetch predeployed accounts successfully", async () => {
        const response = await starknet.devnet.getPredeployedAccounts();
        expect(response).to.be.an("array");
        expect(response[0].address).to.be.a("string");
        expect(response[0].initial_balance).to.be.a("number");
        expect(response[0].private_key).to.be.a("string");
        expect(response[0].public_key).to.be.a("string");
    });
});
