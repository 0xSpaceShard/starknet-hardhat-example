import { expect } from "chai";
import { starknet } from "hardhat";
import { Account, StarknetContractFactory } from "hardhat/types";
import { getOZAccount } from "../util";

describe("Starknet", function () {
    let testCacheContractFactory: StarknetContractFactory;
    let account: Account;

    before(async function () {
        account = await getOZAccount();
        testCacheContractFactory = await starknet.getContractFactory("contract_test_cache");
        await account.declare(testCacheContractFactory);
    });

    it("should check updated contract with new function after recompilation", async function () {
        const contract = await account.deploy(testCacheContractFactory);
        console.log("Deployed at", contract.address);

        const { res: balanceBefore } = await contract.call("get_balance");
        expect(balanceBefore).to.deep.equal(0n);
    });
});
