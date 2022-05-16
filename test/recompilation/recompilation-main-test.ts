import fs from "fs";
import path from "path";
import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContractFactory } from "hardhat/types";

describe("Starknet", function () {
    const cacheDirpath = path.join(__dirname, "..", "..", "cache/cairo-files-cache.json");
    let contractFactory: StarknetContractFactory;
    let helloContractFactory: StarknetContractFactory;

    before(async function () {
        contractFactory = await starknet.getContractFactory("contract");
        helloContractFactory = await starknet.getContractFactory("hello");
    });

    it("should get contract artifacts on recompilation", async function () {
        expect(contractFactory.getAbiPath()).to.contain('contract_abi.json');
        expect(helloContractFactory).not.to.be.undefined;
    });

    it("should handle cache existense", async function () {
        // Read a cache file check for it's existense
        expect(fs.existsSync(cacheDirpath)).to.be.true;
    });
});
