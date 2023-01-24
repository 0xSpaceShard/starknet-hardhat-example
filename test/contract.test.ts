import { expect } from "chai";
import { starknet } from "hardhat";
import { TIMEOUT } from "./constants";
import { StarknetContractFactory } from "hardhat/types/runtime";
import { getPredeployedOZAccount } from "./util";
import { OpenZeppelinAccount } from "@shardlabs/starknet-hardhat-plugin/dist/src/account";
import { StarknetContract } from "@shardlabs/starknet-hardhat-plugin/dist/src/types";

describe("StarknetContract tests", function () {
    this.timeout(TIMEOUT);
    let contractFactory: StarknetContractFactory;
    let account: OpenZeppelinAccount;
    let contract: StarknetContract;
    const initial_balance = 25n;

    before(async function () {
        account = await getPredeployedOZAccount();
        contractFactory = await starknet.getContractFactory("contract");
        await account.declare(contractFactory);
        contract = await account.deploy(contractFactory, { initial_balance });
    });
    it("should have address", async () => {
        const { address } = account;
        expect(typeof address).to.be.eq("string");
        expect(address.indexOf("0x")).to.be.eq(0);
    });
    it("should have valid abi: getAbi", async () => {
        const abi = contract.getAbi();
        expect(typeof abi).to.be.eq("object");
        expect(typeof abi.increase_balance).to.be.eq("object");
        expect(abi.increase_balance.type).to.be.eq("function");
    });
    it("should call", async () => {
        const resp = await contract.call("get_balance");
        console.log(resp);
        expect(resp.res).to.be.eq(initial_balance);
    });
    it("should invoke", async () => {
        const txnHash = await account.invoke(contract, "increase_balance", {
            amount1: 20,
            amount2: 5
        });
        expect(typeof txnHash).to.be.eq("string");
        expect(txnHash.indexOf("0x")).to.be.eq(0);
    });
    it("should estimateFee", async () => {
        const feeEstimation = await account.estimateFee(contract, "increase_balance", {
            amount1: 20,
            amount2: 5
        });
        expect(typeof feeEstimation.amount).to.be.eq("bigint");
        expect(typeof feeEstimation.unit).to.be.eq("string");
        expect(typeof feeEstimation.gas_price).to.be.eq("bigint");
        expect(typeof feeEstimation.gas_usage).to.be.eq("bigint");
    });

    // Decode events test in test/decode-events.test.ts
});
