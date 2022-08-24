import { expect } from "chai";
import { starknet } from "hardhat";
import { TIMEOUT } from "../test/constants";

describe("Delegate proxy", function () {
    this.timeout(TIMEOUT);

    it("should forward to the implementation contract", async function () {
        const implementationFactory = await starknet.getContractFactory("contract");
        const implementationClassHash = await implementationFactory.declare();

        // uses delegate proxy defined in contracts/delegate_proxy.cairo
        const proxyFactory = await starknet.getContractFactory("delegate_proxy");
        const proxy = await proxyFactory.deploy({
            implementation_hash_: implementationClassHash
        });
        console.log("Deployed proxy to", proxy.address);

        proxy.setImplementation(implementationFactory);

        const { res: initialProxyBalance } = await proxy.call("get_balance");
        expect(initialProxyBalance).to.equal(0n); // proxy is using its own storage

        await proxy.invoke("increase_balance", { amount1: 10, amount2: 20 });
        const { res: finalProxyBalance } = await proxy.call("get_balance");
        expect(finalProxyBalance).to.equal(30n);
    });
});
