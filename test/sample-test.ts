import { expect } from "chai";
import { getStarknetContract } from "@shardlabs/starknet-hardhat-plugin";

describe("Starknet", function () {
  this.timeout(300_000); // 5 min
  let preservedAddress: string;

  it("Should work", async function () {
    const contract = await getStarknetContract("contract");
    await contract.deploy();
    console.log("Deployed at", contract.address);
    preservedAddress = contract.address;
    await contract.invoke("increase_balance", [10, 20]);
    console.log("Increased by 10+20");
    // await contract.invoke("increase_balance", [20]);
    // console.log("Increased by 20");

    const balanceStr = await contract.call("get_balance");
    const balance = parseInt(balanceStr);
    expect(balance).to.equal(30);
  });

  it("Should work for a previously deployed contract", async function() {
    const contract = await getStarknetContract("contract");
    contract.address = preservedAddress;
    const balanceStr = await contract.call("get_balance");
    const balance = parseInt(balanceStr);
    expect(balance).to.equal(30);
  });
});
