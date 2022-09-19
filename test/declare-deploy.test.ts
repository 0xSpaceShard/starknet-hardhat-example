import { expect } from "chai";
import { starknet } from "hardhat";
import { TIMEOUT } from "./constants";
import { ensureEnvVar } from "./util";

describe("Class declaration", function () {
    this.timeout(TIMEOUT);
    it("should declare and deploy a class", async function () {
        const account = await starknet.getAccountFromAddress(
            ensureEnvVar("OZ_ACCOUNT_ADDRESS"),
            ensureEnvVar("OZ_ACCOUNT_PRIVATE_KEY"),
            "OpenZeppelin"
        );

        const contractFactory = await starknet.getContractFactory("contract");
        const classHash = await account.declare(contractFactory);

        const deployerFactory = await starknet.getContractFactory("deployer");
        const deployer = await deployerFactory.deploy(
            {
                class_hash: classHash
            },
            { salt: "0x42" }
        );

        const initialBalance = 10n;
        const constructorArgs = { initial_balance: initialBalance };
        const estimatedFee = await account.estimateFee(
            deployer,
            "deploy_contract",
            constructorArgs
        );
        const deploymentHash = await account.invoke(deployer, "deploy_contract", constructorArgs, {
            maxFee: estimatedFee.amount * 2n
        });

        const receipt = await starknet.getTransactionReceipt(deploymentHash);
        const deploymentEvent = receipt.events[0];
        const deploymentAddress = deploymentEvent.data[0];

        const contract = contractFactory.getContractAt(deploymentAddress);
        const { res: balance } = await contract.call("get_balance");

        expect(balance).to.deep.equal(initialBalance);
    });
});
