import { expect } from "chai";
import { starknet } from "hardhat";
import { TIMEOUT } from "./constants";
import { getPredeployedOZAccounts } from "./util";

describe("Devnet restart", function () {
    this.timeout(TIMEOUT);

    it("should fetch predeployed accounts successfully", async () => {
        const response = await starknet.devnet.getPredeployedAccounts();
        expect(response).to.be.an("array");
        expect(response[0].address).to.be.a("string");
        expect(response[0].initial_balance).to.be.a("string");
        expect(response[0].private_key).to.be.a("string");
        expect(response[0].public_key).to.be.a("string");
    });

    it("should fetch n number of OZ account classes from predeployed accounts", async () => {
        const count1 = 4;
        const accounts1 = await getPredeployedOZAccounts(count1);
        expect(accounts1).to.be.an("array");
        expect(accounts1).to.have.lengthOf(count1);

        // Test the ensurePort function with multiple async calls to getAccountFromAddress
        const count2 = 3;
        const accounts2 = await getPredeployedOZAccounts(count2);
        expect(accounts2).to.be.an("array");
        expect(accounts2).to.have.lengthOf(count2);
    });
});
