import { expect } from "chai";
import { starknet } from "hardhat";
import {
  StarknetContractFactory,
  StarknetContract,
} from "hardhat/types/runtime";
import { TIMEOUT } from "./constants";

describe("Starknet", function () {
  this.timeout(TIMEOUT);

  let eventsContractFactory: StarknetContractFactory;
  let contract: StarknetContract;

  before(async function () {
    // assumes events.cairo has been compiled
    eventsContractFactory = await starknet.getContractFactory("events");
    contract = await eventsContractFactory.deploy();
  });

  it("should decode events from increase balance successfully", async function () {
    const txHash = await contract.invoke("increase_balance", { amount: 10 });
    const receipt = await starknet.getTransactionReceipt(txHash);
    const events = await contract.decodeEvents(receipt.events);

    expect(events).to.deep.equal([
      {
        name: "increase_balance_called",
        data: { current_balance: 0n, amount: 10n },
      },
    ]);
  });

  it("should decode events from send events successfully", async function () {
    const txHash = await contract.invoke("send_events", {
      array: [42, 78, 54, 8],
    });
    const receipt = await starknet.getTransactionReceipt(txHash);
    const events = await contract.decodeEvents(receipt.events);

    expect(events).to.deep.equal([
      {
        name: "simple_event_test",
        data: { arg1: 59n, arg2: 42n, arg3: 666n },
      },
      {
        name: "complex_event_test",
        data: {
          simple: 4n,
          struc: {
            a: 10n,
            b: 45n,
            c: 89n,
          },
          alias: { x: 40n, y: 5n },
          array_len: 4n,
          array: [42n, 78n, 54n, 8n],
        },
      },
    ]);
  });
});
