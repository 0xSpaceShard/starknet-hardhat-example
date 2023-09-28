import { expect } from "chai";
import { starknet, starknetLegacy } from "hardhat";
import { Account, StarknetContract, StarknetContractFactory } from "hardhat/types/runtime";

import { TIMEOUT } from "../constants";
import { getOZAccount } from "../util";

describe("Cairo 1 - Events", function () {
    this.timeout(TIMEOUT);

    let contractFactory: StarknetContractFactory;
    let contract: StarknetContract;
    let account: Account;

    before(async function () {
        // assumes events.cairo has been compiled
        account = await getOZAccount();
        contractFactory = await starknetLegacy.getContractFactory("cairo1-contracts/events");
        await account.declare(contractFactory);
        contract = await account.deploy(contractFactory, {
            initial_balance: 0n
        });
    });

    it("should decode events from increase balance successfully", async function () {
        const txHash = await account.invoke(contract, "increase_balance", { amount: 10n });
        const receipt = await starknetLegacy.getTransactionReceipt(txHash);
        const events = contract.decodeEvents(receipt.events);

        expect(events).to.deep.equal([
            {
                name: "BalanceChanged",
                data: { prev_balance: 0n, balance: 10n }
            }
        ]);
    });

    it("should decode events from send events successfully", async function () {
        const txHash = await account.invoke(contract, "send_events");
        const receipt = await starknetLegacy.getTransactionReceipt(txHash);
        const events = contract.decodeEvents(receipt.events);

        const arrayAsObject = (array: bigint[]) => Object.fromEntries(Object.entries(array));
        const tupleInt = starknetLegacy.shortStringToBigInt("tuple");

        expect(events).to.deep.equal([
            {
                name: "BalanceChanged",
                data: { prev_balance: 0n, balance: 42n }
            },
            {
                name: "ComplexEvent",
                data: {
                    simple: starknetLegacy.shortStringToBigInt("simple"),
                    event_struct: {
                        type_felt252: starknetLegacy.shortStringToBigInt("abc"),
                        type_u8: 1n,
                        type_u16: 2n,
                        type_u32: 3n,
                        type_u64: 4n,
                        type_u128: 5n,
                        type_u256: BigInt(
                            starknet.uint256.uint256ToBN({ low: 0, high: 1 }).toString()
                        ),
                        // type_array_u8: [1n, 2n, 3n],
                        type_tuple: arrayAsObject([tupleInt, 1n]),
                        type_contract_address: BigInt(contract.address)
                    },
                    type_tuple: arrayAsObject([tupleInt, 1n, 123456789n]),
                    caller_address: BigInt(account.address)

                    // for Array params :
                    //  Error: Compilation failed.
                    //  #1187: Inconsistent references annotations.
                }
            }
        ]);
    });
});
