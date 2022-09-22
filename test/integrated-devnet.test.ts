import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory } from "hardhat/types/runtime";
import axios from "axios";

import { TIMEOUT } from "./constants";
import { ensureEnvVar } from "./util";

describe("Starknet with integrated devnet", function () {
    this.timeout(TIMEOUT);

    it("should work for a fresh deployment", async function () {
        const account = await starknet.getAccountFromAddress(
            ensureEnvVar("OZ_ACCOUNT_ADDRESS"),
            ensureEnvVar("OZ_ACCOUNT_PRIVATE_KEY"),
            "OpenZeppelin"
        );

        console.log("Started deployment");
        const contractFactory: StarknetContractFactory = await starknet.getContractFactory(
            "contract"
        );
        const contract: StarknetContract = await contractFactory.deploy({ initial_balance: 0 });
        console.log("Deployed at", contract.address);

        const { res: balanceBefore } = await contract.call("get_balance");
        expect(balanceBefore).to.deep.equal(0n);

        await account.invoke(contract, "increase_balance", { amount1: 10, amount2: 20 });
        console.log("Increased by 10 + 20");

        const { res: balanceAfter } = await contract.call("get_balance");
        expect(balanceAfter).to.deep.equal(30n);
    });

    it("should have devnet endpoint alive", async () => {
        const response = await axios.get("http://127.0.0.1:5050/is_alive");

        expect(response.status).to.equal(200);
    });
});
