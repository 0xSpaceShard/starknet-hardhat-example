import { expect } from "chai";
import { starknet } from "hardhat";

describe("getBalance utility function", function () {
    const testAddress = "0x41a78e741e5af2fec34b695679bc6891742439f7afb8484ecd7766661ad02bf";

    it("should get zero balance of non-funded contract", async function () {
        const balance = await starknet.getBalance(testAddress);
        expect(balance).to.equal(BigInt(0));
    });

    it("should get positive balance of funded contract", async function () {
        const mintAmount = 100;
        await starknet.devnet.mint(testAddress, mintAmount, true);

        const balance = await starknet.getBalance(testAddress);
        expect(balance).to.equal(BigInt(mintAmount));
    });
});
