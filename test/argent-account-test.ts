import { expect } from "chai";
import { BigNumber } from "ethers";
import { ArgentAccount } from "@shardlabs/starknet-hardhat-plugin/dist/account"
import { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory } from "hardhat/types/runtime";
import { TIMEOUT } from "./constants";

describe("Starknet", function () {
  this.timeout(TIMEOUT);

  let mainContractFactory: StarknetContractFactory;
  let mainContract: StarknetContract;
  let utilContractFactory: StarknetContractFactory;
  let utilContract: StarknetContract;

  let account: ArgentAccount;
  let accountAddress: string;
  let privateKey: string;
  let publicKey: string;

  before(async function() {
    mainContractFactory = await starknet.getContractFactory("contract");
    utilContractFactory = await starknet.getContractFactory("contracts/util.cairo");

    console.log("Started deployment");
    mainContract = await mainContractFactory.deploy({ initial_balance: 0 });
    utilContract = await utilContractFactory.deploy();
    console.log("Main deployed at", mainContract.address);
    console.log("Util deployed at", utilContract.address);

    account = (await starknet.deployAccount("Argent")) as ArgentAccount;
    accountAddress = account.starknetContract.address;
    privateKey = account.privateKey;
    publicKey = account.publicKey;
    console.log("Deployed account at address:", account.starknetContract.address);
    console.log("Private and public key:", privateKey, publicKey);
  });

  
  it("should load an already deployed account with the correct private key", async function() {
    const loadedAccount = (await starknet.getAccountFromAddress(accountAddress, privateKey, "Argent")) as ArgentAccount;
    await loadedAccount.setGuardian(account.guardianPrivateKey);

    expect(loadedAccount.starknetContract.address).to.deep.equal(accountAddress);
    expect(loadedAccount.privateKey).to.deep.equal(privateKey);
    expect(loadedAccount.publicKey).to.deep.equal(publicKey);

    account = loadedAccount;
  });

  it("should fail when loading an already deployed account with a wrong private key", async function() {
    try{
      await starknet.getAccountFromAddress(accountAddress, "0x0123", "Argent");
      expect.fail("Should have failed on passing an incorrect private key.");
    } catch(err: any) {
      expect(err.message).to.equal("The provided private key is not compatible with the public key stored in the contract.");
    }
  });

  it("should invoke a function on another contract", async function() {
    const { res: currBalance } = await account.call(mainContract, "get_balance");
    const amount1 = 10n;
    const amount2 = 20n;
    await account.invoke(mainContract, "increase_balance", { amount1, amount2 });

    const { res: newBalance } = await account.call(mainContract, "get_balance");
    expect(newBalance).to.deep.equal(currBalance + amount1 + amount2);
  });

  it("should work with arrays through an account", async function() {
    const { res } = await account.call(mainContract, "sum_array", { a: [1, 2, 3] });
    expect(res).to.equal(6n);
  });

  it("should work with BigNumbers and tuples through an account", async function() {
    // passing Points (1, 2) and (3, 4) in a tuple
    const { res: sum } = await account.call(mainContract, "sum_points_to_tuple", {
      points: [
        { x: BigNumber.from(1), y: BigNumber.from(2) },
        { x: 3, y: 4 }
      ]
    });
    expect(sum).to.deep.equal([4n, 6n]);
  });

  // Multicall / Multiinvoke testing
  it("should handle multiple invokes through an account", async function() {
    const { res: currBalance } = await account.call(mainContract, "get_balance");
    const amount1 = 10n;
    const amount2 = 20n;

    const invokeArray = [
      {
        toContract: mainContract,
        functionName: "increase_balance",
        calldata: {amount1, amount2}
      },
      {
        toContract: mainContract,
        functionName: "increase_balance",
        calldata: {amount1, amount2}
      },
      {
        toContract: mainContract,
        functionName: "increase_balance",
        calldata: {amount1, amount2}
      }
    ];

    const txHashArray = await account.multiInvoke(invokeArray);
    console.log(txHashArray);
    const { res: newBalance } = await account.call(mainContract, "get_balance");
    expect(newBalance).to.deep.equal(currBalance + 90n);
  });

  it("should handle multiple calls through an account", async function() {
    const { res: currBalance } = await account.call(mainContract, "get_balance");

    const callArray = [
      {
        toContract: mainContract,
        functionName: "sum_points_to_tuple",
        calldata: {
            points: [
            { x: 1, y: 2 },
            { x: 3, y: 4 }
          ]
        }
      },
      {
        toContract: utilContract,
        functionName: "almost_equal",
        calldata: { a: 1, b: 1 }
      },
      {
        toContract: utilContract,
        functionName: "almost_equal",
        calldata: { a: 1, b: 5 }
      },
      {
        toContract: mainContract,
        functionName: "sum_array",
        calldata: { a: [1, 2, 3] }
      },
      {
        toContract: mainContract,
        functionName: "get_balance"
      },
      {
        toContract: utilContract,
        functionName: "almost_equal",
        calldata: { a: 1, b: 1 }
      }
    ];

    const results = await account.multiCall(callArray);
    expect(results).to.deep.equal([
      { res: [4n,6n] },
      { res: 1n },
      { res: 0n },
      { res: 6n },
      { res: currBalance },
      { res: 1n }
    ]);
    
  });

});
