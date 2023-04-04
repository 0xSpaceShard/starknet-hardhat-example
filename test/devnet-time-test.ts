import { expect } from "chai";
import { starknet } from "hardhat";
import { TIMEOUT } from "./constants";

describe("Devnet Block Time", function () {
    this.timeout(TIMEOUT);

    it("Should update time for following block", async function () {
        // Increase time for each block
        const resIncrease = await starknet.devnet.increaseTime(1000);
        expect(resIncrease.timestamp_increased_by).to.be.equal(1000);

        // Set time for next block
        const resSetTime = await starknet.devnet.setTime(1000);
        expect(resSetTime.block_timestamp).to.be.equal(1000);
    });
});
