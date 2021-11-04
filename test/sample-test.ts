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

    const balanceStrBefore = await contract.call("get_balance");
    const balanceBefore = parseInt(balanceStrBefore);
    expect(balanceBefore).to.equal(0);

    await contract.invoke("increase_balance", [10, 20]);
    console.log("Increased by 10+20");

    const balanceStrAfter = await contract.call("get_balance");
    const balanceAfter = parseInt(balanceStrAfter);
    expect(balanceAfter).to.equal(30);
  });

  it("should work for a previously deployed contract", async function() {
    const contract: StarknetContract = contractFactory.getContractAt(preservedAddress);
    const balanceStr = await contract.call("get_balance");
    const balance = parseInt(balanceStr);
    expect(balance).to.equal(30);
  });

  it("should work with tuples", async function() {
    const contract: StarknetContract = contractFactory.getContractAt(preservedAddress);
    // passing Points (1, 2) and (3, 4)
    const sum = await contract.call("sum_points", [1, 2, 3, 4]);
    expect(sum).to.equal("4 6");
  });

  it("should work with complex tuples", async function() {
    const contract: StarknetContract = contractFactory. getContractAt(preservedAddress);
    // passing PointPair ((1, 2), (3, 4), 5)
    // the five is an extra number added to each member of the sum Point
    const sum = await contract.call("sum_point_pair", [1, 2, 3, 4, 5]);
    expect(sum).to.equal("9 11");
  });

  async function testArray(arr: number[], expected: number) {
    const contract: StarknetContract = contractFactory.getContractAt(preservedAddress);
    const sum = await contract.call("sum_array", [arr.length, ...arr]);
    expect(sum).to.equal(expected.toString());
  }

  it("should work with a non-empty array", async function() {
    await testArray([1, 2, 3, 4], 10);
  });

  it("should work with an empty array", async function() {
    await testArray([], 0);
  });

  it("should work with returned arrays", async function() {
    const contract: StarknetContract = contractFactory.getContractAt(preservedAddress);
    const arr = [1, 2, 3];
    const ret = await contract.call("identity", [arr.length, ...arr]);
    const arrLengthSquared = arr.length * arr.length;
    expect(ret).to.equal(`${arr.length} ${arr.join(" ")} ${arrLengthSquared}`);
  });

  it("should work with imported custom functions", async function() {
    const contract: StarknetContract = contractFactory.getContractAt(preservedAddress);
    const almostComparison1_3 = await contract.call("use_almost_equal", [1, 3]);
    expect(almostComparison1_3).to.equal("0"); // 0 as in false

    const almostComparison1_2 = await contract.call("use_almost_equal", [1, 2]);
    expect(almostComparison1_2).to.equal("1"); // 1 as in true
  });
});
