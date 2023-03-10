import { expect } from "chai";
import { starknet } from "hardhat";
import { TIMEOUT } from "../test/constants";
import { getOZAccount } from "../test/util";

describe("Delegate proxy", function () {
    this.timeout(TIMEOUT);

    it("should forward to the implementation contract", async function () {
        const account = await getOZAccount();

        const implementationFactory = await starknet.getContractFactory("contract");
        await account.declare(implementationFactory);
        const implementationClassHash = await implementationFactory.getClassHash();

        // uses delegate proxy defined in contracts/delegate_proxy.cairo
        const proxyFactory = await starknet.getContractFactory("delegate_proxy");
        await account.declare(proxyFactory);
        const proxy = await account.deploy(proxyFactory, {
            implementation_hash_: implementationClassHash
        });
        console.log("Deployed proxy to", proxy.address);

        proxy.setImplementation(implementationFactory);

        const { res: initialProxyBalance } = await proxy.call("get_balance");
        expect(initialProxyBalance).to.equal(0n); // proxy is using its own storage

        await account.invoke(proxy, "increase_balance", { amount1: 10, amount2: 20 });
        const { res: finalProxyBalance } = await proxy.call("get_balance");
        expect(finalProxyBalance).to.equal(30n);
    });
});
