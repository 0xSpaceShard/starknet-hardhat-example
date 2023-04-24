import { expect } from "chai";
import hardhat, { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory } from "hardhat/types/runtime";
import { TIMEOUT } from "./constants";
import { expectFeeEstimationStructure, getOZAccount, mint } from "./util";

describe("Argent account", function () {
    this.timeout(TIMEOUT);

    let mainContractFactory: StarknetContractFactory;
    let mainContract: StarknetContract;
    let argentAccountAddress: string;
    const argentAccountPrivateKey =
        "0x66826acbe6ab1e8612124c0cb413b17695119148aabfe010b1851a9b78ea295";

    /**
     * Returns an instance of ArgenAccount. Expected to be deployed.
     */
    const getArgentAccount = async () => {
        return await starknet.ArgentAccount.getAccountFromAddress(
            argentAccountAddress,
            argentAccountPrivateKey
        );
    };

    before(async function () {
        const deployerAccount = await getOZAccount();

        mainContractFactory = await starknet.getContractFactory("contract");
        await deployerAccount.declare(mainContractFactory);
        mainContract = await deployerAccount.deploy(
            mainContractFactory,
            { initial_balance: 0 },
            {
                salt: "0x42",
                nonce: 1
            }
        );
        console.log("Main deployed at", mainContract.address);
    });

    // this test needs to be run in order for other tests to be able to get the account instance
    it("should create, fund, deploy and use account", async function () {
        const account = await starknet.ArgentAccount.createAccount({
            salt: "0x42",
            privateKey: argentAccountPrivateKey
        });
        argentAccountAddress = account.address;

        await mint(account.address, 1e18);
        console.log("Funded account");

        const deploymentTxHash = await account.deployAccount(); // Implicit maxFee will be used
        console.log("Deployed account in tx", deploymentTxHash);

        // use contract by doing: declare + deploy + invoke + call
        const contractFactory = await hardhat.starknet.getContractFactory("contract");
        const txHash = await account.declare(contractFactory, { maxFee: 1e18 });
        console.log("Declared contract in tx", txHash);

        const initialBalance = 10n;
        const contract = await account.deploy(
            contractFactory,
            { initial_balance: initialBalance },
            { maxFee: 1e18 }
        );
        console.log(`Deployed contract to ${contract.address} in tx ${contract.deployTxHash}`);

        await account.invoke(contract, "increase_balance", {
            amount1: 10n,
            amount2: 20n
        });

        const { res: balance } = await contract.call("get_balance");
        expect(balance).to.equal(initialBalance + 30n);
    });

    it("should estimate deploy account fee and deploy with estimated fee as maxFee", async function () {
        const account = await starknet.ArgentAccount.createAccount({
            salt: "0x43",
            privateKey: argentAccountPrivateKey
        });

        const estimatedFee = await account.estimateDeployAccountFee();
        expectFeeEstimationStructure(estimatedFee);
        console.log("Estimated deploy account fee: ", estimatedFee);
        await mint(account.address, Number(estimatedFee.amount));

        const deploymentTxHash = await account.deployAccount({ maxFee: estimatedFee.amount });
        console.log("Deployed account in tx", deploymentTxHash);
    });

    it("should fail when loading an already deployed account with a wrong private key", async function () {
        try {
            const wrongKey = "0x0123";
            await starknet.ArgentAccount.getAccountFromAddress(argentAccountAddress, wrongKey);
            expect.fail("Should have failed on passing an incorrect private key.");
        } catch (err: any) {
            expect(err.message).to.equal(
                "The provided private key is not compatible with the public key stored in the contract."
            );
        }
    });

    it("should handle guardian", async function () {
        const account = await getArgentAccount();
        const { res: initialBalance } = await mainContract.call("get_balance");

        const newGuardianPrivateKey = "0x123";
        await account.setGuardian(newGuardianPrivateKey, {
            maxFee: 1e18
        });
        expect(account.guardianPrivateKey).to.equal(newGuardianPrivateKey);

        await account.invoke(mainContract, "increase_balance", { amount1: 5n, amount2: 0 });
        const { res: balanceWithGuardian } = await mainContract.call("get_balance");
        expect(balanceWithGuardian).to.equal(initialBalance + 5n);

        await account.setGuardian(undefined, {
            maxFee: 1e18
        });
        expect(account.guardianPrivateKey).to.be.undefined;
        await account.invoke(mainContract, "increase_balance", { amount1: 6n, amount2: 0 });
        const { res: balanceWithoutGuardian } = await mainContract.call("get_balance");
        expect(balanceWithoutGuardian).to.equal(balanceWithGuardian + 6n);
    });

    it("should estimate, invoke and call", async function () {
        const account = await getArgentAccount();
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
        const account = await getArgentAccount();
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

    it("should fail to declare class if maxFee insufficient", async function () {
        const account = await getArgentAccount();
        try {
            await account.declare(mainContractFactory, { maxFee: 1 });
        } catch (error: any) {
            expect(error.message).to.contain("Actual fee exceeded max fee");
        }
    });

    it("should declare class if maxFee sufficient", async function () {
        const account = await getArgentAccount();
        await account.declare(mainContractFactory, { maxFee: 1e18 });
    });
});
