import { expect } from "chai";
import { starknet } from "hardhat";
import { Account } from "hardhat/types";

import { TIMEOUT } from "./constants";
import { ensureEnvVar } from "./util";

describe("Devnet restart", function () {
    this.timeout(TIMEOUT);

    let account: Account;

    before(async function () {
        account = await starknet.getAccountFromAddress(
            ensureEnvVar("OZ_ACCOUNT_ADDRESS"),
            ensureEnvVar("OZ_ACCOUNT_PRIVATE_KEY"),
            "OpenZeppelin"
        );
    });

    it("should pass", async () => {
        const response = await starknet.devnet.restart();
        expect(response).to.be.undefined;
    });

    it("should restart deployed contracts", async () => {
        const contractFactory = await starknet.getContractFactory("contract");
        const contract = await contractFactory.deploy({ initial_balance: 0 });

        await account.invoke(contract, "increase_balance", { amount1: 10, amount2: 20 });
        const { res: balanceAfter } = await contract.call("get_balance");
        expect(balanceAfter).to.deep.equal(30n);

        await starknet.devnet.restart();

        try {
            await account.invoke(contract, "increase_balance", { amount1: 10, amount2: 20 });
            expect.fail("Should throw");
        } catch (error: any) {
            expect(error.message).to.match(
                /Requested contract address 0x[a-fA-F0-9]+ is not deployed/
            );
        }
    });

    it("should enable to redeploy to the same address", async () => {
        const salt = "0xbabe";

        const contractFactory = await starknet.getContractFactory("contract");
        let contract = await contractFactory.deploy({ initial_balance: 0 }, { salt });
        const initialAddress = contract.address;

        await starknet.devnet.restart();

        contract = await contractFactory.deploy({ initial_balance: 0 }, { salt });
        expect(contract.address).to.equal(initialAddress);
    });

    it("should enable to use the same instance", async () => {
        const salt = "0xb0a";

        const contractFactory = await starknet.getContractFactory("contract");
        const contract = await contractFactory.deploy({ initial_balance: 0 }, { salt });
        const initialAddress = contract.address;

        await account.invoke(contract, "increase_balance", { amount1: 10, amount2: 20 });
        const { res: initialBalance } = await contract.call("get_balance");
        expect(initialBalance).to.deep.equal(30n);

        await starknet.devnet.restart();

        // redeploy
        await contractFactory.deploy({ initial_balance: 0 }, { salt });
        const { res: balanceAfterRestart } = await contract.call("get_balance");
        expect(balanceAfterRestart).to.deep.equal(0n);

        await account.invoke(contract, "increase_balance", { amount1: 10, amount2: 20 });
        expect(contract.address).to.equal(initialAddress);

        const { res: balanceAfterInvoke } = await contract.call("get_balance");
        expect(balanceAfterInvoke).to.deep.equal(30n);
    });
});
