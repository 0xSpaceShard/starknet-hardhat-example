import { expect } from "chai";
import { starknet } from "hardhat";
import { TIMEOUT } from "../test/constants";

describe("Library call", function () {
  this.timeout(TIMEOUT);

  it("should modify implementation contract", async function () {
    const implementationFactory = await starknet.getContractFactory("contract");
    const implementation = await implementationFactory.deploy({
      initial_balance: 0,
    });

    await implementation.invoke("increase_balance", {
      amount1: 10,
      amount2: 20,
    });

    const proxyFactory = await starknet.getContractFactory("contract_proxy");
    const proxy = await proxyFactory.deploy();
    console.log("Deployed proxy to", proxy.address);

    const { res: initialProxyBalance } = await proxy.call("call_get_balance", {
      contract_address: implementation.address,
    });
    expect(initialProxyBalance).to.equal(30n); // proxy NOT using its own storage

    await proxy.invoke("call_increase_balance", {
      contract_address: implementation.address,
      amount1: 10,
      amount2: 20,
    });

    const { res: finalProxyBalance } = await proxy.call("call_get_balance", {
      contract_address: implementation.address,
    });
    expect(finalProxyBalance).to.equal(60n);

    const { res: finalImplementationBalance } = await implementation.call(
      "get_balance"
    );
    expect(finalImplementationBalance).to.equal(60n); // proxy and implementation used same storage
  });

  it("should modify calling contract", async function () {
    const implementationFactory = await starknet.getContractFactory("contract");
    const implementationClassHash = await implementationFactory.declare();

    // uses delegate proxy defined in contracts/delegate_proxy.cairo
    const proxyFactory = await starknet.getContractFactory("contract_proxy");
    const proxy = await proxyFactory.deploy();
    console.log("Deployed proxy to", proxy.address);

    const { res: initialProxyBalance } = await proxy.call("get_my_balance", {
      class_hash: implementationClassHash,
    });
    expect(initialProxyBalance).to.equal(0n); // proxy is using its own storage

    await proxy.invoke("increase_my_balance", {
      class_hash: implementationClassHash,
      amount1: 10,
      amount2: 20,
    });

    const { res: finalProxyBalance } = await proxy.call("get_my_balance", {
      class_hash: implementationClassHash,
    });
    expect(finalProxyBalance).to.equal(30n);
  });
});
