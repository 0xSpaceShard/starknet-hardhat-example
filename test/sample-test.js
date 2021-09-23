const { expect } = require("chai");
const { getStarknetContract } = require("hardhat");

// describe("Greeter", function () {
//   it("Should return the new greeting once it's changed", async function () {
//     const Greeter = await ethers.getContractFactory("Greeter");
//     const greeter = await Greeter.deploy("Hello, world!");
//     await greeter.deployed();

//     expect(await greeter.greet()).to.equal("Hello, world!");

//     const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

//     // wait until the transaction is mined
//     await setGreetingTx.wait();

//     expect(await greeter.greet()).to.equal("Hola, mundo!");
//   });
// });

describe("Starknet", function () {
  this.timeout(300_000); // 5 min
  it("Should work", async function () {
    const contract = await getStarknetContract("contract");
    await contract.deploy();
    console.log("Deployed at", contract.address);
    await contract.invoke("increase_balance", [10, 20]);
    console.log("Increased by 10");
    // await contract.invoke("increase_balance", [20]);
    // console.log("Increased by 20");

    const balanceStr = await contract.call("get_balance");
    const balance = parseInt(balanceStr);
    expect(balance).to.equal(30);
  });
});
