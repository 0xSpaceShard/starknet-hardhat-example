import { expect } from "chai";
import { starknet } from "hardhat"

describe("Devnet restart", function() {
    this.timeout(900_000);

    it("should pass", async () => {
        const response = await starknet.devnet.getPredeployedAccounts();
        expect(response).to.be.an('array')
        expect(response[0].address).to.be.a('string')
        expect(response[0].initial_balance).to.be.a('number')
        expect(response[0].private_key).to.be.a('string')
        expect(response[0].public_key).to.be.a('string')
    });
})