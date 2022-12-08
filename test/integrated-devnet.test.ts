import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory } from "hardhat/types/runtime";
import axios from "axios";

import { TIMEOUT } from "./constants";
import { getOZAccount } from "./util";

describe("Starknet with integrated devnet", function () {
    this.timeout(TIMEOUT);

    it("should work for a fresh deployment", async function () {
        const account = await getOZAccount();

        console.log("Started deployment");
        const contractFactory: StarknetContractFactory = await starknet.getContractFactory(
            "contract"
        );
        await account.declare(contractFactory);

        const contract: StarknetContract = await account.deploy(contractFactory, {
            initial_balance: 0
        });
        console.log("Deployed at", contract.address);

        const { res: balanceBefore } = await contract.call("get_balance");
        expect(balanceBefore).to.deep.equal(0n);

        await account.invoke(contract, "increase_balance", { amount1: 10, amount2: 20 });
        console.log("Increased by 10 + 20");

        const { res: balanceAfter } = await contract.call("get_balance");
        expect(balanceAfter).to.deep.equal(30n);
    });

    it("should have devnet endpoint alive", async () => {
        const response = await axios.get(`${starknet.networkConfig.url}/is_alive`);

        expect(response.status).to.equal(200);
    });
});
