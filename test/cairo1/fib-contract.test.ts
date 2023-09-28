import { expect } from "chai";
import { starknetLegacy as starknet } from "hardhat";

import { TIMEOUT } from "../constants";
import { getOZAccount } from "../util";

describe("Fib Contract", function () {
    this.timeout(TIMEOUT);
    it("should declare + deploy + call", async function () {
        const account = await getOZAccount();

        const contractFactory = await starknet.getContractFactory(
            "sample_package_name_FibContract"
        );
        const txHash = await account.declare(contractFactory, { maxFee: 1e18 });
        console.log("Declaration tx hash", txHash);

        const initial_balance = 42n;
        const fibContract = await account.deploy(contractFactory, { initial_balance });
        console.log("Deployment tx hash", fibContract.deployTxHash);
        console.log("Deployed to", fibContract.address);

        const retrievedBalance = await fibContract.call("get_balance");
        expect(retrievedBalance).to.equal(initial_balance);

        const fibResult = await fibContract.call("get_fib", { n: 5 });
        const expectedLast = 5n;
        const expectedSize = 5n;
        expect(fibResult).to.deep.equal([[1n, 1n, 2n, 3n, 5n], expectedLast, expectedSize]);
    });
});
