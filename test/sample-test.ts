import { expect } from "chai";
import { starknet } from "hardhat";

describe("Starknet", function () {
  this.timeout(300_000); // 5 min
  let preservedAddress: string;

  it("should work for a fresh deployment", async function () {
    const contractFactory = await starknet.getContractFactory("contract");
    const contract = await contractFactory.deploy();
    console.log("Deployed at", contract.address);
    preservedAddress = contract.address;
    await contract.invoke("increase_balance", [10, 20]);
    console.log("Increased by 10+20");

    const balanceStr = await contract.call("get_balance");
    const balance = parseInt(balanceStr);
    expect(balance).to.equal(30);
  });

  it("should work for a previously deployed contract", async function() {
    const contractFactory = await starknet.getContractFactory("contract");
    const contract = contractFactory.getContractAt(preservedAddress);
    const balanceStr = await contract.call("get_balance");
    const balance = parseInt(balanceStr);
    expect(balance).to.equal(30);
  });
});
