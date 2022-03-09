import { expect } from "chai";
import { starknet } from "hardhat";
import {
  StarknetContract,
  StarknetContractFactory,
} from "hardhat/types/runtime";
import { TIMEOUT } from "./constants";

describe("Starknet", function () {
  this.timeout(TIMEOUT);

  let contractFactory: StarknetContractFactory;
  let contractWithoutConstructorFactory: StarknetContractFactory;
  let contractWithEmptyConstructorFactory: StarknetContractFactory;

  before(async function () {
    // assumes contracts have been compiled
    contractFactory = await starknet.getContractFactory("contract");
    contractWithEmptyConstructorFactory = await starknet.getContractFactory(
      "empty_constructor"
    );
    contractWithoutConstructorFactory = await starknet.getContractFactory(
      "simple_storage"
    );
  });

  it("should fail if constructor arguments required but not provided", async function () {
    try {
      await contractFactory.deploy();
      expect.fail("Should have failed on not passing constructor calldata.");
    } catch (err: any) {
      expect(err.message).to.equal("constructor: Expected 1 argument, got 0.");
    }
  });

  it("should fail if constructor requires no arguments but some are provided", async function () {
    try {
      await contractWithEmptyConstructorFactory.deploy({ dummy_var: 10n });
      expect.fail("Should have failed on providing constructor arguments.");
    } catch (err: any) {
      expect(err.message).to.equal("constructor: Expected 0 arguments, got 1.");
    }
  });

  it("should work if constructor requires no arguments and none are provided", async function () {
    const contract = await contractWithEmptyConstructorFactory.deploy();
    console.log("Deployed to", contract.address);
  });

  it("should work if constructor not present and no arguments provided", async function () {
    const contract = await contractWithoutConstructorFactory.deploy();
    console.log("Deployed to", contract.address);
  });

  it("should fail if constructor not present but arguments are provided", async function () {
    try {
      await contractWithoutConstructorFactory.deploy({ dummy_var: 10n });
      expect.fail("Should have failed on providing constructor arguments.");
    } catch (err: any) {
      expect(err.message).to.equal("No constructor arguments required but 1 provided");
    }
  });
});
