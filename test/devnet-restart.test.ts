import { expect } from "chai";
import { starknet } from "hardhat";

import { TIMEOUT } from "./constants";

describe("Devnet restart", function() {
    this.timeout(TIMEOUT);

    it("should pass", async () => {
        const response = await starknet.devnet.restart();
        expect(response).to.be.undefined;
    });

    it("should restart deployed contracts", async () => {
        const contractFactory = await starknet.getContractFactory("contract");
        const contract = await contractFactory.deploy({ initial_balance: 0 });

        await contract.invoke("increase_balance", { amount1: 10, amount2: 20 });
        const { res: balanceAfter } = await contract.call("get_balance");
        expect(balanceAfter).to.deep.equal(30n);

        await starknet.devnet.restart();

        try {
            await contract.invoke("increase_balance", { amount1: 10, amount2: 20 });
            expect.fail("Should throw");
        } catch (error: any) {
            expect(error.message).to.contain("No contract at the provided address");
        }
    })

    it("should enable to redeploy to the same address", async () => {
        const salt = "0xbabe"

        const contractFactory = await starknet.getContractFactory("contract");
        let contract = await contractFactory.deploy({ initial_balance: 0 }, { salt });
        const initialAddress = contract.address;

        await starknet.devnet.restart();

        contract = await contractFactory.deploy({ initial_balance: 0 }, { salt });
        expect(contract.address).to.equal(initialAddress);
    })

    it("should enable to use the same instance", async () => {
        const salt = "0xb0a";

        const contractFactory = await starknet.getContractFactory("contract");
        const contract = await contractFactory.deploy({ initial_balance: 0 }, { salt });
        const initialAddress = contract.address;

        await contract.invoke("increase_balance", { amount1: 10, amount2: 20 });
        const { res: initialBalance } = await contract.call("get_balance");
        expect(initialBalance).to.deep.equal(30n);

        await starknet.devnet.restart();

        // redeploy
        await contractFactory.deploy({ initial_balance: 0 }, { salt });
        const { res: balanceAfterRestart } = await contract.call("get_balance");
        expect(balanceAfterRestart).to.deep.equal(0n);

        await contract.invoke("increase_balance", { amount1: 10, amount2: 20 });
        expect(contract.address).to.equal(initialAddress);

        const { res: balanceAfterInvoke } = await contract.call("get_balance");
        expect(balanceAfterInvoke).to.deep.equal(30n);
    })
});
