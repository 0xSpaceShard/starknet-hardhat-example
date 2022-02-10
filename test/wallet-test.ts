import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory, Wallet } from "hardhat/types/runtime";
import { TIMEOUT } from "./constants";

describe("Starknet", function () {
  this.timeout(TIMEOUT);

  let preservedAddress: string;
  let contractFactory: StarknetContractFactory;
  let contract: StarknetContract;
  let wallet: Wallet;

  before(async function() {
    // assumes contract.cairo has been compiled
    contractFactory = await starknet.getContractFactory("contract");
    wallet = starknet.getWallet("OpenZeppelin");

    console.log("Started deployment");
    contract = await contractFactory.deploy({ initial_balance: 0 });
    console.log("Deployed at", contract.address);
    preservedAddress = contract.address;
  });

  it("should fail when trying to get an invalid wallet", async function() {
    try{
      starknet.getWallet("invalidWallet");
      expect.fail("Should have failed on passing a wallet not configured in 'hardhat.config' file.");
    } catch(err: any) {
      expect(err.message).to.equal("Invalid wallet name provided: invalidWallet.\nValid wallets: OpenZeppelin");
    }
  });

  it("should succeed when calling with a configured wallet", async function() {
    const { res: balanceBefore } = await contract.call("get_balance", {}, { wallet });
    expect(balanceBefore).to.deep.equal(0n);
  });

  it("should succeed when invoking with a configured wallet", async function() {
    await contract.invoke("increase_balance", { amount1: 10, amount2: 20 }, { wallet });
    console.log("Increased by 10 + 20");
    const { res: balanceAfter } = await contract.call("get_balance", {}, { wallet });
    expect(balanceAfter).to.deep.equal(30n);
  });

});
