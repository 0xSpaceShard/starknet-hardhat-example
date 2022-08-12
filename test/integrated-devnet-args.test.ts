import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory } from "hardhat/types/runtime";

import { TIMEOUT } from "./constants";

describe("Starknet with optional arguments in integrated devnet", function () {
    this.timeout(TIMEOUT);

    it("should work for args passed in config", async function () {
        console.log("Started deployment");
        const contractFactory: StarknetContractFactory = await starknet.getContractFactory(
            "contract"
        );
        const contract: StarknetContract = await contractFactory.deploy({ initial_balance: 0 });
        console.log("Deployed at", contract.address);
        const latestBlock = await starknet.getBlock();

        expect(parseInt(latestBlock.gas_price, 16)).to.be.equal(2000000000);
    });
});
