import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory } from "hardhat/types/runtime";
import { TIMEOUT } from "./constants";
import { BigNumber } from "ethers";
import { expectFeeEstimationStructure } from "./util";

/**
 * Receives a hex address, converts it to bigint, converts it back to hex.
 * This is done to strip leading zeros.
 * @param address a hex string representation of an address
 * @returns an adapted hex string representation of the address
 */
 function adaptAddress(address: string) {
  return "0x" + BigInt(address).toString(16);
}

const OK_TX_STATUSES = ["PENDING", "ACCEPTED_ON_L2", "ACCEPTED_ON_L1"]

/**
 * Expects address equality after adapting them.
 * @param actual 
 * @param expected 
 */
function expectAddressEquality(actual: string, expected: string) {
  expect(adaptAddress(actual)).to.equal(adaptAddress(expected));
}

describe("Starknet", function () {
  this.timeout(TIMEOUT);

  let contractFactory: StarknetContractFactory;
  let eventsContractFactory: StarknetContractFactory;

  before(async function() {
    // assumes contract.cairo and events.cairo has been compiled
    contractFactory = await starknet.getContractFactory("contract");
    eventsContractFactory = await starknet.getContractFactory("events");
  });

  it("should decode events successfully", async function() {
    const contract = await eventsContractFactory.deploy();
    
    const txHash = await contract.invoke("increase_balance", { amount: 10 });
    const tx = await starknet.getTransaction(txHash);
    expect(tx.status).to.be.oneOf(OK_TX_STATUSES);
    expect(tx.transaction.calldata).to.deep.equal(["0xa"]);
    expectAddressEquality(tx.transaction.contract_address,contract.address);

    const receipt = await starknet.getTransactionReceipt(txHash);
    const result = await contract.decodeEvents(receipt.events)
    console.log("result: ", result)
    
    expect(result.length).to.deep.equal(2);
    expect(result[0].current_balance).to.deep.equal(0n);
    expect(result[0].amount).to.deep.equal(10n);

    expect(result[1].arg1).to.deep.equal(4n);
    expect(result[1].arg2).to.deep.equal(10n);
    expect(result[1].arg3).to.deep.equal(56n);
    expect(result[1].arg4).to.deep.equal(12n);

  });

});
