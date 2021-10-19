import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory } from "hardhat/types/runtime";

describe("Starknet", function () {
  this.timeout(300_000); // 5 min
  let preservedAddress: string;

  let contractFactory: StarknetContractFactory;

  before(async function() {
    contractFactory = await starknet.getContractFactory("contract");
  });

  it("should work for a fresh deployment", async function () {
    const contract: StarknetContract = await contractFactory.deploy();
    console.log("Deployed at", contract.address);
    preservedAddress = contract.address;
    await contract.invoke("increase_balance", [10, 20]);
    console.log("Increased by 10+20");

    const balanceStr = await contract.call("get_balance");
    const balance = parseInt(balanceStr);
    expect(balance).to.equal(30);
  });

  it("should work for a previously deployed contract", async function() {
    const contract: StarknetContract = contractFactory.getContractAt(preservedAddress);
    const balanceStr = await contract.call("get_balance");
    const balance = parseInt(balanceStr);
    expect(balance).to.equal(30);
  });

  it("should work with tuples", async function() {
    const contract: StarknetContract = contractFactory.getContractAt(preservedAddress);
    // passing points (1, 2) and (3, 4)
    // works with alpha network, doesn't work with starknet-devnet
    const sum = await contract.call("sum_points", [1, 2, 3, 4]);
    expect(sum).to.equal("4 6");
  });

  it("should work with imported custom functions", async function() {
    const contract: StarknetContract = contractFactory.getContractAt(preservedAddress);
    const almostComparison1_3 = await contract.call("use_almost_equal", [1, 3]);
    expect(almostComparison1_3).to.equal("0"); // 0 as in false

    const almostComparison1_2 = await contract.call("use_almost_equal", [1, 2]);
    expect(almostComparison1_2).to.equal("1"); // 1 as in true
  });
});
