import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContractFactory } from "hardhat/types/runtime";
import { TIMEOUT } from "./constants";

describe("Starknet", function () {
  this.timeout(TIMEOUT);

  let eventsContractFactory: StarknetContractFactory;

  before(async function () {
    // assumes events.cairo has been compiled
    eventsContractFactory = await starknet.getContractFactory("events");
  });

  it("should decode events successfully", async function () {
    const contract = await eventsContractFactory.deploy();

    const txHash = await contract.invoke("increase_balance", { amount: 10 });
    const receipt = await starknet.getTransactionReceipt(txHash);
    const events = await contract.decodeEvents(receipt.events);

    const payload = [
      {
        name: "increase_balance_called",
        data: { current_balance: 0n, amount: 10n },
      },
      {
        name: "event_test",
        data: { arg1: 4n, arg2: 10n, arg3: 56n, arg4: 12n },
      },
    ];

    expect(events).to.deep.equal(payload);
  });
});
