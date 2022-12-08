import { expect } from "chai";
import { starknet } from "hardhat";
import { TIMEOUT } from "./constants";
import { getOZAccount } from "./util";

describe("Starknet", function () {
    this.timeout(TIMEOUT);

    it("quick test for relative artifacts", async function () {
        console.log("Started deployment");
        const account = await getOZAccount();

        const contractFactory = await starknet.getContractFactory(
            "../test/test-artifacts/contract"
        );
        await account.declare(contractFactory);

        const contract = await account.deploy(contractFactory, {
            initial_balance: 0
        });
        console.log("Deployed at", contract.address);

        const { res: balanceBefore } = await contract.call("get_balance");
        expect(balanceBefore).to.deep.equal(0n);
    });
});
