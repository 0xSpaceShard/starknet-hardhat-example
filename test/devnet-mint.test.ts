import { expect } from "chai";
import { starknet } from "hardhat";

import { TIMEOUT } from "./constants";

describe("Devnet mint", function () {
    this.timeout(TIMEOUT);
    let balance = 0,
        address = "";
    const div = 1e16; // To round off large numbers
    const diff = 25 * div;

    before(async () => {
        const accounts = await starknet.devnet.getPredeployedAccounts();
        address = accounts[0].address;
    });

    it("should contain balance", async () => {
        const balanceResponse = await starknet.devnet.mint(address, 0, true);
        balance = balanceResponse.new_balance;

        expect(typeof balance).to.equal("number");
    });
    it("shuold mint a quarter eth", async () => {
        const mintedBalanceResponse = await starknet.devnet.mint(address, diff, true);
        const newBalance = mintedBalanceResponse.new_balance;

        expect(Math.round(newBalance / div - balance / div)).to.deep.equal(diff / div);
    });
});
