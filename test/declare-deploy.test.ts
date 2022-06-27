import { expect } from "chai";
import { starknet } from "hardhat";
import { ensureEnvVar } from "./util";

describe("Class declaration", function () {
  it("should declare and deploy a class", async function () {
    const contractFactory = await starknet.getContractFactory("contract");
    const classHash = await contractFactory.declare();

    const deployerFactory = await starknet.getContractFactory("deployer");
    const deployer = await deployerFactory.deploy(
      {
        class_hash: classHash,
      },
      { salt: "0x42" }
    );

    const account = await starknet.getAccountFromAddress(
      ensureEnvVar("OZ_ACCOUNT_ADDRESS"),
      ensureEnvVar("OZ_ACCOUNT_PRIVATE_KEY"),
      "OpenZeppelin"
    );

    const initialBalance = 10n;
    const deploymentHash = await account.invoke(deployer, "deploy_contract", {
      initial_balance: initialBalance,
    });

    const receipt = await starknet.getTransactionReceipt(deploymentHash);
    const deploymentEvent = receipt.events[0];
    const deploymentAddress = deploymentEvent.data[0];

    const contract = contractFactory.getContractAt(deploymentAddress);
    const { res: balance } = await contract.call("get_balance");

    expect(balance).to.deep.equal(initialBalance);
  });
});
