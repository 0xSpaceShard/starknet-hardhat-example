import { expect } from "chai";
import { starknet } from "hardhat";

import { TIMEOUT } from "./constants";

describe("Devnet create block", function () {
    this.timeout(TIMEOUT);

    it("should successively create empty blocks", async () => {
        const latestBlock = await starknet.getBlock();

        const emptyBlock1 = await starknet.devnet.createBlock();
        expect(emptyBlock1.block_number).to.deep.equal(latestBlock.block_number + 1);
        expect(emptyBlock1.transactions).to.be.empty;

        const emptyBlock2 = await starknet.devnet.createBlock();
        expect(emptyBlock2.block_number).to.deep.equal(emptyBlock1.block_number + 1);
        expect(emptyBlock2.transactions).to.be.empty;
    });
});
