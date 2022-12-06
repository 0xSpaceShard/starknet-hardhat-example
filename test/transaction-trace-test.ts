import { expect } from "chai";
import { starknet } from "hardhat";
import { ensureEnvVar } from "./util";

describe("Transaction trace", function () {
    it("should test transaction trace", async function () {
        const account = await starknet.getAccountFromAddress(
            ensureEnvVar("OZ_ACCOUNT_ADDRESS"),
            ensureEnvVar("OZ_ACCOUNT_PRIVATE_KEY"),
            "OpenZeppelin"
        );

        const contractFactory = await starknet.getContractFactory("contract");
        const contract = await contractFactory.deploy({
            initial_balance: 0
        });

        const tx_hash = await account.invoke(contract, "increase_balance", {
            amount1: 10,
            amount2: 20
        });

        const tx_trace = await starknet.getTransactionTrace(tx_hash);

        const properties = [
            "call_type",
            "calldata",
            "caller_address",
            "class_hash",
            "contract_address",
            "entry_point_type",
            "events",
            "execution_resources",
            "internal_calls",
            "messages",
            "result",
            "selector"
        ];

        for (const property of properties) {
            expect(tx_trace.function_invocation).to.have.property(property);
            expect(tx_trace.validate_invocation).to.have.property(property);
        }

    });
});
