import { OpenZeppelinAccount } from "@shardlabs/starknet-hardhat-plugin/dist/src/account";
import { PredeployedAccount } from "@shardlabs/starknet-hardhat-plugin/dist/src/devnet-utils";
import axios from "axios";
import { expect } from "chai";
import { starknet } from "hardhat";

export const OK_TX_STATUSES = ["PENDING", "ACCEPTED_ON_L2", "ACCEPTED_ON_L1"];

export const OZ_ACCOUNT_ADDRESS = ensureEnvVar("OZ_ACCOUNT_ADDRESS");
export const OZ_ACCOUNT_PRIVATE_KEY = ensureEnvVar("OZ_ACCOUNT_PRIVATE_KEY");

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

/**
 * Assumes there is a /mint endpoint on the current starknet network
 * @param address the address to fund
 * @param amount the amount to fund
 * @param lite whether to make it lite or not
 */
export async function mint(address: string, amount: number, lite = true) {
    await axios.post(`${starknet.networkConfig.url}/mint`, {
        amount,
        address,
        lite
    });
}

/**
 * Returns an instance of OZAccount. Expected to be deployed)
 */
export async function getOZAccount() {
    return await starknet.OpenZeppelinAccount.getAccountFromAddress(
        OZ_ACCOUNT_ADDRESS,
        OZ_ACCOUNT_PRIVATE_KEY
    );
}

/**
 * Returns details for a pre-deployed account.
 * @param {number} index Index of account to use
 */
export async function getPredeployedAccount(index = 0): Promise<PredeployedAccount> {
    const accounts = await starknet.devnet.getPredeployedAccounts();
    return accounts[index];
}

/**
 * Returns an OZAccount instance for a pre-deployed account.
 * @param {number} index Index of account to use
 */
export async function getPredeployedOZAccount(index = 0): Promise<OpenZeppelinAccount> {
    const account = await getPredeployedAccount(index);
    return await starknet.OpenZeppelinAccount.getAccountFromAddress(
        account.address,
        account.private_key
    );
}
