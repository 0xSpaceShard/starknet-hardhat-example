import { expect } from "chai";
import { starknet } from "hardhat";

import { TIMEOUT } from "./constants";

describe("Devnet create block", function () {
    this.timeout(TIMEOUT);

    it("should successively create empty blocks", async () => {
        const emptyBlock1 = await starknet.devnet.createBlock();
        const emptyBlock1Response = await starknet.getBlock({ blockHash: emptyBlock1.block_hash });
        expect(emptyBlock1Response.transactions).to.be.empty;

        const emptyBlock2 = await starknet.devnet.createBlock();
        const emptyBlock2Response = await starknet.getBlock({ blockHash: emptyBlock2.block_hash });
        expect(emptyBlock2Response.transactions).to.be.empty;
    });
});
