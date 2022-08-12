import fs from "fs";
import path from "path";
import { expect } from "chai";
import { starknet, config } from "hardhat";
import { StarknetContractFactory } from "hardhat/types";

describe("Starknet", function () {
    const cacheDirpath = path.join(config.paths.cache, "cairo-files-cache.json");
    let contractFactory: StarknetContractFactory;
    let testCacheContractFactory: StarknetContractFactory;

    before(async function () {
        contractFactory = await starknet.getContractFactory("contract");
        testCacheContractFactory = await starknet.getContractFactory("contract_test_cache");
    });

    it("should get contract artifacts on recompilation", async function () {
        expect(contractFactory.getAbiPath()).to.contain("contract_abi.json");
        expect(testCacheContractFactory).not.to.be.undefined;
    });

    it("should handle cache existense", async function () {
        // Read a cache file check for it's existense
        expect(fs.existsSync(cacheDirpath)).to.be.true;
    });
});
