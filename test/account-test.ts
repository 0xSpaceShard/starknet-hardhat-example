import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory, Account } from "hardhat/types/runtime";
import { TIMEOUT } from "./constants";

describe("Starknet", function () {
  this.timeout(TIMEOUT);

  let contractFactory: StarknetContractFactory;
  let contract: StarknetContract;

  let account: Account;
  let accountAddress: string;
  let privateKey: string;
  let publicKey: string;

  before(async function() {
    
    contractFactory = await starknet.getContractFactory("contract");

    console.log("Started deployment");
    contract = await contractFactory.deploy({ initial_balance: 0 });
    console.log("Deployed at", contract.address);

    account = await starknet.deployAccountFromABI("Account", "OpenZeppelin");
    accountAddress = account.starknetContract.address;
    privateKey = account.privateKey;
    publicKey = account.publicKey;
  });

  it("should succeed when loading an already deployed account with the correct private key", async function() {

    const loadedAccount = await starknet.getAccountFromAddress("Account", accountAddress, privateKey, "OpenZeppelin");

    expect(loadedAccount.starknetContract.address).to.deep.equal(accountAddress);
    expect(loadedAccount.privateKey).to.deep.equal(privateKey);
    expect(loadedAccount.publicKey).to.deep.equal(publicKey);
  });

  it("should fail when loading an already deployed account with a wrong private key", async function() {
    try{
      await starknet.getAccountFromAddress("Account" , accountAddress, "0x0123", "OpenZeppelin");
      expect.fail("Should have failed on passing an incorrect private key.");
    } catch(err: any) {
      expect(err.message).to.equal("The provided private key is not compatible with the public key stored in the contract.");
    }
  });

  it("should succeed when using the account to invoke a function on another contract", async function() {
    const { res: currBalance } = await account.call(contract, "get_balance");
    const amount1 = 10n;
    const amount2 = 20n;
    await account.invoke(contract, "increase_balance", { amount1, amount2 });

    const { res: newBalance } = await account.call(contract, "get_balance");
    expect(newBalance).to.deep.equal(currBalance + amount1 + amount2);
  });

});
