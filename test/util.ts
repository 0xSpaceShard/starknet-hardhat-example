import { expect } from "chai";

export const OK_TX_STATUSES = ["PENDING", "ACCEPTED_ON_L2", "ACCEPTED_ON_L1"];

export function expectFeeEstimationStructure(fee: any) {
    console.log("Estimated fee:", fee);
    expect(fee).to.haveOwnProperty("amount");
    expect(typeof fee.amount).to.equal("bigint");
    expect(fee.unit).to.equal("wei");
    expect(typeof fee.gas_price).to.equal("bigint");
    expect(typeof fee.gas_usage).to.equal("bigint");
}

export function ensureEnvVar(varName: string): string {
    if (!process.env[varName]) {
        throw new Error(`Env var ${varName} not set or empty`);
    }
    return process.env[varName] as string;
}

/**
 * Receives a hex address, converts it to bigint, converts it back to hex.
 * This is done to strip leading zeros.
 * @param address a hex string representation of an address
 * @returns an adapted hex string representation of the address
 */
function adaptAddress(address: string) {
    return "0x" + BigInt(address).toString(16);
}

/**
 * Expects address equality after adapting them.
 * @param actual
 * @param expected
 */
export function expectAddressEquality(actual: string, expected: string) {
    expect(adaptAddress(actual)).to.equal(adaptAddress(expected));
}
