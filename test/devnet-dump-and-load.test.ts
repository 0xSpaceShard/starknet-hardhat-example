import { expect } from "chai";
import { starknet } from "hardhat";
import { TIMEOUT } from "./constants";

describe("Devnet Dump and Load", function () {
    this.timeout(TIMEOUT);

    const dumpPath = "dump.pkl";

    it("Should persist devnet instance after dump and restart", async function () {
        const contractFactory = await starknet.getContractFactory("contract");
        const contract = await contractFactory.deploy({ initial_balance: 0 });

        await contract.invoke("increase_balance", { amount1: 10, amount2: 20 });
        const { res: balanceBeforeDump } = await contract.call("get_balance");
        expect(balanceBeforeDump).to.deep.equal(30n);

        // Dump and restart
        await starknet.devnet.dump(dumpPath);

        await starknet.devnet.restart();

        // Load from dump
        await starknet.devnet.load(dumpPath);

        await contract.invoke("increase_balance", { amount1: 10, amount2: 20 });
        const { res: balanceAfterDumpAndLoad } = await contract.call("get_balance");
        expect(balanceAfterDumpAndLoad).to.deep.equal(60n);
    });
});
