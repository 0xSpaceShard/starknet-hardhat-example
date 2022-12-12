import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory, Wallet } from "hardhat/types/runtime";
import { TIMEOUT } from "./constants";
import { expectFeeEstimationStructure, getOZAccount } from "./util";

describe("Starknet", function () {
    this.timeout(TIMEOUT);

    let contractFactory: StarknetContractFactory;
    let contract: StarknetContract;
    let wallet: Wallet;

    before(async function () {
        contractFactory = await starknet.getContractFactory("contract");
        // deployed with `hardhat starknet-deploy-account`
        wallet = starknet.getWallet("OpenZeppelin");

        console.log("Started deployment");
        const account = await getOZAccount();
        await account.declare(contractFactory);
        contract = await account.deploy(contractFactory, { initial_balance: 0 });
        console.log("Deployed at", contract.address);
    });

    it("should fail when trying to get an invalid wallet", async function () {
        try {
            starknet.getWallet("invalidWallet");
            expect.fail(
                "Should have failed on passing a wallet not configured in 'hardhat.config' file."
            );
        } catch (err: any) {
            expect(err.message).to.equal(
                "Invalid wallet name provided: invalidWallet.\nValid wallets: OpenZeppelin"
            );
        }
    });

    it("should call with a wallet", async function () {
        const { res: balanceBefore } = await contract.call("get_balance", {}, { wallet });
        expect(balanceBefore).to.deep.equal(0n);
    });

    it("should estimate fee with a wallet", async function () {
        const fee = await contract.estimateFee(
            "increase_balance",
            { amount1: 10, amount2: 20 },
            { wallet }
        );
        expectFeeEstimationStructure(fee);
    });

    it("should invoke with a wallet", async function () {
        await contract.invoke("increase_balance", { amount1: 10, amount2: 20 }, { wallet });
        console.log("Increased by 10 + 20");
        const { res: balanceAfter } = await contract.call("get_balance", {}, { wallet });
        expect(balanceAfter).to.deep.equal(30n);
    });
});
