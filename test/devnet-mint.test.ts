import { expect } from "chai";
import { starknet } from "hardhat";

import { TIMEOUT } from "./constants";

describe("Devnet mint", function () {
    this.timeout(TIMEOUT);
    let balance = 0;
    const address = "0x22edb233f3bfb99d2e9a14d283794515d124ef94398e143906d379348693fb7";
    const div = 1e16; // To round off large numbers
    const diff = 25 * div;

    it("should have valid response", async () => {
        const resp = await starknet.devnet.mint(address, 0, true);
        const { new_balance, unit, tx_hash } = resp;
        balance = new_balance;

        expect(typeof new_balance).to.equal("number");
        expect(unit).to.equal("wei");
        expect(tx_hash).to.equal(null);
    });

    it("should tx_hash in separate transaction (not lite) mode", async () => {
        const resp = await starknet.devnet.mint(address, 0, true);
        const { new_balance, unit, tx_hash } = resp;
        balance = new_balance;

        expect(typeof new_balance).to.equal("number");
        expect(unit).to.equal("wei");
        expect(tx_hash).to.equal(null);
    });

    it("should mint lite mode", async () => {
        const resp = await starknet.devnet.mint(address, diff, true);
        expect(Math.round(resp.new_balance / div - balance / div)).to.deep.equal(diff / div);
        balance = resp.new_balance; // Update balance for next test
    });
    it("should mint in separate transaction (not lite)", async () => {
        const resp = await starknet.devnet.mint(address, diff, false);
        expect(Math.round(resp.new_balance / div - balance / div)).to.deep.equal(diff / div);
        balance = resp.new_balance; // Update balance for next test
    });
});
