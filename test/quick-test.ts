import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory } from "hardhat/types/runtime";
import { TIMEOUT } from "./constants";
import { getOZAccount } from "./util";

describe("Starknet", function () {
    this.timeout(TIMEOUT);

    it("should work for a fresh deployment", async function () {
        const account = await getOZAccount();
        console.log(`Account address: ${account.address}, public key: ${account.publicKey})`);

        const contractFactory: StarknetContractFactory = await starknet.getContractFactory(
            "contract"
        );
        const declareFee = await account.estimateDeclareFee(contractFactory);
        console.log("Estimated declare fee: ", declareFee);
        const txHash = await account.declare(contractFactory);
        console.log("Tx hash:", txHash);

        const deployFee = await account.estimateDeployFee(contractFactory, {
            initial_balance: 0
        });
        console.log("Estimated deploy fee: ", deployFee);
        const contract: StarknetContract = await account.deploy(contractFactory, {
            initial_balance: 0
        });
        console.log(`Deployed contract to ${contract.address} in tx ${contract.deployTxHash}`);

        const { res: balanceBefore } = await contract.call("get_balance");
        expect(balanceBefore).to.deep.equal(0n);

        const args = { amount1: 10, amount2: 20 };
        const fee = await account.estimateFee(contract, "increase_balance", args);
        console.log("Estimated invoke fee:", fee);

        await account.invoke(contract, "increase_balance", args, { maxFee: fee.amount * 2n });
        console.log("Increased balance");

        const { res: balanceAfter } = await contract.call("get_balance");
        expect(balanceAfter).to.deep.equal(30n);
    });
});
