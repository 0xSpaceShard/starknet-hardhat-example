import { expect } from "chai";
import { starknet } from "hardhat";

import { TIMEOUT } from "./constants";

describe("Devnet create block", function () {
    this.timeout(TIMEOUT);

    it("should successively create empty blocks", async () => {
        const latestBlock = await starknet.getBlock();

        const emptyBlock1 = await starknet.devnet.createBlock();
        expect(Number(emptyBlock1.block_hash)).to.deep.equal(Number(latestBlock.block_hash) + 1);
        const emptyBlock1Response = await starknet.getBlock({ blockHash: emptyBlock1.block_hash });
        expect(emptyBlock1Response.transactions).to.be.empty;

        const emptyBlock2 = await starknet.devnet.createBlock();
        expect(Number(emptyBlock2.block_hash)).to.deep.equal(Number(emptyBlock1.block_hash) + 1);
        const emptyBlock2Response = await starknet.getBlock({ blockHash: emptyBlock2.block_hash });
        expect(emptyBlock2Response.transactions).to.be.empty;
    });
});
