import {
    OpenZeppelinAccount,
    StarknetContract,
    StarknetContractFactory
} from "@shardlabs/starknet-hardhat-plugin/dist/src/legacy";
import { expect } from "chai";
import { starknetLegacy as starknet } from "hardhat";
import fs from "node:fs";

import { TIMEOUT } from "./constants";
import { getPredeployedOZAccount } from "./util";

describe("StarknetContractFactory tests", function () {
    this.timeout(TIMEOUT);
    let contractFactory: StarknetContractFactory;
    let account: OpenZeppelinAccount;

    before(async function () {
        account = await getPredeployedOZAccount();
        contractFactory = await starknet.getContractFactory("contract");
    });
    it("should have file at getAbiPath()", async () => {
        const abiPath = contractFactory.getAbiPath();
        expect(fs.existsSync(abiPath)).to.be.true;
    });
    it("should have abi", async () => {
        const { abi } = contractFactory;
        expect(typeof abi).to.be.eq("object");
        expect(abi).to.not.be.null;
        expect(Object.keys(abi).length > 0).to.be.true;
    });
    it("should have increase_balance in abi", async () => {
        const { increase_balance } = contractFactory.abi;
        expect(typeof increase_balance).to.be.eq("object");
        expect(increase_balance.type).to.be.eq("function");
    });
    it("should have file at metadataPath", async () => {
        const { metadataPath } = contractFactory;
        expect(fs.existsSync(metadataPath)).to.be.true;
    });
    it("should declare with tx hash as return", async () => {
        const txHash = await account.declare(contractFactory);
        expect(typeof txHash).to.be.eq("string");
        expect(txHash.indexOf("0x")).to.be.eq(0);
    });
    it("should getClassHash", async () => {
        const classHash = await contractFactory.getClassHash();
        expect(typeof classHash).to.be.eq("string");
        expect(classHash.indexOf("0x")).to.be.eq(0);
    });
    it("should getContractAt", async () => {
        const { address } = await account.deploy(contractFactory, { initial_balance: 0 });
        const contract = contractFactory.getContractAt(address);
        expect(contract instanceof StarknetContract).to.be.true;
    });
});
