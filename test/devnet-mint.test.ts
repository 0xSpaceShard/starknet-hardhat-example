import { expect } from "chai";
import { starknet } from "hardhat";

import { TIMEOUT } from "./constants";

describe("Devnet mint", function () {
    this.timeout(TIMEOUT);
    let balance = 0;
    // Randomly chosen address
    const address = "0x22ed43906d3793bfb99db233f3e9a14d283794515d124ef94398e1248693fb7";
    const diff = 25e4;

    it("should have valid response", async () => {
        const resp = await starknet.devnet.mint(address, 0, true);
        const { new_balance, unit, tx_hash } = resp;
        balance = new_balance;

        expect(typeof new_balance).to.equal("number");
        expect(unit).to.equal("wei");
        expect(tx_hash).to.equal(null);
    });

    it("should tx_hash in separate transaction (not lite) mode", async () => {
        const resp = await starknet.devnet.mint(address, 0, false);

        const { new_balance, unit, tx_hash } = resp;
        balance = new_balance;

        expect(typeof new_balance).to.equal("number");
        expect(unit).to.equal("wei");
        expect(typeof tx_hash).to.equal("string");
        expect(tx_hash.indexOf("0x")).to.equal(0);
    });

    it("should mint lite mode", async () => {
        const resp = await starknet.devnet.mint(address, diff, true);
        expect(resp.new_balance).to.deep.equal(diff + balance);
        balance = resp.new_balance; // Update balance for next test
    });

    it("should mint in separate transaction (not lite)", async () => {
        const resp = await starknet.devnet.mint(address, diff, false);
        expect(resp.new_balance).to.deep.equal(diff + balance);
        balance = resp.new_balance; // Update balance for next test
    });
});
