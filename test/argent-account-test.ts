import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory, ArgentAccount } from "hardhat/types/runtime";
import { TIMEOUT } from "./constants";
import { ensureEnvVar, expectFeeEstimationStructure } from "./util";

describe("Argent account", function () {
    this.timeout(TIMEOUT);

    let mainContractFactory: StarknetContractFactory;
    let mainContract: StarknetContract;
    let utilContractFactory: StarknetContractFactory;
    let utilContract: StarknetContract;

    let account: ArgentAccount;

    before(async function () {
        console.log("Started deployment");

        mainContractFactory = await starknet.getContractFactory("contract");
        mainContract = await mainContractFactory.deploy({ initial_balance: 0 }, { salt: "0x42" });
        console.log("Main deployed at", mainContract.address);

        utilContractFactory = await starknet.getContractFactory("contracts/util.cairo");
        utilContract = await utilContractFactory.deploy({}, { salt: "0x42" });
        console.log("Util deployed at", utilContract.address);

        account = <ArgentAccount>(
            await starknet.getAccountFromAddress(
                ensureEnvVar("ARGENT_ACCOUNT_ADDRESS"),
                ensureEnvVar("ARGENT_ACCOUNT_PRIVATE_KEY"),
                "Argent"
            )
        );

        console.log(`Account address: ${account.address}`);
        console.log(`Public key: ${account.publicKey}`);
        console.log(`Guardian public key: ${account.guardianPublicKey}`);
    });

    it("should load an already deployed account with the correct private key", async function () {
        const newAccount = await starknet.deployAccount("Argent");
        const loadedAccount = await starknet.getAccountFromAddress(
            newAccount.address,
            newAccount.privateKey,
            "Argent"
        );

        expect(loadedAccount.address).to.deep.equal(newAccount.address);
        expect(loadedAccount.privateKey === newAccount.privateKey).to.be.true;
        expect(loadedAccount.publicKey).to.deep.equal(newAccount.publicKey);
    });

    it("should fail when loading an already deployed account with a wrong private key", async function () {
        try {
            await starknet.getAccountFromAddress(account.address, "0x0123", "Argent");
            expect.fail("Should have failed on passing an incorrect private key.");
        } catch (err: any) {
            expect(err.message).to.equal(
                "The provided private key is not compatible with the public key stored in the contract."
            );
        }
    });

    it("should deploy account with optional parameters", async function () {
        const account = await starknet.deployAccount("Argent", {
            salt: "0x42",
            privateKey: "0x123",
            token: "0x987"
        });
        expect(account.privateKey).to.equal("0x123");
    });

    it("should estimate, invoke and call", async function () {
        const { res: initialBalance } = await mainContract.call("get_balance");
        const estimatedFee = await account.estimateFee(mainContract, "increase_balance", {
            amount1: 10,
            amount2: 20
        });

        expectFeeEstimationStructure(estimatedFee);

        try {
            await account.invoke(
                mainContract,
                "increase_balance",
                { amount1: 10, amount2: 20 },
                { maxFee: estimatedFee.amount / 2n }
            );
            expect.fail("Should have failed earlier");
        } catch (err: any) {
            expect(err.message).to.contain("Actual fee exceeded max fee");
        }

        await account.invoke(
            mainContract,
            "increase_balance",
            { amount1: 10, amount2: 20 },
            { maxFee: estimatedFee.amount * 2n }
        );

        const { res: finalBalance } = await mainContract.call("get_balance");
        expect(finalBalance).to.equal(initialBalance + 30n);
    });

    // Multicall / Multiinvoke testing
    it("should handle multiple invokes through an account", async function () {
        const { res: currBalance } = await mainContract.call("get_balance");
        const amount1 = 10n;
        const amount2 = 20n;

        const invokeArray = [
            {
                toContract: mainContract,
                functionName: "increase_balance",
                calldata: { amount1, amount2 }
            },
            {
                toContract: mainContract,
                functionName: "increase_balance",
                calldata: { amount1, amount2 }
            }
        ];

        const estimatedFee = await account.multiEstimateFee(invokeArray);
        expectFeeEstimationStructure(estimatedFee);

        await account.multiInvoke(invokeArray, { maxFee: estimatedFee.amount * 2n });
        const { res: newBalance } = await mainContract.call("get_balance");
        expect(newBalance).to.deep.equal(currBalance + 60n);
    });
});
