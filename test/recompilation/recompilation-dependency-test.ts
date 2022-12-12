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

    it("should check a changed dependency", async function () {
        const contract = await account.deploy(testCacheContractFactory);
        console.log("Deployed at", contract.address);

        const { res } = await contract.call("use_almost_equal", { a: 1, b: 2 });
        expect(res).to.deep.equal(1n);
    });
});
