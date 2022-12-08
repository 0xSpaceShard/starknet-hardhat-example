import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContractFactory, StarknetContract, Account } from "hardhat/types/runtime";
import { TIMEOUT } from "./constants";
import { getOZAccount } from "./util";

describe("Starknet", function () {
    this.timeout(TIMEOUT);

    let eventsContractFactory: StarknetContractFactory;
    let contract: StarknetContract;
    let account: Account;

    before(async function () {
        // assumes events.cairo has been compiled
        account = await getOZAccount();
        eventsContractFactory = await starknet.getContractFactory("events");
        await account.declare(eventsContractFactory);
        contract = await account.deploy(eventsContractFactory);
    });

    it("should decode events from increase balance successfully", async function () {
        const txHash = await account.invoke(contract, "increase_balance", { amount: 10 });
        const receipt = await starknet.getTransactionReceipt(txHash);
        const events = contract.decodeEvents(receipt.events);

        expect(events).to.deep.equal([
            {
                name: "increase_balance_called",
                data: { current_balance: 0n, amount: 10n }
            }
        ]);
    });

    it("should decode events from send events successfully", async function () {
        const txHash = await account.invoke(contract, "send_events", {
            array: [42, 78, 54, 8]
        });
        const receipt = await starknet.getTransactionReceipt(txHash);
        const events = contract.decodeEvents(receipt.events);

        expect(events).to.deep.equal([
            {
                name: "simple_event",
                data: { arg1: 59n, arg2: 42n, arg3: 666n }
            },
            {
                name: "complex_event",
                data: {
                    simple: 4n,
                    struc: {
                        a: 10n,
                        b: 45n,
                        c: 89n
                    },
                    alias: { x: 40n, y: 5n },
                    array_len: 4n,
                    array: [42n, 78n, 54n, 8n]
                }
            }
        ]);
    });
});
