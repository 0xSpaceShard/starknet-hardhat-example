import { expect } from "chai";
import { starknet } from "hardhat";
import { TIMEOUT } from "./constants";
import { getOZAccount } from "./util";

describe("Class declaration", function () {
    this.timeout(TIMEOUT);
    it("should declare and deploy a class", async function () {
        const account = await getOZAccount();

        const contractFactory = await starknet.getContractFactory("contract");
        await account.declare(contractFactory);
        const classHash = await contractFactory.getClassHash();

        const deployerFactory = await starknet.getContractFactory("deployer");
        await account.declare(deployerFactory);
        const deployer = await account.deploy(
            deployerFactory,
            { class_hash: classHash },
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
