import { expect } from "chai";
import { starknetLegacy as starknet } from "hardhat";
import { getOZAccount } from "./util";

describe("Transaction trace", function () {
    it("should test transaction trace", async function () {
        const account = await getOZAccount();

        const contractFactory = await starknet.getContractFactory("contract");
        await account.declare(contractFactory);
        const contract = await account.deploy(contractFactory, {
            initial_balance: 0
        });

        const tx_hash = await account.invoke(contract, "increase_balance", {
            amount1: 10,
            amount2: 20
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tx_trace: any = await starknet.getTransactionTrace(tx_hash);

        const properties = [
            "contract_address",
            "entry_point_selector",
            "calldata",
            "caller_address",
            "class_hash",
            "entry_point_type",
            "call_type",
            "result",
            "calls",
            "events",
            "messages"
        ];
        for (const property of properties) {
            expect(tx_trace.execute_invocation).to.have.property(property);
            expect(tx_trace.validate_invocation).to.have.property(property);
        }
    });
});
